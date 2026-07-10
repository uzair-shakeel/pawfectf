"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Clock, Heart, ArrowRight } from "lucide-react";
import { getAllPets } from "../../../services/petService";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

export default function FoodDonationsPage() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const data = await getAllPets();
                // Filter to show ONLY approved pets marked for food donations
                const foodDonationPets = Array.isArray(data)
                    ? data.filter((p) => p.status === "Approved" && p.type === 'food_donation')
                    : [];
                // Sort by newest first
                foodDonationPets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPets(foodDonationPets);
            } catch (error) {
                console.error("Failed to load pets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };

    return (
        <div className="bg-white dark:bg-dark-main min-h-screen">
            {/* Hero Banner */}
            <div className="mx-4 pt-4 text-center rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat relative">
                <div
                    className="w-full h-[300px] md:h-[500px] relative"
                    style={{
                        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=2000')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center px-4">
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                                {t('foodDonation.listings.title')}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-2xl mx-auto">
                                {t('foodDonation.listings.subtitle')}
                            </p>
                            <Link
                                href="/dashboard/food-pets/add"
                                className="inline-block bg-white text-blue-700 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all shadow-xl"
                            >
                                {t('foodDonation.listings.listPet')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-divider shadow-sm text-center">
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">450+</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{t('foodDonation.listings.petsFed')}</div>
                    </div>
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-divider shadow-sm text-center">
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">25</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{t('foodDonation.listings.shelters')}</div>
                    </div>
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-divider shadow-sm text-center">
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">15k zł</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{t('foodDonation.listings.donated')}</div>
                    </div>
                </div>

                {/* Pets Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : pets.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-divider">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('foodDonation.listings.noPets')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {t('foodDonation.listings.checkBack')}
                        </p>
                        <Link
                            href="/website/pets"
                            className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                        >
                            {t('foodDonation.listings.browseAdoption')} <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pets.map((pet) => (
                            <Link
                                key={pet._id}
                                href={`/website/food-donations/donate/${pet._id}`}
                                className="group bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-divider overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src={pet.images?.[0] || '/placeholder.jpg'}
                                        alt={pet.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {pet.isUrgent && (
                                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                                            🚨 {t('foodDonation.listings.urgent')}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {pet.name}
                                        </h3>
                                        <Heart className="h-5 w-5 text-gray-400 group-hover:text-red-500 group-hover:fill-red-500 transition-all flex-shrink-0" />
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {pet.breed || pet.species} • {pet.species}
                                    </p>

                                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{pet.location?.city || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{getTimeAgo(pet.createdAt)}</span>
                                        </div>
                                    </div>

                                    {pet.foodNeed && typeof pet.foodNeed === 'string' && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                            {pet.foodNeed}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-divider">
                                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {t('foodDonation.listings.donateFood')}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
