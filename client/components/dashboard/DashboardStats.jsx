"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { getPetsByUserId } from "../../services/petService";
import KPICard from "./KPICard";
import { BsChatLeftDots } from "react-icons/bs";
import { FaPaw } from "react-icons/fa";
import { HiOutlineUser } from "react-icons/hi";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}/api` : "/api";

export default function DashboardStats({ user: userProp }) {
  const { t } = useLanguage();
  const { user: contextUser, userId, getToken } = useAuth();
  const user = contextUser || userProp;

  const [petsCount, setPetsCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);

        const tasks = [];

        if (userId && typeof getToken === "function") {
          tasks.push(
            getPetsByUserId(userId, getToken)
              .then((pets) => {
                if (!isMounted) return;
                setPetsCount(Array.isArray(pets) ? pets.length : 0);
              })
              .catch(() => {
                if (!isMounted) return;
                setPetsCount(0);
              })
          );
        }

        const token = await getToken();
        if (token) {
          tasks.push(
            fetch(`${API_BASE}/chat/my-chats`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch chats");
                const data = await res.json();
                const chats = Array.isArray(data) ? data : data?.chats || [];
                if (!isMounted) return;
                setChatsCount(Array.isArray(chats) ? chats.length : 0);
              })
              .catch(() => {
                if (!isMounted) return;
                setChatsCount(0);
              })
          );
        }

        await Promise.all(tasks);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [userId, getToken]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary tracking-tight transition-colors">
            {t("dashboard.dashboardStats.welcome", "Welcome back")}, {user?.firstName || t("dashboard.dashboardStats.friend", "Friend")}! 👋
          </h1>
          <p className="text-dark-text-secondary dark:text-dark-text-secondary font-medium mt-1 transition-colors">
            {t("dashboard.dashboardStats.summary", "Here is a summary of your Rafraf account activity.")}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/cars/add" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg dark:shadow-blue-900/40 shadow-blue-200 hover:-translate-y-1">
            <FaPaw /> {t("dashboard.dashboardStats.listPet", "List a Pet")}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cars Card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-divider shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 text-xl">
              <FaPaw />
            </div>
            <h3 className="text-gray-500 dark:text-dark-text-muted font-bold uppercase text-xs tracking-wider mb-1">{t("dashboard.dashboardStats.myListings", "My Listings")}</h3>
            <div className="text-4xl font-extrabold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary">
              {loading ? (
                <div className="h-10 w-16 bg-gray-200 dark:bg-dark-elevation-2 animate-pulse rounded-lg"></div>
              ) : (
                petsCount
              )}
            </div>
            <Link href="/dashboard/cars" className="inline-block mt-4 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              {t("dashboard.dashboardStats.manageListings", "Manage listings")} →
            </Link>
          </div>
        </div>

        {/* Messages Card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-divider shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 text-xl">
              <BsChatLeftDots />
            </div>
            <h3 className="text-gray-500 dark:text-dark-text-muted font-bold uppercase text-xs tracking-wider mb-1">{t("dashboard.dashboardStats.messages", "Messages")}</h3>
            <div className="text-4xl font-extrabold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary">
              {loading ? (
                <div className="h-10 w-16 bg-gray-200 dark:bg-dark-elevation-2 animate-pulse rounded-lg"></div>
              ) : (
                chatsCount
              )}
            </div>
            <Link href="/dashboard/messages" className="inline-block mt-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
              {t("dashboard.dashboardStats.goToMessages", "Go to messages")} →
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-divider shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4 text-xl">
              <HiOutlineUser />
            </div>
            <h3 className="text-gray-500 dark:text-dark-text-muted font-bold uppercase text-xs tracking-wider mb-1">{t("dashboard.dashboardStats.myProfile", "My Profile")}</h3>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white truncate">
              {user?.email || t("dashboard.dashboardStats.noEmail", "No email")}
            </div>
            <p className="text-xs text-gray-400 dark:text-dark-text-muted font-medium mb-1">{t("dashboard.dashboardStats.accountType", "Account type")}: {user?.sellerType === 'company' ? t("dashboard.dashboardStats.shelterOrg", "Shelter / Org") : t("dashboard.dashboardStats.private", "Private")}</p>

            <Link href="/dashboard/profile" className="inline-block mt-3 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
              {t("dashboard.dashboardStats.editProfile", "Edit profile")} →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity / Banner (Placeholder for now) */}
      {/* <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl font-bold mb-2">Potrzebujesz pomocy ze sprzedażą?</h2>
          <p className="text-gray-300 mb-6">Skontaktuj się z naszym zespołem wsparcia, aby uzyskać porady dotyczące lepszej ekspozycji Twoich ogłoszeń.</p>
          <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all border border-white/10 backdrop-blur-sm">
            Centrum Pomocy
          </button>
        </div>
      </div> */}
    </div>

  );
}
