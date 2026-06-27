"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Lazy load heavy components
const LanguageSwitcher = dynamic(() => import("../LanguageSwitcher"), { ssr: false });
const ThemeToggle = dynamic(() => import("../ThemeToggle"), { ssr: false });
const Avatar = dynamic(() => import("../both/Avatar"), { ssr: false });
const UserAccountDropdown = dynamic(() => import("../both/UserAccountDropdown"), { ssr: false });

import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";

// Only import notifications if user is signed in (moved to conditional)
let useNotifications = null;
let fetchRecentMessages = null;
let markChatAsSeen = null;

// Icons - these are actually small and tree-shaken, so keep them
import { FiBell, FiMenu, FiX, FiSearch, FiHeart, FiBook, FiLifeBuoy, FiPhone, FiLayout, FiUser, FiLogOut, FiShoppingBag, FiHome, FiChevronDown } from "react-icons/fi";
import { BsChatLeftDots, BsPersonGear } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { BiAddToQueue } from "react-icons/bi";
import { FaPaw } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [openMsg, setOpenMsg] = useState(false);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();
  const { isSignedIn, logout, user } = useAuth();
  const pathname = usePathname();
  const notifRef = useRef(null);
  const msgRef = useRef(null);

  // Lazy load notifications and chat services only when needed
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [markRead, setMarkRead] = useState(null);
  const [markAll, setMarkAll] = useState(null);

  // Load notifications context only when user is signed in
  useEffect(() => {
    if (isSignedIn) {
      import("../../lib/notifications/NotificationsContext").then(({ useNotifications }) => {
        try {
          // This won't work outside the component tree, but we can handle it gracefully
          const context = useNotifications?.();
          if (context) {
            setNotificationsList(context.notifications || []);
            setUnreadCount(context.unreadCount || 0);
            setMessageCount(context.messageCount || 0);
            setMarkRead(() => context.markRead);
            setMarkAll(() => context.markAll);
          }
        } catch (e) {
          console.warn('[Navbar] Notifications not available:', e);
        }
      });
    }
  }, [isSignedIn]);

  // Fetch real messages from API when messages dropdown opens
  const loadRecentMessages = useCallback(async () => {
    if (!isSignedIn || !openMsg) return;
    
    setLoadingMessages(true);
    try {
      const { fetchRecentMessages } = await import("../../services/chatService");
      const messages = await fetchRecentMessages();
      setRecentMessages(messages);
    } catch (e) {
      console.error('[Navbar] Failed to load recent messages:', e);
    } finally {
      setLoadingMessages(false);
    }
  }, [isSignedIn, openMsg]);

  // Load messages when dropdown opens
  useEffect(() => {
    if (openMsg) {
      loadRecentMessages();
    }
  }, [openMsg, loadRecentMessages]);

  // Filter to ensure we only show received messages (not sent by current user)
  const displayMessages = useMemo(() => {
    if (!user?.id && !user?._id) return recentMessages;
    const myId = String(user?.id || user?._id);
    return recentMessages.filter(msg => String(msg.sender?.id) !== myId);
  }, [recentMessages, user]);

  const getNotifTarget = (n) => {
    try {
      const type = n?.type;
      const meta = n?.meta || {};
      if (type === "message") {
        if (meta.chatId) return `/dashboard/messages?chatId=${encodeURIComponent(meta.chatId)}`;
        return "/dashboard/messages";
      }
      if (type === "pet" || type === "status") {
        return "/dashboard/pets";
      }
      return "/dashboard/notifications";
    } catch {
      return "/dashboard/notifications";
    }
  };

  const handleNotifClick = async (n) => {
    try {
      if (!n.read && markRead) await markRead(n.id);
    } catch { }
    setOpenNotif(false);
    router.push(getNotifTarget(n));
  };

  const handleSignIn = () => {
    setIsMenuOpen(false);
    router.push("/sign-in");
  };

  const handleSignOut = () => {
    setIsMenuOpen(false);
    logout();
    router.push("/");
  };

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
    {
      label: "Adoption Requests",
      href: "/dashboard/buyer-requests",
      icon: <FiShoppingBag className="w-6 h-6" />,
    },
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
    { label: "Lost & Found", href: "/website/lost-found", icon: <FiSearch className="w-6 h-6" /> },
    { label: "Saved Pets", href: "/wishlist", icon: <FiHeart className="w-6 h-6" /> },
    { label: "Blog", href: "/website/blog", icon: <FiBook className="w-6 h-6" /> },
    { label: "FAQ", href: "/website/faq", icon: <FiLifeBuoy className="w-6 h-6" /> },
    { label: "Contact", href: "/website/contact", icon: <FiPhone className="w-6 h-6" /> },
  ];

  const mobileMenuItems = [
    websiteLinks[0], // Home
    ...(isSignedIn ? dashboardMenuItems : []),
    ...websiteLinks.slice(1),
  ];

  const isActive = (href) => {
    if (!pathname || !href) return false;
    const p = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const h = href === "/" ? "/" : href.replace(/\/$/, "");
    if (h === "/") return p === "/";
    if (href === '/dashboard/cars' && pathname.startsWith('/dashboard/cars/add')) return false;
    if (href === '/dashboard/pets' && pathname.startsWith('/dashboard/pets/add')) return false;
    return p === h || p.startsWith(h + '/');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
      if (msgRef.current && !msgRef.current.contains(e.target)) setOpenMsg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Smooth dropdown: animate max-height from 0 to content height
  const dropdownRef = useRef(null);
  const [dropdownMax, setDropdownMax] = useState(0);
  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;
    if (isMenuOpen) {
      // Measure full content height
      const full = el.scrollHeight || 0;
      setDropdownMax(full);
    } else {
      setDropdownMax(0);
    }
  }, [isMenuOpen, isSignedIn, t, user]);

  return (
    <header className="w-full h-16 px-4 bg-white dark:bg-dark-panel shadow-md flex justify-between items-center text-black dark:text-dark-text-primary transition-colors duration-300 relative">
      {/* Logo Section - Left Side */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Pawfect" width={150} height={40} className="h-20 md:h-14 w-auto object-contain dark:hidden" priority />
          <Image src="/whitelogo.png" alt="Pawfect" width={150} height={40} className="h-20 md:h-14 w-auto object-contain hidden dark:block" priority />
        </Link>
      </div>

      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Theme Toggle */}
        <ThemeToggle size={22} />

        {/* Status Icons: Messages & Notifications */}
        {isSignedIn && (
          <div className="flex items-center gap-1 md:gap-2">
            {/* Messages Icon & Dropdown */}
            <div className="relative" ref={msgRef}>
              <button
                onClick={() => setOpenMsg((v) => !v)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-300"
                title="Messages"
              >
                <BsChatLeftDots className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                {messageCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                    {messageCount > 9 ? "9+" : messageCount}
                  </span>
                )}
              </button>

              {openMsg && (
                <div className="fixed md:absolute inset-x-4 md:inset-auto md:right-0 mt-2 md:w-80 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl shadow-xl z-50 overflow-hidden transform md:translate-x-0">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-dark-divider">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Wiadomości</div>
                    <Link href="/dashboard/messages" onClick={() => setOpenMsg(false)} className="text-xs text-blue-600 hover:underline">Otwórz czat</Link>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {loadingMessages ? (
                      <div className="px-3 py-4 text-sm text-gray-500">Ładowanie...</div>
                    ) : displayMessages.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500">Brak wiadomości</div>
                    ) : (
                      <ul className="divide-y divide-gray-100 dark:divide-dark-divider">
                        {displayMessages.map((msg) => (
                          <li
                            key={msg.chatId}
                            className={`px-3 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-raised ${msg.unreadCount === 0 ? "opacity-60" : ""}`}
                            onClick={async () => {
                              setOpenMsg(false);
                              await markChatAsSeen(msg.chatId);
                              // Refresh to update unread counts
                              loadRecentMessages();
                              router.push(`/dashboard/messages?chatId=${encodeURIComponent(msg.chatId)}`);
                            }}
                          >
                            <Avatar src={msg.sender?.image} alt={msg.sender?.name} size={36} />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {msg.sender?.name || "Użytkownik"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-dark-text-muted line-clamp-1">
                                {msg.attachments?.length > 0
                                  ? `${msg.attachments.length} załącznik${msg.attachments.length > 1 ? 'ów' : ''}`
                                  : msg.content || "Nowa wiadomość"}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
                            </div>
                            {msg.unreadCount > 0 && (
                              <div className="mt-2 min-w-[18px] h-[18px] px-1.5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {msg.unreadCount > 9 ? '9+' : msg.unreadCount}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="px-3 py-2 border-t border-gray-100 dark:border-dark-divider text-center">
                    <Link href="/dashboard/messages" onClick={() => setOpenMsg(false)} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">
                      Zobacz wszystkie wiadomości
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setOpenNotif((v) => !v)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              >
                <FiBell className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {openNotif && (
                <div className="fixed md:absolute inset-x-4 md:inset-auto md:right-0 mt-2 md:w-80 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl shadow-xl z-50 overflow-hidden transform md:translate-x-0">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-200 dark:text-white">Powiadomienia</div>
                    {markAll && (
                      <button onClick={markAll} className="text-xs text-blue-600 hover:underline">
                        Oznacz wszystkie jako przeczytane
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {notificationsList.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Brak powiadomień</div>
                    ) : (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notificationsList.slice(0, 8).map((n) => (
                          <li key={n.id} className="px-0">
                            <Link
                              href={getNotifTarget(n)}
                              className={`px-3 py-2 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${n.read ? "opacity-60" : ""}`}
                              onClick={async () => {
                                try { if (!n.read && markRead) await markRead(n.id); } catch { }
                                setOpenNotif(false);
                              }}
                            >
                              <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? "bg-gray-300 dark:bg-gray-600" : "bg-blue-500"}`} />
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-200 dark:text-white truncate">{n.title}</div>
                                {n.body && <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{n.body}</div>}
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 text-right">
                    <Link href="/dashboard/notifications" onClick={() => setOpenNotif(false)} className="text-sm text-blue-600 hover:underline">
                      Zobacz wszystkie powiadomienia
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Account Section - Desktop Only */}
        <div className="hidden lg:block">
          {isSignedIn ? (
            <UserAccountDropdown />
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Navigation Toggle - Merged with User Info */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden flex items-center gap-2 p-1.5 pl-2 pr-3 bg-gray-50 dark:bg-dark-raised border border-gray-200 dark:border-dark-divider rounded-full transition-all active:scale-95"
          aria-label="Toggle Navigation"
        >
          {isSignedIn && user && (
            <Avatar
              src={user?.profilePicture || user?.image}
              alt={user?.firstName || "User"}
              size={24}
              className="ring-1 ring-blue-500/20"
            />
          )}
          {!isSignedIn && <FiUser className="w-5 h-5 text-gray-500" />}
          <div className="text-gray-700 dark:text-gray-300">
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </div>
        </button>
      </div>

      {/* Mobile Navigation Dropdown - Full Page Cover */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-dark-panel z-[100] lg:hidden overflow-y-auto animate-slideIn">
          {/* Top Bar for Mobile Menu */}
          <div className="h-16 px-4 border-b border-gray-100 dark:border-dark-divider flex justify-between items-center sticky top-0 bg-white/80 dark:bg-dark-panel/80 backdrop-blur-md z-10">
            <div className="flex items-center">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                <Image src="/logo.png" alt="Pawfect" width={150} height={48} className="h-10 md:h-12 w-auto object-contain dark:hidden" priority />
                <Image src="/whitelogo.png" alt="Pawfect" width={150} height={48} className="h-10 md:h-12 w-auto object-contain hidden dark:block" priority />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-raised rounded-xl transition-all"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-8 pb-10">
            {/* Profile Overview (If signed in) */}
            {isSignedIn && user && (
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-dark-card p-5 rounded-[2rem] border border-gray-100 dark:border-dark-divider">
                <Avatar src={user?.profilePicture || user?.image} alt="User" size={50} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                    {user?.firstName || "Użytkownik"}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                    {user?.sellerType === 'company' ? 'Shelter Account' : 'Pet Owner'}
                  </p>
                </div>
              </div>
            )}

            {/* UNIFIED TILE GRID (All Actions) */}
            <div className="grid grid-cols-2 gap-3">
              {mobileMenuItems.map((item) => (
                <QuickAccessBubble
                  key={item.label}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => setIsMenuOpen(false)}
                  active={isActive(item.href)}
                  badge={item.label === "Wiadomości" ? messageCount : 0}
                />
              ))}
            </div>

            {!isSignedIn ? (
              <div className="pt-4">
                <button
                  onClick={handleSignIn}
                  className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 animate-slideUp"
                >
                  Join the Community
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-sm font-black text-red-500 uppercase tracking-widest"
                >
                  <div className="flex items-center gap-4">
                    <FiLogOut size={20} />
                    <span>Wyloguj Się</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const ArrowRight = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>

function QuickAccessBubble({ href, icon, label, onClick, active = false, badge = 0 }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group flex flex-col items-center justify-center h-28 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all text-center px-4 gap-3 relative
        ${active
          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
          : "bg-gray-50 dark:bg-dark-card text-gray-900 dark:text-white border border-gray-100 dark:border-dark-divider hover:bg-blue-600 hover:text-white"
        }
      `}
    >
      <span className={`${active ? "" : "text-blue-500 group-hover:text-white"} transition-colors`}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </span>
      <span>{label}</span>

      {badge > 0 && (
        <span className={`absolute top-4 right-4 h-5 w-auto min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px] font-black ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export default Navbar;
