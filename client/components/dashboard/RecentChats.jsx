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
    <div className="min-w-0 overflow-hidden border border-[#E2E8F0] bg-white p-5 dark:border-dark-divider dark:bg-dark-card">
      <h3 className="mb-4 font-display text-lg font-bold text-[#0F172A] dark:text-white">
        Ostatnie wiadomości
      </h3>
      <div className="grid gap-3">
        {items.length === 0 && (
          <div className="text-sm text-[#64748B]">Brak wiadomości</div>
        )}
        {items.map((chat) => {
          const other = Array.isArray(chat.participants)
            ? chat.participants.find((p) => p?.id && p?.email)
            : null;
          const name = other
            ? `${other.firstName || ""} ${other.lastName || ""}`.trim() || other.email
            : "Unknown";
          const avatar = other?.image || other?.profilePicture || null;
          const preview =
            chat?.lastMessage?.text || chat?.lastMessage?.content || "No messages yet";
          const time = fmt(chat?.lastMessage?.timestamp || chat?.updatedAt || Date.now());
          return (
            <div
              key={chat?._id || chat?.id || time}
              className="flex min-w-0 items-center gap-3 overflow-hidden"
            >
              <Avatar src={avatar} alt={name} size={40} />
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="truncate font-semibold text-[#0F172A] dark:text-white">
                  {name}
                </div>
                <div
                  className="truncate text-sm text-[#64748B]"
                  style={{ overflowWrap: "anywhere" }}
                  title={typeof preview === "string" ? preview : undefined}
                >
                  {preview}
                </div>
              </div>
              <div className="shrink-0 whitespace-nowrap text-xs text-[#94A3B8]">
                {time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
