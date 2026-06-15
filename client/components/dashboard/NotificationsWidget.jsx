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
    message: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    car: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    status: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800",
    system: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-dark-card dark:text-gray-300 dark:border-gray-600",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${map[type] || map.system}`}>{type}</span>
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
    <div className="p-4 bg-white dark:bg-dark-panel shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:text-white">Notifications</h3>
        <Link href="/dashboard/notifications" className="text-sm text-blue-600 hover:underline">See all</Link>
      </div>
      {unreadCount > 0 && (
        <div className="mb-2 text-xs text-gray-500">Unread: {unreadCount}</div>
      )}
      <div className="grid gap-3">
        {items.length === 0 && (
          <div className="text-sm text-dark-text-secondary">No notifications</div>
        )}
        {items.map((n) => (
          <Link
            key={n.id}
            href={getTarget(n)}
            className={`flex items-start gap-3 ${n.read ? "opacity-80" : ""} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md p-1`}
          >
            <div className="pt-0.5"><TypeBadge type={n.type} /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-gray-900 dark:text-gray-200 dark:text-white">{n.title}</div>
              {n.body && <div className="text-xs text-gray-600 dark:text-gray-300 truncate">{n.body}</div>}
              <div className="text-[10px] text-gray-400 mt-1">{fmt(n.createdAt)}</div>
            </div>
            {!n.read && (
              <button onClick={(e) => handleMarkReadClick(e, n)} className="text-xs text-blue-600 hover:underline">Mark as read</button>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
