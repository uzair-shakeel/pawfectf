"use client";

import { FaPaw } from "react-icons/fa";
import { BiAddToQueue } from "react-icons/bi";
import { BsChatLeftDots, BsPersonGear } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FiMenu, FiX, FiShoppingBag, FiLogOut, FiHome, FiSearch, FiHeart, FiPhone, FiChevronDown, FiBook, FiLifeBuoy } from "react-icons/fi";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "../both/Avatar";
import ThemeToggle from "../ThemeToggle";
import { useNotifications } from "../../lib/notifications/NotificationsContext";

// Prefer same-origin proxy (/api) unless a full external base is explicitly provided
const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_BASE = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { userId, getToken, user, logout } = useAuth();
  const { messageCount } = useNotifications();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [sellerType, setSellerType] = useState(null);

  const pathname = usePathname();

  // Consistent image URL formatter (aligns with profile page logic)
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Pass through absolute URLs and blob URLs
    if (/^(https?:\/\/|blob:)/.test(imagePath)) return imagePath;
    // Allow already-rooted paths (e.g., /images/foo.png)
    if (imagePath.startsWith("/")) return imagePath;
    // Fallback to API base URL if provided
    const base = API_BASE || "";
    if (base) {
      const clean = imagePath.replace(/^[/\\]/, "");
      return `${base}/${clean}`;
    }
    return null;
  };

  // Use user data from AuthContext and set profile image
  useEffect(() => {
    console.log("Sidebar user data:", user);
    if (user) {
      setUserData(user);
      setSellerType(user.sellerType);
      console.log("Setting sellerType to:", user.sellerType);
      const raw = user.profilePicture || user.image;
      // Pass raw value to Avatar; it will handle URL normalization and fallback
      setProfileImage(raw || null);
    }
  }, [user]);

  const dashboardMenuItems = [
    {
      label: "Dashboard",
      href: "/dashboard/home",
      icon: <RiDashboardHorizontalLine className="w-6 h-6" />,
    },
    {
      label: "List a Pet",
      href: "/dashboard/cars/add",
      icon: <BiAddToQueue className="w-6 h-6" />,
    },
    {
      label: "My Listings",
      href: "/dashboard/cars",
      icon: <FaPaw className="w-6 h-6" />,
    },
    ...(sellerType === "private" || sellerType === "company"
      ? [
        {
          label: "Adoption Requests",
          href: "/dashboard/adoption-requests",
          icon: <FiShoppingBag className="w-6 h-6" />,
        },
      ]
      : []),
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: <BsChatLeftDots className="w-6 h-6" />,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: <BsPersonGear className="w-6 h-6" />,
    },
  ];

  const websiteLinks = [
    { label: "Home", href: "/", icon: <FiHome className="w-6 h-6" /> },
    { label: "Adopt", href: "/website/pets", icon: <FiSearch className="w-6 h-6" /> },
    { label: "Saved Pets", href: "/wishlist", icon: <FiHeart className="w-6 h-6" /> },
    { label: "Blog", href: "/website/blog", icon: <FiBook className="w-6 h-6" /> },
    { label: "FAQ", href: "/website/faq", icon: <FiLifeBuoy className="w-6 h-6" /> },
    { label: "Contact", href: "/website/contact", icon: <FiPhone className="w-6 h-6" /> },
  ];

  // Combined for mobile ONLY (following user requested order)
  const mobileMenuItems = [
    websiteLinks[0], // Home
    ...dashboardMenuItems,
    ...websiteLinks.slice(1), // Discovery, Wishlist, etc.
  ];

  const logoutItem = {
    label: "Logout",
    icon: <FiLogOut className="w-6 h-6" />,
    action: async () => {
      try {
        await logout();
      } finally {
        router.push("/");
      }
    },
  };

  // Helper to check if link is active
  const isActive = (href) => {
    if (!pathname || !href) return false;

    // Normalize paths: remove trailing slash for comparison, but preserve root
    const p = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const h = href === "/" ? "/" : href.replace(/\/$/, "");

    if (h === "/") return p === "/";

    // Special case for Moje Auta: don't highlight if on Wystaw Auto (/dashboard/cars/add)
    if (href === '/dashboard/cars' && pathname.startsWith('/dashboard/cars/add')) {
      return false;
    }

    return p === h || p.startsWith(h + '/');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-white dark:bg-dark-panel z-[100] md:hidden overflow-y-auto custom-scrollbar"
          >
            {/* Top Bar for Mobile Menu */}
            <div className="h-16 px-4 border-b border-gray-100 dark:border-dark-divider flex justify-between items-center sticky top-0 bg-white/80 dark:bg-dark-panel/80 backdrop-blur-md z-10">
              <div className="flex items-center">
                <Link href="/" onClick={toggleSidebar} className="flex items-center">
                  <img src="/logo.png" alt="Pawfect" className="h-10 md:h-12 w-auto object-contain dark:hidden" />
                  <img src="/whitelogo.png" alt="Pawfect" className="h-10 md:h-12 w-auto object-contain hidden dark:block" />
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-raised rounded-xl transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-8 pb-10">
              {/* Profile Overview (Mobile) */}
              {userData && (
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-dark-card p-5 rounded-[2rem] border border-gray-100 dark:border-dark-divider">
                  <Avatar src={profileImage} alt="User" size={50} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                      {userData?.firstName || "Użytkownik"}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                      {sellerType === 'company' ? 'Shelter Account' : 'Pet Owner'}
                    </p>
                  </div>
                </div>
              )}

              {/* UNIFIED TILE GRID (All Actions) */}
              <div className="grid grid-cols-2 gap-3">
                {mobileMenuItems.map((item) => (
                  <MobileTile
                    key={item.label}
                    item={item}
                    onClick={toggleSidebar}
                    active={isActive(item.href)}
                    badge={item.label === "Wiadomości" ? messageCount : 0}
                  />
                ))}
              </div>

              {/* Logout button */}
              <div className="pt-6">
                <button
                  onClick={async () => {
                    if (logoutItem?.action) await logoutItem.action();
                    toggleSidebar();
                  }}
                  className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-sm font-black text-red-500 uppercase tracking-widest"
                >
                  <div className="flex items-center gap-4">
                    <FiLogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="pt-2 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Pawfect &copy; {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR RAIL */}
      <motion.div
        className={`fixed inset-y-0 left-0 bg-dark-panel dark:bg-dark-panel border-r border-dark-divider shadow-2xl z-40 w-64 hidden md:flex flex-col transition-all duration-300 ease-in-out translate-x-0`}
      >
        {/* Header / Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-dark-divider flex-shrink-0">
          <Link href="/" className="block">
            <img src="/whitelogo.png" alt="Pawfect" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="p-4 flex-shrink-0">
          {userData && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-none relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <Avatar src={profileImage} alt="User" size={40} />
              <div className="min-w-0 flex-1 relative z-10">
                <h3 className="text-sm font-bold text-white truncate">{userData?.firstName || "Użytkownik"}</h3>
                <p className="text-xs text-gray-400 truncate font-medium">{sellerType === 'company' ? 'Shelter Account' : 'Pet Owner'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {dashboardMenuItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`relative flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all group
                    ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-gray-400 hover:bg-white/5 hover:text-white"}
                  `}
                >
                  <span className={`transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}>{item.icon}</span>
                  <span className="flex-grow">{item.label}</span>
                  {item.label === "Wiadomości" && messageCount > 0 && (
                    <span className={`flex h-5 w-auto min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}`}>
                      {messageCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop Logout Button - Separate and Fixed at Bottom */}
        <div className="p-4 border-t border-dark-divider">
          <button
            onClick={async () => {
              await logoutItem.action();
              if (window.innerWidth < 768) toggleSidebar();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500/80 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all group"
          >
            <span className="group-hover:scale-110 transition-transform">{logoutItem.icon}</span>
            <span>{logoutItem.label}</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 text-center">
          <p className="text-[10px] text-[#4A4A4A] font-bold uppercase tracking-widest">
            Pawfect &copy; {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </>
  );
}

// --- Helper Components for Mobile Menu ---

function MobileTile({ item, onClick, active, badge }) {
  if (!item) return null;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex flex-col items-center justify-center h-28 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all text-center px-4 gap-3 relative
        ${active
          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
          : "bg-gray-50 dark:bg-dark-card text-gray-900 dark:text-white border border-gray-100 dark:border-dark-divider"
        }
      `}
    >
      <span className={`${active ? "" : "text-blue-500"} transition-transform group-hover:scale-110`}>
        {item.icon}
      </span>
      <span>{item.label}</span>

      {badge > 0 && (
        <span className={`absolute top-4 right-4 h-5 w-auto min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px] font-black ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

function MobileListLink({ item, onClick, active }) {
  if (!item) return null;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all
        ${active ? "bg-blue-600 text-white" : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white border border-transparent hover:border-blue-500/20"}
      `}
    >
      <div className="flex items-center gap-4">
        <span className={`${active ? "text-white" : "text-blue-500"}`}>{item.icon}</span>
        <span>{item.label}</span>
      </div>
      <FiChevronDown className="w-4 h-4 -rotate-90 opacity-30" />
    </Link>
  );
}

const ArrowRight = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
