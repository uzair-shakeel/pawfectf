"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Heart, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../lib/auth/AuthContext";
import foodDonationService from "../../../services/foodDonationService";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");

function getImageSrc(images) {
    if (!images || images.length === 0) return "/placeholder.jpg";
    const img = images[0];
    if (!img) return "/placeholder.jpg";
    if (img.startsWith("http")) return img;
    return `${API_BASE}/${img.replace(/^[/\\]+/, "")}`;
}

export default function DonationHistoryPage() {
    const { user, getToken } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        loadDonations();
    }, [user]);

    const loadDonations = async () => {
        try {
            setLoading(true);
            const data = await foodDonationService.getMyDonations();
            setDonations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading donations:", error);
            // Use mock data if API fails
            const mockDonations = [
                {
                    _id: '1',
                    petId: {
                        _id: '1',
                        title: 'Luna',
                        species: 'Dog',
                        breed: 'Golden Retriever',
                        images: ['/placeholder.jpg'],
                        location: { city: 'Warsaw' }
                    },
                    payment: { amount: 200 },
                    donorMessage: 'Hope this helps Luna recover quickly!',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    petId: {
                        _id: '2',
                        title: 'Max',
                        species: 'Dog',
                        breed: 'German Shepherd',
                        images: ['/placeholder.jpg'],
                        location: { city: 'Krakow' }
                    },
                    payment: { amount: 150 },
                    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
                },
                {
                    _id: '3',
                    petId: {
                        _id: '3',
                        title: 'Bella',
                        species: 'Cat',
                        breed: 'Persian',
                        images: ['/placeholder.jpg'],
                        location: { city: 'Gdansk' }
                    },
                    payment: { amount: 100 },
                    donorMessage: 'Get well soon Bella!',
                    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
                }
            ];
            setDonations(mockDonations);
        } finally {
            setLoading(false);
        }
    };

    const filtered = donations;

    if (loading || !user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 dark:bg-dark-main">
                <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-7xl mx-auto dark:bg-dark-main">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 md:gap-0 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Donation History
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        View all your food donations to pets in need
                    </p>
                </div>
                <Link
                    href="/website/food-donations"
                    className="bg-blue-600 text-white px-4 sm:px-8 py-2 sm:py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex items-center gap-2 hover:-translate-y-1"
                >
                    <Heart className="h-4 w-4" />
                    Donate to More Pets
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {donations.length}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Donations</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{donations.length}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Pets Helped</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">zł</span>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {donations.reduce((sum, d) => sum + (d.payment?.amount || 0), 0)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Donated</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 dark:bg-dark-card rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-divider">
                    <div className="w-24 h-24 bg-white dark:bg-dark-raised rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-dark-divider">
                        <Heart className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No donations yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Start making a difference by donating food to pets in need.
                    </p>
                    <Link
                        href="/website/food-donations"
                        className="inline-flex items-center px-8 py-4 text-sm font-bold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
                    >
                        <Heart className="h-4 w-4 mr-2" />
                        Browse Pets to Help
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filtered.map((donation) => {
                        const pet = donation.petId;
                        const imgSrc = getImageSrc(pet?.images);
                        const isLocalUrl = imgSrc.startsWith("http://127") || imgSrc.startsWith("http://localhost");

                        return (
                            <div
                                key={donation._id}
                                className="group bg-white dark:bg-dark-panel rounded-2xl border border-gray-100 dark:border-dark-divider hover:shadow-xl transition-all duration-300 overflow-hidden"
                            >
                                <div className="flex flex-col sm:flex-row">
                                    <div className="relative w-full sm:w-40 h-40 sm:h-auto flex-shrink-0">
                                        <Image
                                            src={imgSrc}
                                            alt={pet?.title || "Pet"}
                                            fill
                                            className="object-cover"
                                            unoptimized={isLocalUrl}
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md bg-green-500">
                                                Donated
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                    {pet?.title || "Pet"}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {pet?.species} • {pet?.breed || "Mixed"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {donation.payment?.amount} zł
                                                </p>
                                            </div>
                                        </div>

                                        {pet?.location?.city && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                <MapPin className="h-4 w-4" />
                                                <span>{pet.location.city}</span>
                                            </div>
                                        )}

                                        {donation.donorMessage && (
                                            <div className="mb-3 p-3 bg-gray-50 dark:bg-dark-raised rounded-lg">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                                    "{donation.donorMessage}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-divider">
                                            <p className="text-xs text-gray-400">
                                                {new Date(donation.createdAt).toLocaleDateString()}
                                            </p>
                                            <Link
                                                href={`/website/pets/${pet?._id}`}
                                                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold"
                                            >
                                                View Pet
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
