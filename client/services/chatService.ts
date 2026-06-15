import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API = API_BASE ? `${API_BASE}/api` : "/api";

export type RecentMessage = {
  id: string;
  chatId: string;
  content: string;
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string;
  };
  car: {
    id: string;
    title: string;
    image: string;
  } | null;
  unread: boolean;
};

export async function fetchRecentMessages(): Promise<RecentMessage[]> {
  try {
    const res = await axios.get(`${API}/chat/recent-messages`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error("[chatService] Failed to fetch recent messages:", e);
    return [];
  }
}

export async function markChatAsSeen(chatId: string): Promise<boolean> {
  try {
    const res = await axios.post(`${API}/chat/${chatId}/mark-seen`);
    return res.data?.success === true;
  } catch (e) {
    console.error("[chatService] Failed to mark chat as seen:", e);
    return false;
  }
}
