"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiHeart, FiHome, FiLayout, FiLogOut, FiPhone, FiSearch, FiUser } from "react-icons/fi";
import { useAuth } from "../../lib/auth/AuthContext";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import Avatar from "./Avatar";

export default function UserAccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isSignedIn, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const isInDashboard = pathname?.startsWith("/dashboard");
  const firstLink = isInDashboard
    ? { label: t("dashboard.userDropdown.home", "Strona główna"), href: "/", icon: <FiHome /> }
    : { label: t("dashboard.userDropdown.panel", "Panel"), href: "/dashboard/home", icon: <FiLayout /> };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
  };

  const navigateTo = (path) => {
    router.push(path);
    setIsOpen(false);
  };

  if (!isSignedIn) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1 pl-1 pr-2 transition hover:text-[#2563EB] dark:hover:text-[#93C5FD]"
      >
        <Avatar src={user?.image || user?.profilePicture} alt={user?.firstName || "User"} size={32} />
        <div className="hidden max-w-[120px] flex-col items-start pr-0.5 md:flex">
          <span className="w-full truncate text-left text-sm font-semibold leading-tight text-[#0F172A] dark:text-white">
            {user?.firstName || t("dashboard.navbar.user", "Użytkownik")}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
            {t("dashboard.userDropdown.account", "Konto")}
          </span>
        </div>
        <FiChevronDown className={`h-4 w-4 text-[#64748B] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-[100] mt-3 w-72 overflow-hidden border border-[#E2E8F0] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-dark-divider dark:bg-[#202020]"
          >
            <div className="border-b border-[#E2E8F0] px-4 py-4 dark:border-dark-divider">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                {t("dashboard.userDropdown.signedInAs", "Zalogowany jako")}
              </p>
              <div className="flex items-center gap-3">
                <Avatar src={user?.image || user?.profilePicture} alt={user?.firstName || "User"} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F172A] dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="truncate text-xs text-[#64748B]">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="py-1">
              <DropdownItem icon={firstLink.icon} label={firstLink.label} onClick={() => navigateTo(firstLink.href)} />
              <DropdownItem
                icon={<FiUser />}
                label={t("dashboard.userDropdown.profileSettings", "Ustawienia profilu")}
                onClick={() => navigateTo("/dashboard/profile")}
              />
              <DropdownItem
                icon={<FiHeart />}
                label={t("dashboard.userDropdown.foodDonations", "Darowizny żywności")}
                onClick={() => navigateTo("/website/food-donations")}
              />
              <DropdownItem
                icon={<FiHeart />}
                label={t("dashboard.userDropdown.donationHistory", "Historia darowizn")}
                onClick={() => navigateTo("/dashboard/donation-history")}
              />
              <DropdownItem
                icon={<FiSearch />}
                label={t("dashboard.userDropdown.lostFound", "Zaginione i znalezione")}
                onClick={() => navigateTo("/website/lost-found")}
              />
              <DropdownItem
                icon={<FiPhone />}
                label={t("dashboard.userDropdown.contactUs", "Kontakt")}
                onClick={() => navigateTo("/website/contact")}
              />
            </div>

            <div className="border-t border-[#E2E8F0] dark:border-dark-divider">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <FiLogOut className="h-4 w-4" />
                {t("dashboard.userDropdown.logoutAccount", "Wyloguj konto")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#0F172A] transition hover:bg-[#EEF2FF] hover:text-[#2563EB] dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-[#93C5FD]"
    >
      {React.cloneElement(icon, { className: "h-4 w-4 shrink-0 text-[#2563EB]" })}
      <span>{label}</span>
    </button>
  );
}
