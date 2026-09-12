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

    <header className="marketing-ui sticky top-0 z-[100] grid h-[60px] w-full grid-cols-[1fr_auto_1fr] items-center bg-[#F4F7FB] px-4 text-[#0F172A] dark:bg-dark-panel dark:text-dark-text-primary md:h-20 sm:px-8 border-b border-[#E2E8F0] dark:border-dark-divider">

      <div className="col-start-1 flex shrink-0 items-center justify-self-start gap-2">

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

      <nav className="col-start-2 hidden items-center justify-center gap-8 justify-self-center lg:flex">

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

      <div className="col-start-3 flex items-center justify-self-end space-x-2 md:space-x-3">

        <ThemeToggle size={isSignedIn ? "sm" : "md"} />



        {/* Status Icons: Messages & Notifications */}

        {isSignedIn && (

          <div className="flex items-center gap-1 md:gap-2">

            {/* Messages Icon & Dropdown */}

            <div className="relative" ref={msgRef}>

              <button

                onClick={() => setOpenMsg((v) => !v)}

                className="relative flex h-9 w-9 items-center justify-center text-[#0F172A] transition hover:text-[#2563EB] dark:text-white dark:hover:text-[#93C5FD]"

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

                <div className="fixed inset-x-4 z-50 mt-2 overflow-hidden border border-[#E2E8F0] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-dark-divider dark:bg-[#202020] md:absolute md:inset-auto md:right-0 md:w-80">

                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3 dark:border-dark-divider">

                    <div className="text-sm font-semibold text-[#0F172A] dark:text-white">Wiadomości</div>

                    <Link href="/dashboard/messages" onClick={() => setOpenMsg(false)} className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]">Otwórz czat</Link>

                  </div>

                  <div className="max-h-96 overflow-auto">

                    {loadingMessages ? (

                      <div className="px-4 py-8 text-center text-sm text-[#64748B]">Ładowanie...</div>

                    ) : displayMessages.length === 0 ? (

                      <div className="px-4 py-8 text-center text-sm text-[#64748B]">Brak wiadomości</div>

                    ) : (

                      <ul className="divide-y divide-[#E2E8F0] dark:divide-dark-divider">

                        {displayMessages.map((msg) => (

                          <li

                            key={msg.chatId}

                            className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-[#EEF2FF] dark:hover:bg-white/5 ${msg.unreadCount === 0 ? "opacity-60" : ""}`}

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

                              <div className="truncate text-sm font-semibold text-[#0F172A] dark:text-white">

                                {msg.sender?.name || "Użytkownik"}

                              </div>

                              <div className="line-clamp-1 text-xs text-[#64748B]">

                                {msg.attachments?.length > 0

                                  ? `${msg.attachments.length} załącznik${msg.attachments.length > 1 ? 'ów' : ''}`

                                  : msg.content || "Nowa wiadomość"}

                              </div>

                              <div className="mt-1 text-[10px] text-[#94A3B8]">{new Date(msg.createdAt).toLocaleString()}</div>

                            </div>

                            {msg.unreadCount > 0 && (

                              <div className="mt-2 flex h-[18px] min-w-[18px] shrink-0 items-center justify-center bg-[#2563EB] px-1.5 text-[10px] font-bold text-white">

                                {msg.unreadCount > 9 ? '9+' : msg.unreadCount}

                              </div>

                            )}

                          </li>

                        ))}

                      </ul>

                    )}

                  </div>

                  <div className="border-t border-[#E2E8F0] px-4 py-3 text-center dark:border-dark-divider">

                    <Link href="/dashboard/messages" onClick={() => setOpenMsg(false)} className="text-xs font-bold uppercase tracking-[0.14em] text-[#2563EB] hover:text-[#1D4ED8]">

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

                className="relative flex h-9 w-9 items-center justify-center text-[#0F172A] transition hover:text-[#2563EB] dark:text-white dark:hover:text-[#93C5FD]"

              >

                <FiBell className="w-5 h-5 md:w-[22px] md:h-[22px]" />

                {unreadCount > 0 && (

                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">

                    {unreadCount > 9 ? "9+" : unreadCount}

                  </span>

                )}

              </button>

              {openNotif && (

                <div className="fixed inset-x-4 z-50 mt-2 overflow-hidden border border-[#E2E8F0] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-dark-divider dark:bg-[#202020] md:absolute md:inset-auto md:right-0 md:w-80">

                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3 dark:border-dark-divider">

                    <div className="text-sm font-semibold text-[#0F172A] dark:text-white">Powiadomienia</div>

                    {markAll && (

                      <button type="button" onClick={markAll} className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]">

                        Oznacz wszystkie jako przeczytane

                      </button>

                    )}

                  </div>

                  <div className="max-h-96 overflow-auto">

                    {notificationsList.length === 0 ? (

                      <div className="px-4 py-8 text-center text-sm text-[#64748B]">Brak powiadomień</div>

                    ) : (

                      <ul className="divide-y divide-[#E2E8F0] dark:divide-dark-divider">

                        {notificationsList.slice(0, 8).map((n) => (

                          <li key={n.id} className="px-0">

                            <Link

                              href={getNotifTarget(n)}

                              className={`flex items-start gap-3 px-4 py-3 transition hover:bg-[#EEF2FF] dark:hover:bg-white/5 ${n.read ? "opacity-60" : ""}`}

                              onClick={async () => {

                                try { if (!n.read && markRead) await markRead(n.id); } catch { }

                                setOpenNotif(false);

                              }}

                            >

                              <div className={`mt-1.5 h-2 w-2 shrink-0 ${n.read ? "bg-[#CBD5E1] dark:bg-[#4B5563]" : "bg-[#2563EB]"}`} />

                              <div className="min-w-0 flex-1">

                                <div className="truncate text-sm font-semibold text-[#0F172A] dark:text-white">{n.title}</div>

                                {n.body && <div className="line-clamp-2 text-xs text-[#64748B]">{n.body}</div>}

                                <div className="mt-1 text-[10px] text-[#94A3B8]">{new Date(n.createdAt).toLocaleString()}</div>

                              </div>

                            </Link>

                          </li>

                        ))}

                      </ul>

                    )}

                  </div>

                  <div className="border-t border-[#E2E8F0] px-4 py-3 text-center dark:border-dark-divider">

                    <Link href="/dashboard/notifications" onClick={() => setOpenNotif(false)} className="text-xs font-bold uppercase tracking-[0.14em] text-[#2563EB] hover:text-[#1D4ED8]">

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

              className="flex h-10 items-center px-5 bg-[#2563EB] text-[13px] font-semibold text-white hover:bg-[#1D4ED8] transition-colors"

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
                  className="flex h-12 w-full items-center justify-center border border-white/25 text-[15px] font-semibold text-white"
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

