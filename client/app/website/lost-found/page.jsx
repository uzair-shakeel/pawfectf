"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaSearch, FaFilter } from "react-icons/fa";
import { getAllLostFound } from "../../../services/lostFoundService";
import PetCard from "../../../components/website/PetCard";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");

const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/images/hamer1.png";
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) return imagePath;
    return `${API_BASE}/${imagePath.replace("\\", "/")}`;
};

export default function LostFoundPage() {
    const { t } = useLanguage();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [speciesFilter, setSpeciesFilter] = useState("All");
    const [locationFilter, setLocationFilter] = useState("");

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const data = await getAllLostFound();
                setEntries(data);
            } catch (error) {
                console.error("Failed to load lost and found entries", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);

    const filteredEntries = entries.filter(e => {
        if (filter !== "All" && e.type !== filter) return false;
        if (speciesFilter !== "All" && e.species !== speciesFilter) return false;
        if (locationFilter && !e.location?.city?.toLowerCase().includes(locationFilter.toLowerCase())) return false;
        return true;
    });

    const uniqueSpecies = ["All", ...new Set(entries.map(e => e.species).filter(Boolean))];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-main py-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white">{t("dashboard.lostFound.title", "Lost & Found Pets")}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">{t("dashboard.lostFound.subtitle", "Help reunite pets with their families.")}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
                    <div className="flex gap-2 bg-white dark:bg-dark-card p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-dark-divider w-full md:w-auto">
                        {["All", "Lost", "Found"].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${filter === t ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-raised'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        <div className="relative flex-1 md:w-48">
                            <select
                                value={speciesFilter}
                                onChange={(e) => setSpeciesFilter(e.target.value)}
                                className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl p-2.5 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none shadow-sm cursor-pointer"
                            >
                                {uniqueSpecies.map(s => (
                                    <option key={s} value={s}>{s === "All" ? t("dashboard.lostFound.allSpecies", "All Species") : s}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>

                        <div className="relative flex-1 md:w-56">
                            <FaSearch className="absolute left-3.5 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("dashboard.lostFound.searchCity", "Search city...")}
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div></div>
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-divider">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-dark-raised rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("dashboard.lostFound.noEntries", "No entries found")}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{t("dashboard.lostFound.noEntriesDesc", "There are currently no {type} pet reports.").replace("{type}", filter.toLowerCase())}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEntries.map(entry => (
                            <div key={entry._id}>
                                <PetCard
                                    pet={{
                                        _id: entry._id,
                                        createdBy: entry.reporterId,
                                        location: entry.location,
                                        images: entry.images,
                                        name: entry.title,
                                        species: entry.species,
                                        gender: entry.gender,
                                        href: `/website/lost-found/${entry._id}`,
                                        customLabel: entry.type === 'Lost' ? t("dashboard.lostFound.lostPet", "Lost Pet") : t("dashboard.lostFound.foundPet", "Found Pet"),
                                        adoptionFee: 0,
                                    }}
                                    viewMode="grid"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
