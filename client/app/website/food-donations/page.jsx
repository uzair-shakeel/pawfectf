"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaSearch, FaHeart } from "react-icons/fa";
import PetCard from "../../../components/website/PetCard";
import { getAllPets } from "../../../services/petService";
import FoodDonationHero from "../../../components/website/FoodDonationHero";
import FoodDonationStats from "../../../components/website/FoodDonationStats";

export default function FoodDonationsPage() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [speciesFilter, setSpeciesFilter] = useState("All");
    const [locationFilter, setLocationFilter] = useState("");

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const data = await getAllPets();
                // Filter to show ONLY pets marked for food donations
                const foodDonationPets = Array.isArray(data)
                    ? data.filter((p) => p.status === "Approved" && p.type === 'food_donation')
                    : [];
                setPets(foodDonationPets);
            } catch (error) {
                console.error("Failed to load pets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

    const uniqueSpecies = ["All", ...new Set(pets.map((p) => p.species).filter(Boolean))];

    const filtered = pets.filter((pet) => {
        if (speciesFilter !== "All" && pet.species !== speciesFilter) return false;
        if (
            locationFilter &&
            !pet.location?.city?.toLowerCase().includes(locationFilter.toLowerCase())
        )
            return false;
        return true;
    });

    return (
        <>
            <div className="py-12 px-4 sm:px-6 bg-white dark:bg-dark-main">
                <div className="max-w-7xl mx-auto">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-3 mb-10">
                        <div className="relative flex-1 md:max-w-xs">
                            <select
                                value={speciesFilter}
                                onChange={(e) => setSpeciesFilter(e.target.value)}
                                className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl p-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none shadow-sm cursor-pointer"
                            >
                                {uniqueSpecies.map((s) => (
                                    <option key={s} value={s}>
                                        {s === "All" ? "All Species" : s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="relative flex-1 md:max-w-xs">
                            <FaSearch className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search city..."
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-divider rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-divider">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 text-3xl">
                                <FaHeart />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                No pets need food support yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Check back later or help spread the word.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map((pet) => (
                                <PetCard
                                    key={pet._id}
                                    car={{
                                        ...pet,
                                        customLabel: "Needs Food Support",
                                        href: `/website/food-donations/donate/${pet._id}`
                                    }}
                                    viewMode="grid"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
