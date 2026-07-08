"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Eye, Heart, MapPin, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../lib/auth/AuthContext";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import { getPetsByUserId, deletePet } from "../../../services/petService";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");

function getImageSrc(images) {
    if (!images || images.length === 0) return "/placeholder.jpg";
    const img = images[0];
    if (img.startsWith("http")) return img;
    return `${API_BASE}/${img.replace(/^[/\\]+/, "")}`;
}

export default function FoodPetsPage() {
    const { t } = useLanguage();
    const { user, getToken, userId } = useAuth();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (!userId) return;
        loadPets();
    }, [userId]);

    const loadPets = async () => {
        try {
            setLoading(true);
            const data = await getPetsByUserId(userId, getToken);
            // Filter only pets with type 'food_donation'
            const foodDonationPets = data.filter(pet => pet.type === 'food_donation');
            setPets(foodDonationPets);
        } catch (error) {
            console.error("Error loading pets:", error);
            toast.error("Failed to load pets");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (petId) => {
        if (!window.confirm(t("dashboard:foodDonations.confirmDelete", "Are you sure you want to delete this pet listing?"))) return;
        try {
            await deletePet(petId, getToken);
            toast.success("Pet removed");
            loadPets();
        } catch (error) {
            toast.error("Failed to delete: " + (error?.message || error));
        }
    };

    const filtered = pets.filter((pet) => {
        const matchesSearch =
            !search ||
            pet.title?.toLowerCase().includes(search.toLowerCase()) ||
            pet.species?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || pet.status?.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading || !user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 dark:bg-dark-main">
                <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">{t("dashboard:foodDonations.loading", "Loading...")}</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-7xl mx-auto dark:bg-dark-main">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 md:gap-0 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {t("dashboard:foodDonations.title", "Food Donation Pets")}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        {t("dashboard:foodDonations.subtitle", "Manage pets listed for food sponsorship")}
                    </p>
                </div>
                <Link
                    href="/dashboard/food-pets/add"
                    className="bg-blue-600 text-white px-4 sm:px-8 py-2 sm:py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex items-center gap-2 hover:-translate-y-1"
                >
                    <Plus className="h-4 w-4" />
                    {t("dashboard:foodDonations.addPet", "Add Pet for Food Donations")}
                </Link>
            </div>

            {/* Pending notice */}
            {pets.some((p) => p.status !== "Approved") && (
                <div className="mb-8 rounded-2xl border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 p-4 text-yellow-800 dark:text-yellow-200 flex items-start gap-3 shadow-sm">
                    <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <h4 className="font-bold">{t("dashboard:foodDonations.pendingApproval", "Pending Approval")}</h4>
                        <p className="text-sm mt-1 opacity-90">
                            {t("dashboard:foodDonations.pendingDesc", "Some pets are under review. They will be visible to donors once approved by an administrator.")}
                        </p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {pets.filter((p) => p.status === "Approved").length}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t("dashboard:foodDonations.approved", "Approved")}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {pets.filter((p) => p.status === "Pending").length}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t("dashboard:foodDonations.pending", "Pending")}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {pets.filter((p) => p.status === "Rejected").length}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t("dashboard:foodDonations.rejected", "Rejected")}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{pets.length}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t("dashboard:foodDonations.totalListed", "Total Listed")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-5 mb-8 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder={t("dashboard:foodDonations.searchPlaceholder", "Search by pet name or species...")}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-divider dark:bg-dark-raised rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2.5 border border-gray-200 dark:border-dark-divider dark:bg-dark-raised rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">{t("dashboard:foodDonations.allStatus", "All Status")}</option>
                    <option value="pending">{t("dashboard:foodDonations.pending", "Pending")}</option>
                    <option value="approved">{t("dashboard:foodDonations.approved", "Approved")}</option>
                    <option value="rejected">{t("dashboard:foodDonations.rejected", "Rejected")}</option>
                </select>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 dark:bg-dark-card rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-divider">
                    <div className="w-24 h-24 bg-white dark:bg-dark-raised rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-dark-divider">
                        <Heart className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {t("dashboard:foodDonations.noPets", "No pets listed yet")}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        {t("dashboard:foodDonations.noPetsDesc", "List your pets to start receiving food donations from caring supporters.")}
                    </p>
                    <Link
                        href="/dashboard/food-pets/add"
                        className="inline-flex items-center px-8 py-4 text-sm font-bold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("dashboard:foodDonations.addFirst", "Add Your First Pet")}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filtered.map((pet) => (
                        <div
                            key={pet._id}
                            className="group bg-white dark:bg-dark-panel rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-divider hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            <div className="relative mb-4 rounded-xl overflow-hidden h-48">
                                <Image
                                    src={getImageSrc(pet.images)}
                                    alt={pet.title || "Pet"}
                                    fill
                                    className="object-cover"
                                    unoptimized={getImageSrc(pet.images).startsWith("http://127") || getImageSrc(pet.images).startsWith("http://localhost")}
                                />
                                <div className="absolute top-3 left-3">
                                    {pet.status === "Approved" ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>{t("dashboard:foodDonations.approved", "Approved")}
                                        </span>
                                    ) : pet.status === "Pending" ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>{t("dashboard:foodDonations.pending", "Pending")}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>{t("dashboard:foodDonations.rejected", "Rejected")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    {pet.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    {pet.species}{pet.breed ? ` • ${pet.breed}` : ""}
                                    {pet.ageMonths ? ` • ${Math.floor(pet.ageMonths / 12)}y` : ""}
                                </p>
                                {pet.location?.city && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                                        <MapPin className="h-3 w-3" />
                                        {pet.location.city}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-dark-divider mt-auto">
                                <p className="text-xs text-gray-400">
                                    {new Date(pet.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/website/pets/${pet._id}`}
                                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        {t("dashboard:foodDonations.view", "View")}
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(pet._id)}
                                        className="text-xs text-red-500 hover:text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        {t("dashboard:foodDonations.delete", "Delete")}
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
