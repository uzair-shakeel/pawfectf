"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserLostFound, deleteLostFound } from "../../../services/lostFoundService";
import { useAuth } from "../../../lib/auth/AuthContext";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import Image from "next/image";
import { FaTrash, FaPlus, FaSearch } from "react-icons/fa";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");

export default function UserLostFoundPage() {
    const { t } = useLanguage();
    const { getToken } = useAuth();
    const router = useRouter();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const data = await getUserLostFound(getToken);
                setEntries(data);
            } catch (error) {
                console.error("Failed to load your lost and found entries", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, [getToken]);

    const handleDelete = async (id) => {
        if (!confirm(t("dashboard:lostFound.confirmDelete", "Are you sure you want to delete this report?"))) return;
        try {
            await deleteLostFound(id, getToken);
            setEntries(entries.filter(e => e._id !== id));
        } catch (error) {
            console.error("Failed to delete entry:", error);
            alert(t("dashboard.lostFoundDashboard.deleteFailed", "Failed to delete report."));
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t("dashboard.lostFoundDashboard.title", "My Lost & Found Reports")}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t("dashboard.lostFoundDashboard.subtitle", "Manage your active lost or found pet reports.")}</p>
                </div>
                <Link href="/dashboard/lost-found/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95">
                    <FaPlus /> {t("dashboard:lostFound.reportPet", "Report Pet")}
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div></div>
            ) : entries.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FaSearch /></div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("dashboard:lostFound.noReports", "No reports yet")}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t("dashboard:lostFound.noReportsDesc", "You haven't reported any lost or found pets.")}</p>
                    <Link href="/dashboard/lost-found/new" className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2.5 px-6 rounded-xl transition-colors">
                        {t("dashboard:lostFound.createReport", "Create Report")}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entries.map(entry => (
                        <div key={entry._id} className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-dark-divider group flex flex-col">
                            <div className="relative h-48 w-full bg-gray-100 dark:bg-dark-raised">
                                {entry.images && entry.images.length > 0 ? (
                                    <Image src={entry.images[0].startsWith('http') ? entry.images[0] : `${API_BASE}/${entry.images[0].replace("\\", "/")}`} alt={entry.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">{t("dashboard.lostFoundDashboard.noImage", "No Image")}</div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md ${entry.type === 'Lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                                        {entry.type}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-lg">
                                    {entry.status}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">{entry.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{new Date(entry.dateLostOrFound).toLocaleDateString()}</p>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-dark-divider flex justify-between items-center">
                                    <Link href={`/website/lost-found`} className="text-sm text-blue-600 font-bold hover:underline">{t("dashboard:lostFound.viewPublic", "View Public")}</Link>
                                    <button onClick={() => handleDelete(entry._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
