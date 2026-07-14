"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import Avatar from "./Avatar";
import {
    FiUser,
    FiLayout,
    FiSearch,
    FiHeart,
    FiLogOut,
    FiChevronDown,
    FiPhone,
    FiHome
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function UserAccountDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isSignedIn, logout } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const dropdownRef = useRef(null);

    // Dynamic first link: If in dashboard, go home. If on website, go to dashboard.
    const isInDashboard = pathname?.startsWith('/dashboard');
    const firstLink = isInDashboard
        ? { label: t("dashboard.userDropdown.home", "Home"), href: "/", icon: <FiHome /> }
        : { label: t("dashboard.userDropdown.panel", "Panel"), href: "/dashboard/home", icon: <FiLayout /> };

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
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
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-raised transition-all border border-gray-100 dark:border-dark-divider group"
            >
                <Avatar
                    src={user?.image || user?.profilePicture}
                    alt={user?.firstName || "User"}
                    size={32}
                    className="ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all"
                />
                <div className="hidden md:flex flex-col items-start pr-1 max-w-[120px]">
                    <span className="text-sm font-black leading-tight text-gray-900 dark:text-dark-text-primary truncate w-full text-left">
                        {user?.firstName || t("dashboard.navbar.user", "User")}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t("dashboard.userDropdown.account", "Account")}</span>
                </div>
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-64 bg-white dark:bg-dark-panel border border-gray-200 dark:border-dark-divider shadow-2xl rounded-2xl overflow-hidden z-[100] border-t-4 border-t-blue-600"
                    >
                        {/* Header info */}
                        <div className="p-4 bg-gray-50/50 dark:bg-dark-card/50 border-b border-gray-100 dark:border-dark-divider">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t("dashboard.userDropdown.signedInAs", "Signed in as")}</p>
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={user?.image || user?.profilePicture}
                                    alt={user?.firstName || "User"}
                                    size={36}
                                />
                                <div className="min-w-0">
                                    <p className="text-md font-bold text-gray-900 dark:text-dark-text-primary truncate">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-dark-text-muted truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 space-y-0.5">
                            <DropdownItem
                                icon={firstLink.icon}
                                label={firstLink.label}
                                onClick={() => navigateTo(firstLink.href)}
                                isPrimary={true}
                            />
                            <DropdownItem
                                icon={<FiUser />}
                                label={t("dashboard.userDropdown.profileSettings", "Profile Settings")}
                                onClick={() => navigateTo("/dashboard/profile")}
                            />
                            <DropdownItem
                                icon={<FiHeart />}
                                label={t("dashboard.userDropdown.foodDonations", "Food Donations")}
                                onClick={() => navigateTo("/website/food-donations")}
                            />
                            <DropdownItem
                                icon={<FiHeart />}
                                label={t("dashboard.userDropdown.donationHistory", "Donation History")}
                                onClick={() => navigateTo("/dashboard/donation-history")}
                            />
                            <DropdownItem
                                icon={<FiSearch />}
                                label={t("dashboard.userDropdown.lostFound", "Lost & Found")}
                                onClick={() => navigateTo("/website/lost-found")}
                            />
                            <DropdownItem
                                icon={<FiPhone />}
                                label={t("dashboard.userDropdown.contactUs", "Contact Us")}
                                onClick={() => navigateTo("/website/contact")}
                            />
                        </div>

                        <div className="p-2 border-t border-gray-100 dark:border-dark-divider bg-gray-50/30 dark:bg-dark-card/30">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-md font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                            >
                                <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <FiLogOut className="w-4 h-4" />
                                </div>
                                {t("dashboard.userDropdown.logoutAccount", "Logout Account")}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DropdownItem({ icon, label, onClick, isPrimary = false }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-md font-bold text-gray-700 dark:text-dark-text-secondary hover:bg-blue-600 transition-all group"
        >
            <div className={`p-1.5 rounded-lg transition-colors ${isPrimary ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400"
                } group-hover:bg-white/20 group-hover:text-white`}>
                {React.cloneElement(icon, { className: "w-4 h-4" })}
            </div>
            <span className="group-hover:text-white transition-colors">
                {label}
            </span>
        </button>
    );
}
