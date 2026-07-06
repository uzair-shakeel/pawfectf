"use client";
import DashboardStats from "../../../components/dashboard/DashboardStats";
import DashboardCharts from "../../../components/dashboard/DashboardCharts";
import RecentCars from "../../../components/dashboard/RecentCars";
import RecentChats from "../../../components/dashboard/RecentChats";
import NotificationsWidget from "../../../components/dashboard/NotificationsWidget";
import QuickActions from "../../../components/dashboard/QuickActions";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "../../../lib/auth/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const page = () => {
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
    // Use startTransition to make this non-blocking
    startTransition(() => {
      loadCharts();
    });
  }, [userId]);

  const loadCharts = async () => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch both in parallel for speed
      const [carsRes, chatsRes] = await Promise.all([
        fetch(`${API_BASE}/cars/my-cars/all`, { headers }).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/chat/my-chats`, { headers }).catch(() => ({ ok: false }))
      ]);

      // Process cars
      if (carsRes.ok) {
        const cars = await carsRes.json();
        setRecentCars(Array.isArray(cars) ? cars.slice(-7) : []);
      }

      // Process chats
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
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 dark:bg-dark-main">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Welcome Back{user?.firstName ? ", " + user.firstName : ""}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 mt-1">
            Here's a quick overview of your activity.
          </p>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}

      <DashboardStats user={user} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <DashboardCharts
            recentCars={recentCars}
            chatsCountByDay={chatsCountByDay}
          />

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <RecentCars cars={recentCars} />
            </div>
            <div className="space-y-4">
              <RecentChats chats={recentChats} />
              <NotificationsWidget />
              <QuickActions />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default page;