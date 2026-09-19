// frontend/app/messages/page.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FaPaperPlane, FaBars, FaEnvelope, FaPaperclip, FaTimes, FaFileAlt, FaFileImage } from "react-icons/fa";
import { useAuth } from "../../../lib/auth/AuthContext";
import io from "socket.io-client";
import Avatar from "../../../components/both/Avatar";
import { uploadImageBatch } from "../../../services/petService";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const isProd = typeof window !== "undefined" ? window.location.hostname !== "localhost" : process.env.NODE_ENV === "production";
const SOCKET_BASE = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL || (isProd ? "https://ojest.pl" : "http://localhost:5000");
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io/";
const SOCKET_TRANSPORT = (process.env.NEXT_PUBLIC_SOCKET_TRANSPORT || "websocket,polling")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const socket = io(SOCKET_BASE, {
  path: SOCKET_PATH,
  autoConnect: false,
  withCredentials: true,
  transports: SOCKET_TRANSPORT,
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

const MessagesPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const { user, token, userId: authUserId } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (authUserId) {
      socket.emit("join", authUserId);
    }

    // return () => {
    //   socket.disconnect();
    // };
  }, [authUserId]);

  // Helper: current user ID across backends (_id or id)
  // Try multiple sources to get the user ID
  const myUserId = user?.id || user?._id || authUserId;

  // Date/Time formatters: DD/MM/YY and 24-hour HH:mm
  const fmtDateTime = (d) => {
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${mi}`;
  };
  const fmtTime = (d) => {
    const date = new Date(d);
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
  };

  // Format date for separators (Today, Yesterday, or DD/MM/YYYY)
  const fmtDateSeparator = (d) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  };

  // Check if two dates are the same day
  const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.toDateString() === date2.toDateString();
  };

  // Generate temporary ID for optimistic updates
  const generateTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Connect to Socket.IO and fetch chats
  useEffect(() => {
    if (!user) {
      console.warn("⚠️ No user, skipping socket connection");

      return;
    }

    // Socket connection established

    if (!myUserId) {
      console.error("No valid user ID found");
      return;
    }



    // Remove all old listeners to prevent duplicates
    socket.removeAllListeners();

    // Set new auth for this user
    socket.auth = { userId: myUserId };
    // Connect socket

    socket.connect();

    // Add timeout to detect if connection is hanging
    const connectionTimeout = setTimeout(() => {
      if (!socket.connected) {
        console.error("Socket connection timeout");
      }
    }, 5000);

    socket.on("connect", () => {
      clearTimeout(connectionTimeout);
      console.log("[Socket] Connected");

      // Join room after connection is established
      if (myUserId) {
        socket.emit("join", myUserId);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connect error:", err?.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected:", reason);
    });

    const fetchChats = async () => {
      try {
        // Fetching chats

        // Use fetch with explicit error handling
        const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        const response = await fetch(`${API_BASE}/chat/my-chats`, {
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        });


        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to fetch chats: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        const chatsArray = Array.isArray(data) ? data : data.chats || [];
        const sortedChats = [...chatsArray].sort((a, b) => {
          const ta = new Date(a?.lastMessage?.timestamp || a?.updatedAt || 0).getTime();
          const tb = new Date(b?.lastMessage?.timestamp || b?.updatedAt || 0).getTime();
          return tb - ta;
        });
        setChats(sortedChats);
        // totalUnread may be computed on server or we compute locally
        const initialUnread = sortedChats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(typeof data.totalUnread === "number" ? data.totalUnread : initialUnread);
        if (sortedChats.length > 0) {
          const targetId = searchParams?.get("chatId");
          if (targetId) {
            const match = sortedChats.find((c) => String(c._id) === String(targetId));
            setSelectedChat(match || sortedChats[0]);
          } else {
            setSelectedChat(sortedChats[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError(`Failed to load chats: ${err.message}`);
      }
    };

    fetchChats();

    // Listen for errors
    socket.on("error", (message) => {
      console.error("Socket error");
      setError(
        typeof message === "string"
          ? message
          : message.message || "An error occurred"
      );
    });

    // Listen for chat updates (if emitted by backend elsewhere)
    socket.on("updatedChats", (updatedChats) => {
      const sorted = [...(updatedChats || [])].sort((a, b) => {
        const ta = new Date(a?.lastMessage?.timestamp || a?.updatedAt || 0).getTime();
        const tb = new Date(b?.lastMessage?.timestamp || b?.updatedAt || 0).getTime();
        return tb - ta;
      });
      setChats(sorted);

      // Calculate total unread manually from chat data
      const newTotalUnread = (updatedChats || []).reduce((sum, chat) => {
        const unreadCount = chat.unreadCount || 0;
        return sum + unreadCount;
      }, 0);
      setTotalUnread(newTotalUnread);

      // If we have a selected chat, update it with the latest data
      if (selectedChat) {
        const updatedSelectedChat = updatedChats.find(
          (chat) => chat._id === selectedChat._id
        );
        // Only update if something meaningful changed to avoid effect re-runs
        if (updatedSelectedChat && JSON.stringify(updatedSelectedChat) !== JSON.stringify(selectedChat)) {
          setSelectedChat((prev) => (prev && prev._id === updatedSelectedChat._id ? { ...prev, ...updatedSelectedChat } : prev));
        }
      }
    });

    // Listen for total unread count updates
    socket.on("totalUnreadCount", (count) => {
      setTotalUnread(count || 0);
    });

    // Request total unread count periodically
    const unreadInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("getTotalUnreadCount");
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearTimeout(connectionTimeout);
      // socket.disconnect();
      socket.off("error");
      socket.off("updatedChats");
      socket.off("totalUnreadCount");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      clearInterval(unreadInterval);
    };
  }, [user, searchParams]);

  // Fetch messages when selected chat ID changes
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      try {

        const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        const response = await fetch(
          `${API_BASE}/chat/${selectedChat._id}/messages`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
          }
        );


        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to fetch messages: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();

        // Ensure messages have text field for display consistency
        const processedData = data.map((msg) => ({
          ...msg,
          text: msg.text || msg.content, // Use text if available, otherwise use content
        }));

        // Preserve any pending messages when loading chat history
        setMessages((prev) => {
          const pendingMessages = prev.filter((m) => m.pending && m.chatId === selectedChat._id);
          return [...processedData, ...pendingMessages];
        });
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(`Failed to load messages: ${err.message}`);
      }
    };

    fetchMessages();

    socket.on("newMessage", (payload) => {
      // Backend emits: { chatId, message: { id, content, sender, timestamp } }
      if (!payload || !payload.message) return;
      const { chatId, message } = payload;
      const currentUserId = user?.id || user?._id || authUserId;


      const senderId = (typeof message.sender === 'object' && message.sender?._id)
        ? message.sender._id
        : message.sender;

      const processedMessage = {
        _id: message.id,
        chatId,
        sender: senderId, // We store string ID for internal consistency
        content: message.content,
        text: message.content,
        attachments: message.attachments || [],
        tempId: payload.tempId, // Pass through tempId for matching
        createdAt: message.timestamp,
      };

      console.log("📦 Processed message:", processedMessage);

      // Emit notification if message is from someone else
      if (String(senderId) !== String(currentUserId)) {
        try {
          window.dispatchEvent(
            new CustomEvent("ojest:notify", {
              detail: {
                type: "message",
                title: "New message",
                body: message.content || "You have a new message",
                meta: { chatId, messageId: message.id },
              },
            })
          );
        } catch (e) {
          console.error("Failed to dispatch notification:", e);
        }
      }

      // Add a readable senderName for display
      try {
        if (String(senderId) === String(currentUserId)) {
          processedMessage.senderName = "You";
        } else if (selectedChat) {
          // Try to resolve other participant name from selectedChat
          let name = null;
          if (Array.isArray(selectedChat.participantData) && selectedChat.participantData.length > 0) {
            const other = selectedChat.participantData.find((p) => !p.isCurrentUser);
            name = other?.name || `${other?.firstName || ""} ${other?.lastName || ""}`.trim();
          }
          if (!name && Array.isArray(selectedChat.participants)) {
            const meId = myUserId;
            const other = selectedChat.participants.find((p) => String(p.id) !== String(meId));
            name = `${other?.firstName || ""} ${other?.lastName || ""}`.trim() || other?.email;
          }
          processedMessage.senderName = name || "Unknown";
        }
      } catch (_) {
        processedMessage.senderName = processedMessage.senderName || "Unknown";
      }

      // Update chat list: lastMessage and unreadCount
      setChats((prevChats) => {
        const updated = (prevChats || []).map((c) => {
          if (c._id !== chatId) return c;
          const isIncoming = String(senderId) !== String(currentUserId);
          return {
            ...c,
            lastMessage: {
              content: message.content,
              sender: senderId,
              timestamp: message.timestamp,
            },
            unreadCount:
              selectedChat && selectedChat._id === chatId
                ? 0
                : (c.unreadCount || 0) + (isIncoming ? 1 : 0),
          };
        });
        // Recompute total unread from updated list
        const total = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(total);
        return updated;
      });

      // If current chat is open, append/replace in thread
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) => {

          // Check if this is our own message by matching sender
          const isOwnMessage = String(senderId) === String(currentUserId);

          if (isOwnMessage) {
            // Match by tempId if possible (backend should return it if we sent it)
            const incomingTempId = payload.tempId || message.tempId;

            let pendingIdx = -1;

            if (incomingTempId) {
              pendingIdx = prev.findIndex(m => m.pending && (m.tempId === incomingTempId || m._id === incomingTempId));
            }

            // Fallback to content matching if no tempId match
            if (pendingIdx === -1) {
              const searchText = (processedMessage.text || "").trim();
              for (let i = prev.length - 1; i >= 0; i--) {
                const pendingText = (prev[i].text || "").trim();
                if (prev[i].pending && pendingText === searchText) {
                  pendingIdx = i;
                  break;
                }
              }
            }

            if (pendingIdx !== -1) {
              // Replace the optimistic message with the real one
              const copy = [...prev];
              copy[pendingIdx] = { ...processedMessage, pending: false, senderName: "You" };
              return copy;
            } else {
              // No pending message found
              // If we couldn't find it but it's our own message, it might have arrived before we even finished our local state update
              // (rare but possible). In this case, just treat it as a new message.
            }
          }

          // Check if message already exists (avoid duplicates)
          const exists = prev.some((m) => m._id === processedMessage._id || (processedMessage.tempId && m.tempId === processedMessage.tempId && !m.pending));
          if (exists) {
            return prev;
          }

          // Add new message
          return [...prev, processedMessage];
        });

        // If an incoming message arrives while chat is open, mark it read now
        if (String(senderId) !== String(currentUserId)) {
          socket.emit("markAsRead", { chatId, userId: currentUserId });
          // Also ensure its unreadCount is 0 locally
          setChats((prev) =>
            (prev || []).map((c) => (c._id === chatId ? { ...c, unreadCount: 0 } : c))
          );
          // Recompute total unread
          setTotalUnread((prev) => {
            const list = (chats || []).map((c) =>
              c._id === chatId ? { ...c, unreadCount: 0 } : c
            );
            return list.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          });
        }
      }
    });

    socket.on("messagesSeen", (updatedMessages) => {
      // Ensure all messages have text field
      const processedMessages = updatedMessages.map((msg) => ({
        ...msg,
        text: msg.text || msg.content,
      }));

      setMessages((prev) =>
        prev.map((msg) => {
          const updatedMsg = processedMessages.find((m) => m._id === msg._id);
          return updatedMsg
            ? { ...updatedMsg, text: updatedMsg.text || updatedMsg.content }
            : msg;
        })
      );
    });

    socket.on("typing", ({ userId, chatId }) => {
      if (chatId === selectedChat._id && String(userId) !== String(myUserId)) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
      alert(`Socket Error: ${error.message || "Something went wrong"}`);
      if (error.tempId) {
        setMessages(prev => prev.filter(m => m._id !== error.tempId));
      }
    });

    return () => {
      socket.off("chatHistory");
      socket.off("newMessage");
      socket.off("messagesSeen");
      socket.off("typing");
      socket.off("error");
    };
  }, [selectedChat?._id, user]);

  // Helper to download files (especially for extensionless raw files)
  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, '_blank'); // Fallback
    }
  };

  // Using carService's uploadImageBatch for consistency
  const getTokenCallback = async () => token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  // Handle sending a message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !selectedChat || !user) return;

    const tempId = generateTempId();
    const messageContent = newMessage;
    const timestamp = new Date();

    // Optimistic attachments (with local preview URLs)
    const optimisticAttachments = attachments.map(file => {
      let previewUrl = null;
      try {
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }
      } catch (e) {
        console.error("Failed to create preview URL:", e);
      }

      return {
        name: file.name,
        type: file.type,
        size: file.size,
        url: previewUrl,
        isLocal: true, // Tag to know we should revoke it later
      };
    });

    // Add optimistic message immediately
    const optimisticMessage = {
      _id: tempId,
      chatId: selectedChat._id,
      sender: myUserId,
      senderId: myUserId,
      createdAt: timestamp,
      seenBy: [myUserId],
      senderName: "You",
      content: messageContent,
      text: messageContent,
      attachments: optimisticAttachments,
      pending: true,
      tempId: tempId,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    // We don't clear attachments yet, in case upload fails
    const currentAttachments = [...attachments];
    setAttachments([]);

    try {
      // Upload attachments to Cloudinary using the "normal way"
      let finalAttachments = [];
      if (currentAttachments.length > 0) {
        console.log("📤 [NormalWay] Uploading to Cloudinary...");
        const result = await uploadImageBatch(currentAttachments, undefined, getTokenCallback);

        if (!result.success) {
          throw new Error(result.errors?.[0] || "Cloudinary upload failed");
        }

        console.log("✅ [NormalWay] Cloudinary Success. URLs:", result.urls);

        // Construct full attachment objects
        finalAttachments = currentAttachments.map((file, idx) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: result.urls[idx]
        }));
      }

      console.log("🚀 Sending via socket. attachments:", finalAttachments);

      // Check socket connection
      if (!socket.connected) {
        socket.connect(); // Try to reconnect
        // Wait a bit
        await new Promise(r => setTimeout(r, 1000));
        if (!socket.connected) throw new Error("Connection lost. Please refresh.");
      }

      // Emit message with Cloudinary URLs
      const payload = {
        chatId: selectedChat._id,
        senderId: myUserId,
        content: messageContent,
        tempId: tempId,
        attachments: JSON.parse(JSON.stringify(finalAttachments)),
      };

      socket.emit("sendMessage", payload);

      console.log("🚀 Message emitted via socket");

      // Revoke local URLs after a short delay
      setTimeout(() => {
        optimisticAttachments.forEach(att => {
          if (att.isLocal && att.url) URL.revokeObjectURL(att.url);
        });
      }, 10000);

    } catch (error) {
      console.error("❌ Failed to send message:", error);
      alert(`Failed to send message: ${error.message}`);

      // Remove the optimistic message
      setMessages(prev => prev.filter(m => m._id !== tempId));
      // Restore attachments so user can try again
      setAttachments(currentAttachments);
      // Restore message text
      setNewMessage(messageContent);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedChat && user) {
      socket.emit("typing", { chatId: selectedChat._id, userId: myUserId });
    }
  };

  // Get other participant's name
  const getParticipantName = (chat) => {
    if (!chat) return "Unknown";
    // Prefer participantData if present
    if (Array.isArray(chat.participantData) && chat.participantData.length > 0) {
      const other = chat.participantData.find((p) => !p.isCurrentUser);
      if (other?.name) return other.name;
    }
    // Fallback to participants array from backend controller
    if (Array.isArray(chat.participants)) {
      const meId = myUserId;
      const other = chat.participants.find((p) => String(p.id) !== String(meId));
      if (other) {
        const name = `${other.firstName || ""} ${other.lastName || ""}`.trim();
        return name || other.email || "Unknown";
      }
    }
    return "Unknown";
  };

  // Resolve other participant's image (supports various backend shapes)
  const getParticipantImage = (chat) => {
    if (!chat) return null;
    // Prefer participantData if present
    if (Array.isArray(chat.participantData) && chat.participantData.length > 0) {
      const other = chat.participantData.find((p) => !p.isCurrentUser);
      return other?.image || other?.profilePicture || null;
    }
    // Fallback to participants array
    if (Array.isArray(chat.participants)) {
      const meId = myUserId;
      const other = chat.participants.find((p) => String(p.id) !== String(meId));
      return other?.image || other?.profilePicture || null;
    }
    return null;
  };

  // Select a chat and mark as read
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowSidebar(false);

    // Mark messages as seen when selecting a chat
    if (chat && chat._id) {
      socket.emit("markAsRead", {
        chatId: chat._id,
        userId: myUserId,
      });

      // Update local unread count immediately for better UX
      const updatedChats = chats.map((c) => {
        if (c._id === chat._id) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });

      setChats(updatedChats);

      // Recalculate total unread count
      const newTotalUnread = updatedChats.reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      );
      setTotalUnread(newTotalUnread);
    }
  };

  if (error) {
    return (
      <div className="marketing-ui flex min-h-[50vh] items-center justify-center p-8">
        <p className="text-sm font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="marketing-ui flex min-h-[50vh] items-center justify-center p-8">
        <p className="text-sm font-medium text-[#64748B]">
          Please log in to view messages.
        </p>
      </div>
    );
  }

  return (
    <div className="marketing-ui relative flex h-[calc(100vh-64px)] overflow-hidden bg-[#F4F7FB] dark:bg-dark-main">
      {/* Sidebar — absolute on mobile so title stays below dashboard navbar */}
      <div
        className={`absolute inset-0 z-20 flex flex-col border-r border-[#E2E8F0] bg-white transition-transform duration-300 dark:border-dark-divider dark:bg-dark-panel md:static md:inset-auto md:z-auto md:w-[340px] ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-5 dark:border-dark-divider">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              Wiadomości
            </h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
              Twoje konwersacje
            </p>
          </div>
          {totalUnread > 0 && (
            <span className="shrink-0 bg-[#2563EB] px-2.5 py-1 text-xs font-bold text-white">
              {totalUnread} nowych
            </span>
          )}
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {chats.length > 0 ? (
            chats.map((chat) => {
              const active = selectedChat && selectedChat._id === chat._id;
              return (
                <button
                  type="button"
                  key={chat._id}
                  className={`flex w-full items-center gap-3 border px-3 py-3 text-left transition ${
                    active
                      ? "border-[#2563EB]/40 bg-[#EEF2FF] dark:border-[#2563EB]/50 dark:bg-[#2563EB]/15"
                      : "border-transparent hover:border-[#E2E8F0] hover:bg-[#F8FAFC] dark:hover:border-dark-divider dark:hover:bg-dark-raised"
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      src={getParticipantImage(chat)}
                      alt={getParticipantName(chat)}
                      size={44}
                    />
                    {chat.unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 border-2 border-white bg-[#2563EB] dark:border-dark-panel" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm ${
                          chat.unreadCount > 0
                            ? "font-bold text-[#0F172A] dark:text-white"
                            : "font-semibold text-[#334155] dark:text-gray-200"
                        }`}
                      >
                        {getParticipantName(chat)}
                      </span>
                      {chat.lastMessage && (
                        <span className="shrink-0 text-[11px] font-medium text-[#94A3B8]">
                          {fmtTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        chat.unreadCount > 0
                          ? "font-semibold text-[#0F172A] dark:text-white"
                          : "text-[#64748B] dark:text-gray-400"
                      }`}
                    >
                      {chat.lastMessage ? (
                        <>
                          {String(chat.lastMessage.sender) === String(myUserId) ? (
                            <span className="text-[#94A3B8]">Ty: </span>
                          ) : null}
                          {chat.lastMessage.content || "Empty message"}
                        </>
                      ) : (
                        <span className="italic text-[#94A3B8]">
                          Rozpocznij konwersację
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15">
                <FaEnvelope size={20} />
              </div>
              <p className="text-sm font-medium text-[#64748B] dark:text-gray-400">
                Brak wiadomości
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-dark-panel">
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4 py-3.5 dark:border-dark-divider md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#E2E8F0] text-[#64748B] transition hover:border-[#2563EB] hover:text-[#2563EB] dark:border-dark-divider md:hidden"
              onClick={() => setShowSidebar((prev) => !prev)}
            >
              <FaBars className="h-4 w-4" />
            </button>
            {selectedChat ? (
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  src={getParticipantImage(selectedChat)}
                  alt={getParticipantName(selectedChat)}
                  size={42}
                />
                <div className="min-w-0">
                  <div className="truncate font-display text-base font-bold text-[#0F172A] dark:text-white">
                    {getParticipantName(selectedChat)}
                  </div>
                  {selectedChat.carId && (
                    <div className="mt-0.5 inline-block bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#2563EB] dark:bg-[#2563EB]/15">
                      AUTO: {selectedChat.carId.title || "Nieznane"}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm font-semibold text-[#94A3B8]">
                Wybierz konwersację
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto bg-[#F8FAFC] px-3 py-4 dark:bg-dark-main sm:px-5 md:px-6">
          {selectedChat ? (
            messages.length > 0 ? (
              <>
                {messages.map((message, index) => {
                  const showDateSeparator =
                    index === 0 ||
                    !isSameDay(message.createdAt, messages[index - 1].createdAt);
                  const messageSenderId =
                    typeof message.sender === "object" && message.sender?._id
                      ? message.sender._id
                      : message.sender || message.senderId;
                  const isMe = String(messageSenderId) === String(myUserId);
                  const prevSenderId =
                    index > 0
                      ? typeof messages[index - 1].sender === "object" &&
                        messages[index - 1].sender?._id
                        ? messages[index - 1].sender._id
                        : messages[index - 1].sender ||
                          messages[index - 1].senderId
                      : null;
                  const showSenderName =
                    !isMe &&
                    (index === 0 ||
                      showDateSeparator ||
                      String(prevSenderId) !== String(messageSenderId));
                  const isFirstInGroup =
                    index === 0 ||
                    showDateSeparator ||
                    String(prevSenderId) !== String(messageSenderId);

                  return (
                    <React.Fragment key={message._id || message.tempId}>
                      {showDateSeparator && (
                        <div className="my-3 flex justify-center">
                          <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-[11px] font-semibold text-[#64748B] dark:border-dark-divider dark:bg-dark-card dark:text-gray-400">
                            {fmtDateSeparator(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${isMe ? "justify-end" : "justify-start"} ${
                          isFirstInGroup ? "mt-1" : ""
                        }`}
                      >
                        <div
                          className={`w-fit max-w-[85%] break-words px-3.5 py-2.5 text-[14px] leading-relaxed sm:max-w-[75%] md:max-w-[65%] ${
                            isMe
                              ? `bg-[#2563EB] text-white ${
                                  isFirstInGroup
                                    ? "rounded-2xl rounded-br-md"
                                    : "rounded-2xl rounded-br-md"
                                }`
                              : `border border-[#E2E8F0] bg-white text-[#0F172A] dark:border-[#494952] dark:bg-[#303030] dark:text-[#e2e7e3] ${
                                  isFirstInGroup
                                    ? "rounded-2xl rounded-bl-md"
                                    : "rounded-2xl rounded-bl-md"
                                }`
                          } ${message.pending ? "opacity-70" : ""}`}
                          style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                        >
                          {showSenderName && (
                            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                              {message.senderName || "Użytkownik"}
                            </div>
                          )}

                          {message.attachments?.length > 0 && (
                            <div className="mb-2 space-y-2">
                              {message.attachments.map((att, attIdx) => {
                                const url =
                                  typeof att === "string" ? att : att.url;
                                const name =
                                  att.name ||
                                  (typeof att === "string"
                                    ? url.split("/").pop()
                                    : "Attachment");
                                const type = att.type || "";
                                const isImage =
                                  type.startsWith("image/") ||
                                  /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(
                                    url
                                  );

                                if (!url) {
                                  return (
                                    <div
                                      key={attIdx}
                                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm opacity-60 ${
                                        isMe
                                          ? "border-white/20 bg-white/10"
                                          : "border-[#E2E8F0] bg-[#F8FAFC] dark:border-dark-divider dark:bg-dark-raised"
                                      }`}
                                    >
                                      {type.startsWith("image/") ? (
                                        <FaFileImage />
                                      ) : (
                                        <FaFileAlt />
                                      )}
                                      <span className="max-w-[150px] truncate">
                                        {name}
                                      </span>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={attIdx} className="overflow-hidden rounded-xl">
                                    {isImage ? (
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                      >
                                        <img
                                          src={url}
                                          alt={name}
                                          className="max-h-[240px] w-full max-w-[240px] rounded-xl object-cover transition hover:opacity-90"
                                          loading="lazy"
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                              "flex";
                                          }}
                                        />
                                        <div
                                          style={{ display: "none" }}
                                          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-2.5 py-2"
                                        >
                                          <FaFileAlt />
                                          <span className="text-sm underline">
                                            {name}
                                          </span>
                                        </div>
                                      </a>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleDownload(url, name);
                                        }}
                                        className={`flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-sm transition ${
                                          isMe
                                            ? "border-white/20 bg-white/10 hover:bg-white/20"
                                            : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EEF2FF] dark:border-dark-divider dark:bg-dark-raised"
                                        }`}
                                      >
                                        <FaFileAlt />
                                        <span className="max-w-[150px] truncate underline">
                                          {name}
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {(message.text || message.content) && (
                            <p className="whitespace-pre-wrap">
                              {message.text || message.content}
                            </p>
                          )}

                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] font-medium ${
                              isMe
                                ? "text-blue-100/80"
                                : "text-[#94A3B8] dark:text-gray-500"
                            }`}
                          >
                            <span>{fmtTime(message.createdAt)}</span>
                            {isMe && (
                              <span>
                                {message.pending ? (
                                  <span className="animate-pulse">●</span>
                                ) : message.seenBy &&
                                  message.seenBy.length > 1 ? (
                                  "✓✓"
                                ) : (
                                  "✓"
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                {typing && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#E2E8F0] bg-white px-4 py-3 dark:border-[#494952] dark:bg-[#303030]">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94A3B8] [animation-delay:0s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94A3B8] [animation-delay:0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94A3B8] [animation-delay:0.2s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-0" />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-[#94A3B8]">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15">
                  <FaEnvelope size={22} />
                </div>
                <p className="text-sm font-semibold">
                  To początek Waszej rozmowy
                </p>
              </div>
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15">
                <FaPaperPlane size={24} className="ml-0.5" />
              </div>
              <p className="font-display text-lg font-bold text-[#0F172A] dark:text-white">
                Wybierz czat
              </p>
              <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
                Wybierz konwersację aby rozpocząć rozmowę
              </p>
            </div>
          )}
        </div>

        {selectedChat && (
          <div className="shrink-0 border-t border-[#E2E8F0] bg-white px-3 py-3 dark:border-dark-divider dark:bg-dark-panel sm:px-5">
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-medium text-[#0F172A] dark:border-dark-divider dark:bg-dark-raised dark:text-gray-200"
                  >
                    {file.type.startsWith("image/") ? (
                      <FaFileImage className="text-[#2563EB]" />
                    ) : (
                      <FaFileAlt className="text-[#2563EB]" />
                    )}
                    <span className="max-w-[100px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-[#94A3B8] transition hover:text-red-500"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1.5 transition focus-within:border-[#2563EB] dark:border-[#494952] dark:bg-[#303030]">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const MAX_SIZE = 10 * 1024 * 1024;
                  const oversized = files.filter((f) => f.size > MAX_SIZE);
                  if (oversized.length > 0) {
                    alert(
                      `File too large: ${oversized[0].name}\nMax size: 10MB (Cloudinary limit)\nYour file: ${(oversized[0].size / 1024 / 1024).toFixed(2)}MB\n\nTo upload larger files, upgrade your Cloudinary plan.`
                    );
                    e.target.value = "";
                    return;
                  }
                  setAttachments((prev) => [...prev, ...files]);
                  e.target.value = "";
                }}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-white hover:text-[#2563EB] dark:text-gray-400 dark:hover:bg-white/5"
                title="Add attachment"
              >
                <FaPaperclip size={16} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[15px] font-medium text-[#0F172A] outline-none placeholder:text-[#94A3B8] dark:text-[#e2e7e3] dark:placeholder:text-white/40"
                placeholder="Napisz wiadomość..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && attachments.length === 0}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] disabled:text-white dark:disabled:bg-[#494952] dark:disabled:text-white/40"
              >
                <FaPaperPlane size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
