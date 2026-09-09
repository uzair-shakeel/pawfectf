"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

import Link from "next/link";

import Image from "next/image";

import { useRouter } from "next/navigation";

import dynamic from "next/dynamic";

import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";



// Lazy load heavy components

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

import { FiBell, FiMenu, FiX, FiSearch, FiHeart, FiLifeBuoy, FiPhone, FiLogOut, FiHome, FiChevronRight, FiMapPin } from "react-icons/fi";

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



  const handleJoin = () => {
    setIsMenuOpen(false);
    router.push("/sign-up");
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

      label: t("navbar.dashboard", "Panel"),

      href: "/dashboard/home",

      icon: <RiDashboardHorizontalLine className="w-6 h-6" />,

    },

    {

      label: t("navbar.becomeSeller", "Wystaw zwierzę"),

      href: "/dashboard/pets/add",

      icon: <BiAddToQueue className="w-6 h-6" />,

    },

    {

      label: t("navbar.myListings", "Moje ogłoszenia"),

      href: "/dashboard/pets",

      icon: <FaPaw className="w-6 h-6" />,

    },

    {

      label: t("navbar.messages", "Wiadomości"),

      href: "/dashboard/messages",

      icon: <BsChatLeftDots className="w-6 h-6" />,

    },

    {

      label: t("navbar.profile", "Profil"),

      href: "/dashboard/profile",

      icon: <BsPersonGear className="w-6 h-6" />,

    },

  ];



  const websiteLinks = [

    { label: t("navbar.links.home", "Home"), href: "/", icon: <FiHome className="w-6 h-6" /> },

    { label: t("navbar.links.adopt", "Adopt"), href: "/website/pets", icon: <FiSearch className="w-6 h-6" /> },

    { label: t("navbar.links.lostFound", "Lost & Found"), href: "/website/lost-found", icon: <FiMapPin className="w-6 h-6" /> },

    { label: t("navbar.links.saved", "Saved"), href: "/wishlist", icon: <FiHeart className="w-6 h-6" /> },

    { label: t("navbar.links.faq", "FAQ"), href: "/website/faq", icon: <FiLifeBuoy className="w-6 h-6" /> },

    { label: t("navbar.links.contact", "Contact"), href: "/website/contact", icon: <FiPhone className="w-6 h-6" /> },

  ];



  const isActive = (href) => {

    if (!pathname || !href) return false;

    const p = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

    const h = href === "/" ? "/" : href.replace(/\/$/, "");

    if (h === "/") return p === "/";

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



  const [menuMounted, setMenuMounted] = useState(false);
  useEffect(() => { setMenuMounted(true); }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setIsMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);



  return (

    <header className="marketing-ui sticky top-0 z-[100] w-full h-[60px] md:h-20 px-4 sm:px-8 bg-[#F4F7FB] dark:bg-dark-panel border-b border-[#E2E8F0] dark:border-dark-divider flex justify-between items-center text-[#0F172A] dark:text-dark-text-primary">

      <div className="flex items-center gap-2 shrink-0">

        <Link href="/" className="flex items-center">

          <Image

            src="/logo.png"

            alt="Rafraf"

            width={150}

            height={30}

            className="h-9 w-auto object-contain dark:hidden md:h-14"

            priority

          />

          <Image

            src="/whitelogo.png"

            alt="Rafraf"

            width={150}

            height={30}

            className="h-9 w-auto object-contain hidden dark:block md:h-14"

            priority

          />

        </Link>

      </div>

      <nav className="hidden lg:flex flex-1 items-center justify-center gap-8">

        {websiteLinks.filter((link) => link.href !== "/").map((link) => (

          <Link

            key={link.href}

            href={link.href}

            className={`text-[15px] font-semibold transition-colors ${

              isActive(link.href)

                ? "text-[#2563EB]"

                : "text-[#0F172A] hover:text-[#2563EB] dark:text-white dark:hover:text-[#93C5FD]"

            }`}

          >

            {link.label}

          </Link>

        ))}

      </nav>

      <div className="flex items-center space-x-2 md:space-x-3">

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

              className="flex h-12 items-center gap-2 px-6 bg-[#2563EB] text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#1D4ED8] transition-colors"

            >

              {t("navbar.login", "Login")}

            </button>

          )}

        </div>



        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="lg:hidden flex h-9 w-9 items-center justify-center bg-[#2563EB] text-white"
          aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>

      </div>



      {menuMounted && isMenuOpen && createPortal(
        <div className="marketing-ui fixed inset-0 z-[200] flex flex-col bg-[#0B1220] text-white lg:hidden">
          <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-8 md:h-20">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
              <Image
                src="/whitelogo.png"
                alt="Rafraf"
                width={150}
                height={30}
                className="h-9 w-auto object-contain md:h-14"
              />
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center bg-white/10 text-white"
              aria-label="Zamknij menu"
            >
              <FiX size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            {isSignedIn && user && (
              <div className="mb-3 flex items-center gap-3 bg-white/5 px-3 py-3">
                <Avatar src={user?.profilePicture || user?.image} alt="User" size={40} />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">{user?.firstName || t("navbar.profile", "Profil")}</p>
                  <p className="text-xs text-white/45">{t("navbar.profile", "Profil")}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {websiteLinks.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex min-h-[52px] items-center gap-3 px-3 ${
                      active ? "bg-[#2563EB] text-white" : "text-white"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${active ? "bg-white/20 text-white" : "bg-white/10 text-[#93C5FD]"}`}>
                      {React.cloneElement(item.icon, { className: "h-5 w-5" })}
                    </span>
                    <span className="flex-1 text-[16px] font-semibold">{item.label}</span>
                    <FiChevronRight className="h-4 w-4 opacity-35" />
                  </Link>
                );
              })}
            </div>

            {isSignedIn && (
              <div className="mt-4 border-t border-white/10 pt-3">
                {dashboardMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex min-h-[48px] items-center gap-3 px-3 text-white"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-white/10 text-[#93C5FD]">
                      {React.cloneElement(item.icon, { className: "h-5 w-5" })}
                    </span>
                    <span className="flex-1 text-[13px] font-semibold">{item.label}</span>
                    {item.href === "/dashboard/messages" && messageCount > 0 && (
                      <span className="min-w-[20px] rounded-full bg-red-500 px-1.5 text-center text-[10px] font-bold text-white">{messageCount}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          <div className="shrink-0 space-y-2 border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {!isSignedIn ? (
              <>
                <button
                  type="button"
                  onClick={handleJoin}
                  className="flex h-12 w-full items-center justify-center bg-[#2563EB] text-[12px] font-bold uppercase tracking-[0.16em] text-white"
                >
                  {t("navbar.join", "Dołącz do społeczności")}
                </button>
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="flex h-12 w-full items-center justify-center border border-white/25 text-[12px] font-bold uppercase tracking-[0.16em] text-white"
                >
                  {t("navbar.login", "Login")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-12 w-full items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-red-400"
              >
                <FiLogOut size={18} />
                {t("navbar.logout", "Wyloguj")}
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

    </header>

  );

};



export default Navbar;

