"use client";
import Link from "next/link";
import { useNotifications } from "../../lib/notifications/NotificationsContext";

function fmt(d) {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

const TypeBadge = ({ type }) => {
  const map = {
    message: "bg-[#EEF2FF] text-[#2563EB]",
    car: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    status: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    system: "bg-[#F1F5F9] text-[#64748B] dark:bg-dark-raised dark:text-gray-300",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[type] || map.system}`}>
      {type}
    </span>
  );
};

export default function NotificationsWidget() {
  const { notifications, unreadCount, markRead } = useNotifications();
  const items = (notifications || []).slice(0, 6);
  const getTarget = (n) => {
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
  const handleMarkReadClick = async (e, n) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!n.read) await markRead(n.id);
    } catch { }
  };
  return (
    <div className="min-w-0 overflow-hidden border border-[#E2E8F0] bg-white p-5 dark:border-dark-divider dark:bg-dark-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-white">Notifications</h3>
        <Link href="/dashboard/notifications" className="shrink-0 text-sm font-semibold text-[#2563EB] hover:underline">
          See all
        </Link>
      </div>
      {unreadCount > 0 && (
        <div className="mb-3 text-sm text-[#64748B]">Unread: {unreadCount}</div>
      )}
      <div className="grid gap-2">
        {items.length === 0 && (
          <div className="text-sm text-[#64748B]">No notifications</div>
        )}
        {items.map((n) => (
          <Link
            key={n.id}
            href={getTarget(n)}
            className={`flex min-w-0 items-start gap-3 overflow-hidden p-2 transition hover:bg-[#F8FAFC] dark:hover:bg-dark-raised ${
              n.read ? "opacity-80" : ""
            }`}
          >
            <div className="shrink-0 pt-0.5">
              <TypeBadge type={n.type} />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="truncate font-semibold text-[#0F172A] dark:text-white">{n.title}</div>
              {n.body && (
                <div
                  className="truncate text-sm text-[#64748B]"
                  style={{ overflowWrap: "anywhere" }}
                >
                  {n.body}
                </div>
              )}
              <div className="mt-1 text-[10px] text-[#94A3B8]">{fmt(n.createdAt)}</div>
            </div>
            {!n.read && (
              <button
                onClick={(e) => handleMarkReadClick(e, n)}
                className="shrink-0 text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Mark as read
              </button>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
