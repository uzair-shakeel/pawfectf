"use client";
import Avatar from "../both/Avatar";

export default function RecentChats({ chats = [] }) {
  const fmt = (d) => {
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${mi}`;
  };

  const items = Array.isArray(chats)
    ? [...chats]
      .sort((a, b) => {
        const ta = new Date(a?.lastMessage?.timestamp || a?.updatedAt || 0).getTime();
        const tb = new Date(b?.lastMessage?.timestamp || b?.updatedAt || 0).getTime();
        return tb - ta;
      })
      .slice(0, 6)
    : [];

  return (
    <div className="p-4 bg-white dark:bg-dark-panel shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:text-white transition-colors duration-300">
          Ostatnie wiadomości

        </h3>
      </div>
      <div className="grid gap-3">
        {items.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Brak Wiadomości
          </div>
        )}
        {items.map((chat) => {
          const other = Array.isArray(chat.participants)
            ? chat.participants.find((p) => p?.id && p?.email)
            : null;
          const name = other
            ? `${other.firstName || ""} ${other.lastName || ""}`.trim() ||
            other.email
            : "Unknown";
          const avatar = other?.image || other?.profilePicture || null;
          const preview =
            chat?.lastMessage?.text || chat?.lastMessage?.content || "No messages yet";
          const time = fmt(
            chat?.lastMessage?.timestamp || chat?.updatedAt || Date.now()
          );
          return (
            <div
              key={chat?._id || chat?.id || time}
              className="flex items-center gap-3"
            >
              <Avatar
                src={avatar}
                alt={name}
                size={40}
                imgClassName="ring-1 ring-black/5"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-gray-900 dark:text-gray-200 dark:text-white transition-colors duration-300">
                  {name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">
                  {preview}
                </div>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap transition-colors duration-300">
                {time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
