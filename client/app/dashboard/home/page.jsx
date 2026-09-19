"use client";
import DashboardStats from "../../../components/dashboard/DashboardStats";
import DashboardCharts from "../../../components/dashboard/DashboardCharts";
import RecentCars from "../../../components/dashboard/RecentCars";
import RecentChats from "../../../components/dashboard/RecentChats";
import NotificationsWidget from "../../../components/dashboard/NotificationsWidget";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaPaw } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "../../../lib/auth/AuthContext";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const page = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(null);
  const { getToken, userId } = useAuth();
  const [recentCars, setRecentCars] = useState([]);
  const [chatsCountByDay, setChatsCountByDay] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      loadCharts();
    });
  }, [userId]);

  const loadCharts = async () => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [carsRes, chatsRes] = await Promise.all([
        fetch(`${API_BASE}/cars/my-cars/all`, { headers }).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/chat/my-chats`, { headers }).catch(() => ({ ok: false })),
      ]);

      if (carsRes.ok) {
        const cars = await carsRes.json();
        setRecentCars(Array.isArray(cars) ? cars.slice(-7) : []);
      }

      if (chatsRes.ok) {
        const chatsJson = await chatsRes.json();
        const chats = Array.isArray(chatsJson) ? chatsJson : chatsJson?.chats || [];
        setRecentChats(chats);

        const groups = {};
        chats.forEach((c) => {
          const d = new Date(c.updatedAt || c.lastMessage?.timestamp || Date.now());
          const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
          groups[key] = (groups[key] || 0) + 1;
        });

        const sorted = Object.keys(groups)
          .sort()
          .slice(-7)
          .map((k) => ({
            label: new Date(k).toLocaleDateString(),
            count: groups[k],
          }));
        setChatsCountByDay(sorted);
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError(t("dashboard.homeDashboard.loadError", "Failed to load dashboard data"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marketing-ui min-w-0 space-y-6 overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
            {t("dashboard:home.overviewLabel", "Overview")}
          </p>
          <h1 className="font-display text-[1.85rem] font-bold leading-tight text-[#0F172A] dark:text-white md:text-[2.2rem]">
            {t("dashboard.dashboardStats.welcome", "Welcome back")}
            {user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-2 max-w-xl text-[15px] text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard.dashboardStats.summary",
              "Here is a summary of your Rafraf account activity."
            )}
          </p>
        </div>
        <Link
          href="/dashboard/cars/add"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 bg-[#2563EB] px-6 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          <FaPaw className="h-4 w-4" />
          {t("dashboard.dashboardStats.listPet", "List a Pet")}
        </Link>
      </div>

      {error && (
        <div className="border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <DashboardStats user={user} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563EB]/20 border-t-[#2563EB]" />
        </div>
      ) : (
        <>
          <DashboardCharts recentCars={recentCars} chatsCountByDay={chatsCountByDay} />

          <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
            <div className="flex min-w-0 lg:col-span-2">
              <RecentCars cars={recentCars} />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <RecentChats chats={recentChats} />
              <NotificationsWidget />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default page;
