"use client";

import { useState, useEffect } from "react";
import CarCard from "./CarCard";
import { getAllPets } from "../../services/petService";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function CarsGridSection() {
    const { t } = useLanguage();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [displayCount, setDisplayCount] = useState(8);

    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllPets();
                if (Array.isArray(data)) {
                    setCars(data);
                } else if (data?.cars && Array.isArray(data.cars)) {
                    setCars(data.cars);
                } else {
                    throw new Error("Fetched data is not an array");
                }
            } catch (error) {
                console.error("Error fetching cars:", error);
                setError(error.message || "Failed to fetch cars");
                setCars([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    const handleLoadMore = () => {
        setDisplayCount((prev) => prev + 4);
    };

    if (loading && cars.length === 0) {
        return (
            <section className="py-12 bg-white dark:bg-dark-main">
                <div className="mx-auto px-4 max-w-7xl">
                    <div className="mb-8 animate-pulse">
                        <div className="h-10 w-64 md:w-80 bg-gray-200 dark:bg-gray-800 rounded-xl mb-3"></div>
                        <div className="h-5 w-48 md:w-64 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="animate-pulse px-2">
                                <div className="h-[220px] bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4 relative overflow-hidden">
                                    <div className="absolute bottom-3 left-3 h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-lg w-5/6"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded-md w-full"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded-md w-2/3"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!loading && (error || cars.length === 0)) {
        return null;
    }

    return (
        <section className="py-12 bg-white dark:bg-dark-main transition-colors duration-300">
            <div className="mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary transition-colors duration-300 tracking-tight">
                            Nasze Najnowsze Oferty
                        </h2>
                        <p className="mt-2 text-dark-text-secondary">
                            Przeglądaj szeroką gamę sprawdzonych pojazdów
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 mb-12">
                    {cars.slice(0, displayCount).map((car, index) => (
                        <div
                            key={car._id}
                            className="transition-all duration-700 ease-out"
                            style={{
                                opacity: loading ? 0 : 1,
                                transform: loading ? 'translateY(10px)' : 'translateY(0)',
                                transitionDelay: `${(index % 4) * 100}ms`
                            }}
                        >
                            <CarCard car={car} viewMode="grid" />
                        </div>
                    ))}
                </div>


                {displayCount < cars.length && (
                    <div className="flex justify-center">
                        <button
                            onClick={handleLoadMore}
                            className="px-8 py-3 bg-white dark:bg-dark-raised border border-gray-200 dark:border-dark-divider rounded-full text-base font-bold text-gray-900 dark:text-gray-200 dark:text-white hover:bg-gray-50 dark:hover:bg-dark-elevation-1 hover:shadow-md transition-all duration-300 flex items-center gap-2"
                        >
                            Pokaż Więcej <span className="text-xl">↓</span>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
