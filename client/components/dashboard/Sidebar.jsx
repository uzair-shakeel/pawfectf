"use client";

import { FaPaw } from "react-icons/fa";
import { BiAddToQueue } from "react-icons/bi";
import { BsChatLeftDots, BsPersonGear } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FiX, FiShoppingBag, FiLogOut, FiHome, FiSearch, FiHeart, FiPhone, FiLifeBuoy, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "../both/Avatar";
import { useNotifications } from "../../lib/notifications/NotificationsContext";
import { useLanguage } from "../../lib/i18n/LanguageContext";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_BASE = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { t } = useLanguage();
  const { userId, getToken, user, logout } = useAuth();
  const { messageCount } = useNotifications();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [sellerType, setSellerType] = useState(null);

  const pathname = usePathname();

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (/^(https?:\/\/|blob:)/.test(imagePath)) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    const base = API_BASE || "";
    if (base) {
      const clean = imagePath.replace(/^[/\\]/, "");
      return `${base}/${clean}`;
    }
    return null;
  };

  useEffect(() => {
    console.log("Sidebar user data:", user);
    if (user) {
      setUserData(user);
      setSellerType(user.sellerType);
      console.log("Setting sellerType to:", user.sellerType);
      const raw = user.profilePicture || user.image;
      setProfileImage(raw || null);
    }
  }, [user]);

  const dashboardMenuItems = [
    {
      label: t("dashboard:sidebar.dashboard", "Dashboard"),
      href: "/dashboard/home",
      icon: <RiDashboardHorizontalLine className="h-5 w-5" />,
    },
    {
      label: t("dashboard:sidebar.listPet", "List a Pet"),
      href: "/dashboard/cars/add",
      icon: <BiAddToQueue className="h-5 w-5" />,
    },
    {
      label: t("dashboard:sidebar.myListings", "My Listings"),
      href: "/dashboard/cars",
      icon: <FaPaw className="h-5 w-5" />,
    },
    ...(sellerType === "private" || sellerType === "company"
      ? [
          {
            label: t("dashboard:sidebar.adoptionRequests", "Adoption Requests"),
            href: "/dashboard/adoption-requests",
            icon: <FiShoppingBag className="h-5 w-5" />,
          },
        ]
      : []),
    {
      label: t("dashboard:sidebar.lostFound", "Lost & Found"),
      href: "/dashboard/lost-found",
      icon: <FaPaw className="h-5 w-5" />,
    },
    {
      label: t("dashboard:sidebar.foodDonations", "Food Donations"),
      href: "/dashboard/food-pets",
      icon: <FiHeart className="h-5 w-5" />,
    },
    {
      label: t("dashboard:sidebar.donationHistory", "Donation History"),
      href: "/dashboard/donation-history",
      icon: <FiHeart className="h-5 w-5" />,
    },
    {
      label: t("dashboard:sidebar.messages", "Messages"),
      href: "/dashboard/messages",
      icon: <BsChatLeftDots className="h-5 w-5" />,
    },
    {
      label: t("dashboard:sidebar.profile", "Profile"),
      href: "/dashboard/profile",
      icon: <BsPersonGear className="h-5 w-5" />,
    },
    ...(user?.role === "admin"
      ? [
          {
            label: t("dashboard:sidebar.adminPets", "Admin: Pets"),
            href: "/dashboard/admin/cars",
            icon: <FaPaw className="h-5 w-5" />,
          },
          {
            label: t("dashboard:sidebar.adminLostFound", "Admin: Lost & Found"),
            href: "/dashboard/admin/lost-found",
            icon: <RiDashboardHorizontalLine className="h-5 w-5" />,
          },
        ]
      : []),
  ];

  const websiteLinks = [
    { label: t("navbar:links.home", "Home"), href: "/", icon: <FiHome className="h-5 w-5" /> },
    { label: t("navbar:links.adopt", "Adopt"), href: "/website/pets", icon: <FiSearch className="h-5 w-5" /> },
    { label: t("navbar:links.savedPets", "Saved Pets"), href: "/wishlist", icon: <FiHeart className="h-5 w-5" /> },
    { label: t("navbar:links.faq", "FAQ"), href: "/website/faq", icon: <FiLifeBuoy className="h-5 w-5" /> },
    { label: t("navbar:links.contact", "Contact"), href: "/website/contact", icon: <FiPhone className="h-5 w-5" /> },
  ];

  const logoutItem = {
    label: t("dashboard:sidebar.logout", "Logout"),
    icon: <FiLogOut className="h-5 w-5" />,
    action: async () => {
      try {
        await logout();
      } finally {
        router.push("/");
      }
    },
  };

  const isActive = (href) => {
    if (!pathname || !href) return false;
    const p = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const h = href === "/" ? "/" : href.replace(/\/$/, "");
    if (h === "/") return p === "/";
    if (href === "/dashboard/cars" && pathname.startsWith("/dashboard/cars/add")) {
      return false;
    }
    return p === h || p.startsWith(h + "/");
  };

  const navLinkClass = (active) =>
    `relative flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-semibold transition-colors ${
      active
        ? "bg-[#2563EB] text-white"
        : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
    }`;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="marketing-ui fixed inset-0 z-[100] overflow-y-auto bg-[#F4F7FB] dark:bg-dark-main md:hidden"
          >
            <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white/90 px-4 backdrop-blur-md dark:border-dark-divider dark:bg-dark-card/90">
              <Link href="/" onClick={toggleSidebar} className="flex items-center">
                <img src="/logo.png" alt="Rafraf" className="h-9 w-auto object-contain dark:hidden" />
                <img src="/whitelogo.png" alt="Rafraf" className="hidden h-9 w-auto object-contain dark:block" />
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-2 text-[#0F172A] transition hover:bg-[#F1F5F9] dark:text-gray-200 dark:hover:bg-dark-raised"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="space-y-5 p-4 pb-10">
              {userData && (
                <div className="flex items-center gap-3 border border-[#E2E8F0] bg-white p-4 dark:border-dark-divider dark:bg-dark-card">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 dark:bg-violet-500/20">
                    <Avatar src={profileImage} alt="User" size={48} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display truncate text-lg font-bold text-[#0F172A] dark:text-white">
                      {userData?.firstName || "User"}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563EB]">
                      {sellerType === "company"
                        ? t("dashboard:sidebar.shelterAccount", "Shelter Account")
                        : t("dashboard:sidebar.petOwner", "Pet Owner")}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  {t("dashboard:sidebar.dashboard", "Dashboard")}
                </p>
                <div className="overflow-hidden border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card">
                  {dashboardMenuItems.map((item, index) => (
                    <MobileNavLink
                      key={item.label}
                      item={item}
                      onClick={toggleSidebar}
                      active={isActive(item.href)}
                      badge={item.label === "Wiadomości" ? messageCount : 0}
                      showDivider={index > 0}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Website
                </p>
                <div className="overflow-hidden border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card">
                  {websiteLinks.map((item, index) => (
                    <MobileNavLink
                      key={item.label}
                      item={item}
                      onClick={toggleSidebar}
                      active={isActive(item.href)}
                      badge={0}
                      showDivider={index > 0}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={async () => {
                  if (logoutItem?.action) await logoutItem.action();
                  toggleSidebar();
                }}
                className="flex w-full items-center gap-3 border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
              >
                <FiLogOut className="h-5 w-5" />
                <span>{t("dashboard:sidebar.logout", "Logout")}</span>
              </button>

              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                Rafraf &copy; {new Date().getFullYear()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div className="marketing-ui fixed inset-y-0 left-0 z-40 hidden w-64 translate-x-0 flex-col border-r border-[#E2E8F0] bg-white transition-all duration-300 ease-in-out dark:border-dark-divider dark:bg-dark-card md:flex">
        <div className="box-border flex h-16 min-h-16 max-h-16 shrink-0 items-center border-b border-[#E2E8F0] px-5 dark:border-dark-divider">
          <Link href="/" className="flex h-full items-center">
            <img src="/logo.png" alt="Rafraf" className="h-8 w-auto object-contain dark:hidden" />
            <img src="/whitelogo.png" alt="Rafraf" className="hidden h-8 w-auto object-contain dark:block" />
          </Link>
        </div>

        <div className="shrink-0 p-4">
          {userData && (
            <div className="flex items-center gap-3 border border-[#E2E8F0] bg-[#F4F7FB] p-3 dark:border-dark-divider dark:bg-dark-raised">
              <Avatar src={profileImage} alt="User" size={40} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-[#0F172A] dark:text-white">
                  {userData?.firstName || "User"}
                </h3>
                <p className="truncate text-[11px] font-semibold text-[#64748B] dark:text-gray-400">
                  {sellerType === "company"
                    ? t("dashboard:sidebar.shelterAccount", "Shelter Account")
                    : t("dashboard:sidebar.petOwner", "Pet Owner")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-1">
          {dashboardMenuItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={navLinkClass(active)}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-grow truncate">{item.label}</span>
                  {item.label === "Wiadomości" && messageCount > 0 && (
                    <span
                      className={`flex h-5 min-w-[20px] items-center justify-center px-1.5 text-[10px] font-bold ${
                        active ? "bg-white text-[#2563EB]" : "bg-red-500 text-white"
                      }`}
                    >
                      {messageCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="border-t border-[#E2E8F0] p-3 dark:border-dark-divider">
          <button
            onClick={async () => {
              await logoutItem.action();
              if (window.innerWidth < 768) toggleSidebar();
            }}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-[14px] font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <span>{logoutItem.icon}</span>
            <span>{logoutItem.label}</span>
          </button>
        </div>

        <div className="px-4 pb-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
            Rafraf &copy; {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </>
  );
}

function MobileNavLink({ item, onClick, active, badge, showDivider }) {
  if (!item) return null;
  return (
    <Link
      href={item.href}
      prefetch={true}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 transition ${
        showDivider ? "border-t border-[#E2E8F0] dark:border-dark-divider" : ""
      } ${
        active
          ? "bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15"
          : "text-[#0F172A] hover:bg-[#F8FAFC] dark:text-white dark:hover:bg-dark-raised"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center ${
          active
            ? "bg-[#2563EB] text-white"
            : "bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/20"
        }`}
      >
        {item.icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{item.label}</span>
      {badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center bg-red-500 px-1.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
      <FiChevronRight className={`h-4 w-4 shrink-0 ${active ? "text-[#2563EB]" : "text-[#94A3B8]"}`} />
    </Link>
  );
}
