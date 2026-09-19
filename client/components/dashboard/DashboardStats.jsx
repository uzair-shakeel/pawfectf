"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { getPetsByUserId } from "../../services/petService";
import { BsChatLeftDots } from "react-icons/bs";
import { FaPaw } from "react-icons/fa";
import { HiOutlineUser } from "react-icons/hi";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
  ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "").endsWith("/api")
    ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")
    : `${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}/api`
  : "/api";

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

  const cards = [
    {
      icon: FaPaw,
      label: t("dashboard.dashboardStats.myListings", "My Listings"),
      value: petsCount,
      href: "/dashboard/cars",
      link: t("dashboard.dashboardStats.manageListings", "Manage listings"),
      tone: "text-[#2563EB] bg-[#EEF2FF] dark:bg-[#2563EB]/15",
      linkTone: "text-[#2563EB]",
    },
    {
      icon: BsChatLeftDots,
      label: t("dashboard.dashboardStats.messages", "Messages"),
      value: chatsCount,
      href: "/dashboard/messages",
      link: t("dashboard.dashboardStats.goToMessages", "Go to messages"),
      tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
      linkTone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: HiOutlineUser,
      label: t("dashboard.dashboardStats.myProfile", "My Profile"),
      value: null,
      href: "/dashboard/profile",
      link: t("dashboard.dashboardStats.editProfile", "Edit profile"),
      tone: "text-violet-600 bg-violet-100 dark:text-violet-300 dark:bg-violet-500/20",
      linkTone: "text-[#2563EB]",
      profile: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
      {cards.map(({ icon: Icon, label, value, href, link, tone, linkTone, profile }) => (
        <div
          key={label}
          className="border border-[#E2E8F0] bg-white p-5 dark:border-dark-divider dark:bg-dark-card sm:p-6"
        >
          <div className={`mb-4 flex h-11 w-11 items-center justify-center ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
            {label}
          </p>
          {profile ? (
            <>
              <p className="mt-2 truncate font-display text-xl font-bold text-[#0F172A] dark:text-white">
                {user?.email || t("dashboard.dashboardStats.noEmail", "No email")}
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                {t("dashboard.dashboardStats.accountType", "Account type")}:{" "}
                {user?.sellerType === "company"
                  ? t("dashboard.dashboardStats.shelterOrg", "Shelter / Org")
                  : t("dashboard.dashboardStats.private", "Private")}
              </p>
            </>
          ) : (
            <div className="mt-2 font-display text-4xl font-bold text-[#0F172A] dark:text-white">
              {loading ? (
                <div className="h-10 w-14 animate-pulse bg-[#E2E8F0] dark:bg-dark-raised" />
              ) : (
                value
              )}
            </div>
          )}
          <Link
            href={href}
            className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${linkTone} transition hover:gap-2.5`}
          >
            {link}
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </div>
      ))}
    </div>
  );
}
