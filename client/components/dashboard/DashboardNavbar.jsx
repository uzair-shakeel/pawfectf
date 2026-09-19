"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import { useLanguage } from "../../lib/i18n/LanguageContext";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const buildApiUrl = (path) => {
  const base = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";
  return `${base}${path}`;
};

export default function DashboardNavbar({ isOpen, toggleSidebar }) {
  const { t } = useLanguage();
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

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
      if (msgRef.current && !msgRef.current.contains(e.target)) setOpenMsg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadRecentMessages = useCallback(async () => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const messages = await fetchRecentMessages();
      const myId = String(user?.id || user?._id);
      const filtered = messages.filter((msg) => String(msg.sender?.id) !== myId);
      setRecentMessages(filtered);
    } catch (e) {
      console.error("[DashboardNavbar] Failed to load recent messages:", e);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  useEffect(() => {
    if (openMsg) {
      loadRecentMessages();
    }
  }, [openMsg, loadRecentMessages]);

  const displayMessages = useMemo(() => recentMessages, [recentMessages]);

  const iconBtn =
    "relative flex h-10 w-10 items-center justify-center text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-gray-400 dark:hover:bg-dark-raised dark:hover:text-white";

  const dropdownShell =
    "fixed inset-x-4 z-50 mt-2 overflow-hidden border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card md:absolute md:inset-auto md:right-0 md:w-80";

  return (
    <header className="marketing-ui sticky top-0 z-30 box-border flex h-16 min-h-16 max-h-16 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 transition-colors duration-300 dark:border-dark-divider dark:bg-dark-card sm:px-6">
      <div className="flex h-full items-center gap-3">
        <Link href="/" className="flex h-full items-center md:hidden">
          <img src="/logo.png" alt="Rafraf" className="h-8 w-auto object-contain dark:hidden" />
          <img src="/whitelogo.png" alt="Rafraf" className="hidden h-8 w-auto object-contain dark:block" />
        </Link>
      </div>

      <div className="flex h-full items-center gap-1 sm:gap-1.5">
        <ThemeToggle size="sm" />

        <div className="relative" ref={msgRef}>
          <button
            onClick={() => setOpenMsg(!openMsg)}
            className={iconBtn}
            title="Messages"
          >
            <BsChatLeftDots className="h-5 w-5" />
            {messageCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center bg-red-600 px-1 text-[10px] font-bold text-white">
                {messageCount > 9 ? "9+" : messageCount}
              </span>
            )}
          </button>

          {openMsg && (
            <div className={dropdownShell}>
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3 dark:border-dark-divider">
                <div className="text-sm font-bold text-[#0F172A] dark:text-white">
                  {t("dashboard:navbar.messages", "Messages")}
                </div>
                <Link
                  href="/dashboard/messages"
                  onClick={() => setOpenMsg(false)}
                  className="text-sm font-semibold text-[#2563EB] hover:underline"
                >
                  {t("dashboard:navbar.openChat", "Open chat")}
                </Link>
              </div>
              <div className="max-h-96 overflow-auto">
                {loadingMessages ? (
                  <div className="px-4 py-5 text-sm text-[#64748B]">
                    {t("dashboard:navbar.loading", "Loading...")}
                  </div>
                ) : displayMessages.length === 0 ? (
                  <div className="px-4 py-5 text-sm text-[#64748B]">
                    {t("dashboard:navbar.noMessages", "No messages")}
                  </div>
                ) : (
                  <ul className="divide-y divide-[#E2E8F0] dark:divide-dark-divider">
                    {displayMessages.map((msg) => (
                      <li
                        key={msg.chatId}
                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-[#F8FAFC] dark:hover:bg-dark-raised ${
                          msg.unreadCount === 0 ? "opacity-60" : ""
                        }`}
                        onClick={async () => {
                          setOpenMsg(false);
                          await markChatAsSeen(msg.chatId);
                          loadRecentMessages();
                          router.push(`/dashboard/messages?chatId=${encodeURIComponent(msg.chatId)}`);
                        }}
                      >
                        <Avatar src={msg.sender?.image} alt={msg.sender?.name} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-[#0F172A] dark:text-white">
                            {msg.sender?.name || t("dashboard:navbar.user", "User")}
                          </div>
                          <div className="line-clamp-1 text-sm text-[#64748B] dark:text-gray-400">
                            {msg.attachments?.length > 0
                              ? `${msg.attachments.length} ${t("dashboard:navbar.attachment", "attachment(s)")}`
                              : msg.content || t("dashboard:navbar.newMessage", "New message")}
                          </div>
                          <div className="mt-1 text-[10px] text-[#94A3B8]">
                            {new Date(msg.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {msg.unreadCount > 0 && (
                          <div className="mt-1 flex h-[18px] min-w-[18px] shrink-0 items-center justify-center bg-[#2563EB] px-1.5 text-[10px] font-bold text-white">
                            {msg.unreadCount > 9 ? "9+" : msg.unreadCount}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-[#E2E8F0] px-4 py-3 text-center dark:border-dark-divider">
                <Link
                  href="/dashboard/messages"
                  onClick={() => setOpenMsg(false)}
                  className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563EB] hover:underline"
                >
                  {t("dashboard:navbar.seeAllMessages", "See all messages")}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setOpenNotif((v) => !v)}
            className={iconBtn}
          >
            <FiBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center bg-red-600 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {openNotif && (
            <div className={dropdownShell}>
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3 dark:border-dark-divider">
                <div className="text-sm font-bold text-[#0F172A] dark:text-white">
                  {t("dashboard:navbar.notifications", "Notifications")}
                </div>
                <button onClick={markAll} className="text-sm font-semibold text-[#2563EB] hover:underline">
                  {t("dashboard:navbar.markAllRead", "Mark all as read")}
                </button>
              </div>
              <div className="max-h-96 overflow-auto">
                {(notifications || []).length === 0 ? (
                  <div className="px-4 py-5 text-sm text-[#64748B]">
                    {t("dashboard:navbar.noNotifications", "No notifications")}
                  </div>
                ) : (
                  <ul className="divide-y divide-[#E2E8F0] dark:divide-dark-divider">
                    {(notifications || []).slice(0, 8).map((n) => (
                      <li
                        key={n.id}
                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-[#F8FAFC] dark:hover:bg-dark-raised ${
                          n.read ? "opacity-80" : ""
                        }`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div className={`mt-1.5 h-2 w-2 shrink-0 ${n.read ? "bg-gray-300" : "bg-[#2563EB]"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-[#0F172A] dark:text-white">
                            {n.title}
                          </div>
                          {n.body && (
                            <div className="truncate text-sm text-[#64748B] dark:text-gray-400">{n.body}</div>
                          )}
                          <div className="mt-1 text-[10px] text-[#94A3B8]">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-[#E2E8F0] px-4 py-3 text-right dark:border-dark-divider">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setOpenNotif(false)}
                  className="text-sm font-semibold text-[#2563EB] hover:underline"
                >
                  {t("dashboard:navbar.seeAll", "See all")}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <UserAccountDropdown />
        </div>

        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 border border-[#E2E8F0] bg-[#F4F7FB] py-1.5 pl-1.5 pr-2.5 transition active:scale-95 dark:border-dark-divider dark:bg-dark-raised md:hidden"
          aria-label="Toggle Navigation"
        >
          {user && (
            <Avatar
              src={user?.image || user?.profilePicture}
              alt={user?.firstName || "User"}
              size={24}
            />
          )}
          <span className="text-[#0F172A] dark:text-gray-200">
            {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </span>
        </button>
      </div>
    </header>
  );
}
