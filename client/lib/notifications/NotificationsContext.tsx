"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { usePathname } from "next/navigation";
import {
  fetchNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  markTypeReadAsync,
  type NotificationItem,
} from "../../services/notificationService";
import { getPetsByUserId } from "../../services/petService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const isProd = typeof window !== "undefined" ? window.location.hostname !== "localhost" : process.env.NODE_ENV === "production";
const SOCKET_BASE = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL || (isProd ? "https://ojest.pl" : "http://localhost:5000");
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io/";

export type NotificationsContextType = {
  notifications: NotificationItem[];
  unreadCount: number; // For the bell (excludes messages)
  messageCount: number; // For the messages icon
  add: (n: Omit<NotificationItem, "id" | "createdAt" | "read">) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markTypeRead: (type: string) => Promise<void>;
  markAll: () => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, getToken, userId } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const prevCarsRef = useRef<Record<string, any>>({});
  const recentNotificationsRef = useRef<Set<string>>(new Set());

  // Separate counts for the bell and the messages icon
  const unreadCount = useMemo(() =>
    notifications.filter((n) => !n.read && n.type !== "message").length,
    [notifications]);

  const messageCount = useMemo(() =>
    notifications.filter((n) => !n.read && n.type === "message").length,
    [notifications]);

  const refresh = useCallback(async () => {
    const list = await fetchNotifications();
    // sort desc by createdAt  
    const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotifications(sorted);
  }, []);

  const add = useCallback(async (n: Omit<NotificationItem, "id" | "createdAt" | "read">) => {
    // Build a stable dedupe key prioritizing IDs over localized titles/bodies
    let key = n.type;
    const meta: Record<string, any> = n.meta || {};
    if (n.type === "message") {
      const mid = meta.messageId || meta.msgId || meta.id;
      const cid = meta.chatId || meta.chat || meta.threadId;
      if (mid || cid) key += `-m:${mid || ''}-c:${cid || ''}`;
      else key += `-${n.title || ''}-${n.body || ''}`;
    } else if (n.type === "car" || n.type === "status") {
      const car = meta.carId || meta.id;
      const st = meta.status || '';
      if (car) key += `-car:${car}-st:${st}`;
      else key += `-${n.title || ''}-${n.body || ''}`;
    } else {
      key += `-${n.title || ''}-${n.body || ''}`;
    }

    // Skip if we just added this notification recently (within 5 seconds)
    if (recentNotificationsRef.current.has(key)) {
      console.log('[Notifications] Skipping duplicate notification:', key);
      return;
    }

    // Mark as recent
    recentNotificationsRef.current.add(key);
    setTimeout(() => recentNotificationsRef.current.delete(key), 5000);

    const saved = await createNotification(n);
    setNotifications((prev) => [saved, ...prev]);
  }, []);

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markTypeRead = useCallback(async (type: string) => {
    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => (n.type === type ? { ...n, read: true } : n)));
    try {
      await markTypeReadAsync(type);
    } catch (e) {
      console.error(`[Notifications] Failed to mark ${type} read on server/local:`, e);
    }
  }, []);

  const markAll = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Automatically clear message notifications when viewing the messages page
  useEffect(() => {
    if (pathname === "/dashboard/messages" && messageCount > 0) {
      markTypeRead("message");
    }
  }, [pathname, messageCount, markTypeRead]);

  // Listen to custom DOM events from other parts of the app
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const detail = ce.detail || {};
      if (detail && detail.title && detail.type) {
        add({ type: detail.type, title: detail.title, body: detail.body, meta: detail.meta });
      }
    };
    window.addEventListener("ojest:notify", handler as EventListener);
    return () => window.removeEventListener("ojest:notify", handler as EventListener);
  }, [add]);

  // Optional: Socket listeners for backend events
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;
    const token = getToken();
    console.log('[Notifications] Connecting to socket:', SOCKET_BASE, 'with path:', SOCKET_PATH);
    const socket = io(SOCKET_BASE, {
      path: SOCKET_PATH,
      autoConnect: true,
      withCredentials: true,
      auth: {
        token,
        userId: user.id || user._id
      }
    });

    socket.on("connect", () => {
      console.log("[Notifications] Socket connected, joining room:", user.id || user._id);
      socket.emit("auth", { userId: user.id || user._id, token });
      socket.emit("join", user.id || user._id);
    });

    socket.on("connect_error", (err: any) => {
      console.error("[Notifications] Socket connection error:", err?.message || err);
      console.error("[Notifications] Attempted connection to:", SOCKET_BASE);
      console.error("[Notifications] With path:", SOCKET_PATH);
      console.error("[Notifications] Full error:", err);
    });

    socket.on("disconnect", (reason: string) => {
      console.warn("[Notifications] Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        console.log("[Notifications] Attempting to reconnect...");
        socket.connect();
      }
    });

    socket.on("chat:message:received", (payload: any) => {
      const senderObj = payload?.sender || {};
      const senderName = payload?.senderName || senderObj.name || senderObj.firstName || "Ktoś";
      const senderImage = payload?.senderImage || senderObj.profilePicture || senderObj.image || "";

      add({
        type: "message",
        title: "Nowa wiadomość",
        body: `${senderName}: ${payload.content || payload.message?.content || "Otrzymałeś wiadomość"}`,
        meta: {
          ...payload,
          senderName,
          senderImage
        }
      });
    });

    socket.on("car:created", (car: any) => {
      add({ type: "car", title: "Dodano ogłoszenie", body: `${car?.make || "Samochód"} ${car?.model || ""}`.trim(), meta: { carId: car?._id } });
    });

    socket.on("car:status", (data: any) => {
      let title = "Aktualizacja statusu";
      let body = "Status zaktualizowany";

      if (data?.status === "Approved") {
        title = "Samochód zatwierdzony";
        body = "Twój samochód został zatwierdzony";
      } else if (data?.status === "Rejected") {
        title = "Samochód odrzucony";
        body = "Twój samochód został odrzucony, spróbuj ponownie";
      } else if (data?.status === "Pending") {
        title = "Status samochodu";
        body = "Twój samochód oczekuje na zatwierdzenie";
      }

      add({ type: "status", title, body, meta: data });
    });

    // Global message listener - works on ALL pages
    socket.on("newMessage", (payload: any) => {
      if (!payload || !payload.message) return;
      const { chatId, message } = payload;

      // Use userId from useAuth hook (already robust)
      const currentUserId = userId;

      // Extract sender info from payload.message.sender (now populated from backend)
      const senderObj = message.sender || {};
      const senderId = senderObj._id || senderObj.id || message.sender; // fallback to raw
      const senderName = senderObj.firstName || senderObj.name || "Ktoś";
      const senderImage = senderObj.profilePicture || senderObj.image || "";

      // Only notify if message is from someone else
      if (currentUserId && String(senderId) !== String(currentUserId)) {
        console.log("[Notifications] New message received:", { chatId, senderId, content: message.content });
        add({
          type: "message",
          title: "Nowa wiadomość",
          body: `${senderName}: ${message.content || "Masz nową wiadomość"}`,
          meta: {
            chatId,
            messageId: message.id,
            senderName,
            senderImage
          }
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, add]);

  // Fallback: poll user's cars and detect new cars or status changes
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let isFirstRun = true;

    const poll = async () => {
      try {
        const cars = await getPetsByUserId(String(userId), getToken);
        if (cancelled || !Array.isArray(cars)) return;

        const map: Record<string, any> = {};
        cars.forEach((c: any) => {
          map[c._id] = { status: c.status, title: c.title, make: c.make, model: c.model };
        });

        // Skip creation/status detection on first run (just set baseline)
        if (!isFirstRun) {
          // Skip car creation notifications - they're handled elsewhere
          // Just update the ref without creating notifications

          // Detect status changes
          Object.keys(map).forEach((id) => {
            const prev = prevCarsRef.current[id];
            if (prev && prev.status !== map[id].status) {
              console.log("[Notifications] Status changed:", id, prev.status, "->", map[id].status);

              let title = "Aktualizacja statusu";
              let body = "Status zaktualizowany";

              if (map[id].status === "Approved") {
                title = "Samochód zatwierdzony";
                body = "Twój samochód został zatwierdzony";
              } else if (map[id].status === "Rejected") {
                title = "Samochód odrzucony";
                body = "Twój samochód został odrzucony, spróbuj ponownie";
              } else if (map[id].status === "Pending") {
                title = "Status samochodu";
                body = "Twój samochód oczekuje na zatwierdzenie";
              }

              add({
                type: "status",
                title,
                body,
                meta: { carId: id, status: map[id].status },
              });
            }
          });
        } else {
          console.log("[Notifications] First run - setting baseline with", Object.keys(map).length, "cars");
          isFirstRun = false;
        }

        prevCarsRef.current = map;
      } catch (e) {
        console.error("[Notifications] Poll error:", e);
      }
    };

    // initial and interval
    poll();
    const t = setInterval(poll, 30000); // Check every 30 seconds
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [userId, getToken, add]);

  const value: NotificationsContextType = { notifications, unreadCount, messageCount, add, markRead, markTypeRead, markAll, refresh };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
