"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useAuth } from "../../lib/auth/AuthContext";
import { FiMenu, FiX, FiBell } from "react-icons/fi";
import { BsChatLeftDots } from "react-icons/bs";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";
import Avatar from "../both/Avatar";
import Link from "next/link";
import { useNotifications } from "../../lib/notifications/NotificationsContext";
import UserAccountDropdown from "../both/UserAccountDropdown";
import { fetchRecentMessages, markChatAsSeen } from "../../services/chatService";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const buildApiUrl = (path) => {
  const base = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";
  return `${base}${path}`;
};

export default function DashboardNavbar({ isOpen, toggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, getToken, userId, updateUserState } = useAuth();
  const router = useRouter();
  const { notifications, unreadCount, messageCount, markRead, markAll, add } = useNotifications();
  const [openNotif, setOpenNotif] = useState(false);
  const [openMsg, setOpenMsg] = useState(false);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const notifRef = useRef(null);
  const msgRef = useRef(null);

  const getNotifTarget = (n) => {
    try {
      const type = n?.type;
      const meta = n?.meta || {};
      if (type === "message") {
        if (meta.chatId) return `/dashboard/messages?chatId=${encodeURIComponent(meta.chatId)}`;
        return "/dashboard/messages";
      }
      if (type === "car" || type === "status") {
        return "/dashboard/cars";
      }
      return "/dashboard/notifications";
    } catch {
      return "/dashboard/notifications";
    }
  };

  const handleNotifClick = async (n) => {
    try {
      if (!n.read) await markRead(n.id);
    } catch { }
    setOpenNotif(false);
    router.push(getNotifTarget(n));
  };

  // No dropdown anymore

  // Close dropboxes when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
      if (msgRef.current && !msgRef.current.contains(e.target)) setOpenMsg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch real messages from API when messages dropdown opens
  const loadRecentMessages = useCallback(async () => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const messages = await fetchRecentMessages();
      // Filter out own messages
      const myId = String(user?.id || user?._id);
      const filtered = messages.filter(msg => String(msg.sender?.id) !== myId);
      setRecentMessages(filtered);
    } catch (e) {
      console.error('[DashboardNavbar] Failed to load recent messages:', e);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  // Load messages when dropdown opens
  useEffect(() => {
    if (openMsg) {
      loadRecentMessages();
    }
  }, [openMsg, loadRecentMessages]);

  const displayMessages = useMemo(() => recentMessages, [recentMessages]);

  // Logout moved to Sidebar

  return (
    <header className="w-full h-16 px-4 bg-white dark:bg-dark-panel shadow-md flex justify-between items-center z-30 sticky top-0 transition-colors duration-300">
      {/* Logo Section - Left Side */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Rofrof" className="h-10 md:h-12 w-auto object-contain dark:hidden" />
          <img src="/whitelogo.png" alt="Rofrof" className="h-10 md:h-12 w-auto object-contain hidden dark:block" />
        </Link>
      </div>

      <div className="flex items-center space-x-1 md:space-x-3">
        {/* Theme Toggle */}
        <ThemeToggle size={22} />

        {/* Messages Icon & Dropdown */}
        <div className="relative" ref={msgRef}>
          <button
            onClick={() => setOpenMsg(!openMsg)}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-raised text-gray-700 dark:text-dark-text-secondary transition-colors"
            title="Messages"
          >
            <BsChatLeftDots className="w-5 h-5" />
            {messageCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                {messageCount > 9 ? "9+" : messageCount}
              </span>
            )}
          </button>

          {openMsg && (
            <div className="fixed md:absolute inset-x-4 md:inset-auto md:right-0 mt-2 md:w-80 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl shadow-xl z-50 overflow-hidden transform md:translate-x-0">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-dark-divider">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Wiadomości</div>
                <Link href="/dashboard/messages" onClick={() => setOpenMsg(false)} className="text-xs text-blue-600 hover:underline">Otwórz czat</Link>
              </div>
              <div className="max-h-96 overflow-auto">
                {loadingMessages ? (
                  <div className="px-3 py-4 text-sm text-gray-500">Ładowanie...</div>
                ) : displayMessages.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500">Brak wiadomości</div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-dark-divider">
                    {displayMessages.map((msg) => (
                      <li
                        key={msg.chatId}
                        className={`px-3 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-raised ${msg.unreadCount === 0 ? "opacity-60" : ""}`}
                        onClick={async () => {
                          setOpenMsg(false);
                          await markChatAsSeen(msg.chatId);
                          // Refresh to update unread counts
                          loadRecentMessages();
                          router.push(`/dashboard/messages?chatId=${encodeURIComponent(msg.chatId)}`);
                        }}
                      >
                        <Avatar src={msg.sender?.image} alt={msg.sender?.name} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {msg.sender?.name || "Użytkownik"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-dark-text-muted line-clamp-1">
                            {msg.attachments?.length > 0
                              ? `${msg.attachments.length} załącznik${msg.attachments.length > 1 ? 'ów' : ''}`
                              : msg.content || "Nowa wiadomość"}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
                        </div>
                        {msg.unreadCount > 0 && (
                          <div className="mt-2 min-w-[18px] h-[18px] px-1.5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {msg.unreadCount > 9 ? '9+' : msg.unreadCount}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="px-3 py-2 border-t border-gray-100 dark:border-dark-divider text-center">
                <Link href="/dashboard/messages" onClick={() => setOpenMsg(false)} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">
                  Zobacz wszystkie wiadomości
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setOpenNotif((v) => !v)}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-raised text-gray-700 dark:text-dark-text-secondary"
          >
            <FiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {openNotif && (
            <div className="fixed md:absolute inset-x-4 md:inset-auto md:right-0 mt-2 md:w-80 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl shadow-xl z-50 overflow-hidden transform md:translate-x-0">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-dark-divider">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 dark:text-white">Powiadomienia</div>
                <button onClick={markAll} className="text-xs text-blue-600 hover:underline">Oznacz wszystkie jako przeczytane</button>
              </div>
              <div className="max-h-96 overflow-auto">
                {(notifications || []).length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500">Brak powiadomień</div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-dark-divider">
                    {(notifications || []).slice(0, 8).map((n) => (
                      <li
                        key={n.id}
                        className={`px-3 py-2 flex items-start gap-3 ${n.read ? "opacity-80" : ""} cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-raised`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? "bg-gray-300" : "bg-blue-500"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200 dark:text-dark-text-primary truncate">{n.title}</div>
                          {n.body && <div className="text-xs text-gray-600 dark:text-dark-text-muted truncate">{n.body}</div>}
                          <div className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="px-3 py-2 border-t border-gray-100 dark:border-dark-divider text-right">
                <Link href="/dashboard/notifications" onClick={() => setOpenNotif(false)} className="text-sm text-blue-600 hover:underline">
                  Zobacz wszystkie
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown (Unified) - Desktop Only */}
        <div className="hidden md:block">
          <UserAccountDropdown />
        </div>

        {/* Mobile Sidebar Toggle - Merged with User Profile info */}
        <button
          onClick={toggleSidebar}
          className="md:hidden flex items-center gap-2 p-1.5 pl-2 pr-3 bg-gray-50 dark:bg-dark-raised border border-gray-200 dark:border-dark-divider rounded-full transition-all active:scale-95"
          aria-label="Toggle Navigation"
        >
          {user && (
            <Avatar
              src={user?.image || user?.profilePicture}
              alt={user?.firstName || "User"}
              size={24}
              className="ring-1 ring-blue-500/20"
            />
          )}
          <div className="text-gray-700 dark:text-gray-300">
            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </div>
        </button>
      </div>
    </header>
  );
}
