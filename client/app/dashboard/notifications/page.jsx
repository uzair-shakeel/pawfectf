"use client";
import { useEffect, useMemo, useState } from "react";
import { useNotifications } from "../../../lib/notifications/NotificationsContext";

function fmt(d) {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAll, refresh } = useNotifications();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    refresh();
  }, [refresh]);

  const items = useMemo(() => {
    const list = Array.isArray(notifications) ? notifications : [];
    switch (filter) {
      case "unread":
        return list.filter((n) => !n.read);
      case "message":
      case "car":
      case "status":
      case "system":
        return list.filter((n) => n.type === filter);
      default:
        return list;
    }
  }, [notifications, filter]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-200 dark:text-white">Powiadomienia</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Nieprzeczytane: {unreadCount}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-main rounded-md px-2 py-1 text-sm"
          >
            <option value="all">Wszystkie</option>
            <option value="unread">Nieprzeczytane</option>
            <option value="message">Wiadomości</option>
            <option value="car">Samochody</option>
            <option value="status">Status</option>
            <option value="system">System</option>
          </select>
          <button
            onClick={markAll}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Oznacz wszystkie jako przeczytane
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-main border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Brak powiadomień</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map((n) => (
              <li key={n.id} className={` flex items-start gap-3 ${n.read ? "opacity-50 p-3" : "p-3 "}`}>
                <span
                  className={`mt-1 text-[10px] px-2 py-0.5 rounded-full border ${n.type === "message"
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : n.type === "car"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : n.type === "status"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                >
                  {n.type}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-200 dark:text-white truncate">{n.title}</div>
                  {n.body && (
                    <div className="text-sm line-clamp-2 text-gray-600 dark:text-gray-300 ">{n.body}</div>
                  )}
                  <div className="text-[10px] text-gray-400 mt-1">{fmt(n.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Oznacz jako przeczytane
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
