import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API = API_BASE ? `${API_BASE}/api` : "/api";

export type NotificationItem = {
  id: string;
  type: string; // message | car | status | system
  title: string;
  body?: string;
  createdAt: string;
  read: boolean;
  meta?: Record<string, any>;
};

const localKey = "ojest.notifications";

function loadLocal(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(localKey);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : [];
  } catch {
    return [];
  }
}
function saveLocal(list: NotificationItem[]) {
  try {
    localStorage.setItem(localKey, JSON.stringify(list));
  } catch {}
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await axios.get(`${API}/notifications`);
    const list = Array.isArray(res.data?.notifications) ? res.data.notifications : (Array.isArray(res.data)? res.data : []);
    return list;
  } catch (e: any) {
    // fallback to local
    return loadLocal();
  }
}

export async function createNotification(n: Omit<NotificationItem, "id"|"createdAt"|"read"> & Partial<Pick<NotificationItem, "createdAt"|"read">>): Promise<NotificationItem> {
  const payload: NotificationItem = {
    id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: n.createdAt || new Date().toISOString(),
    read: n.read ?? false,
    type: n.type,
    title: n.title,
    body: n.body,
    meta: n.meta,
  };
  try {
    const res = await axios.post(`${API}/notifications`, payload);
    return res.data?.notification || res.data || payload;
  } catch (e) {
    const list = loadLocal();
    const merged = [payload, ...list];
    saveLocal(merged);
    return payload;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await axios.patch(`${API}/notifications/${id}`, { read: true });
  } catch (e) {
    const list = loadLocal().map((n) => (n.id === id ? { ...n, read: true } : n));
    saveLocal(list);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await axios.post(`${API}/notifications/mark-all-read`);
  } catch (e) {
    const list = loadLocal().map((n) => ({ ...n, read: true }));
    saveLocal(list);
  }
}

export async function markTypeReadAsync(type: string): Promise<void> {
  try {
    await axios.post(`${API}/notifications/mark-type-read`, { type });
  } catch (e) {
    const list = loadLocal().map((n) => (n.type === type ? { ...n, read: true } : n));
    saveLocal(list);
  }
}
