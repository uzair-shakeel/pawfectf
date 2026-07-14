"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, X, MapPin, Gauge, Search, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import { getAllPets } from "../../services/petService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export function DiscoveryPromo() {
    const [cars, setCars] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCars() {
            try {
                const data = await getAllPets();
                // Take only a subset for the promo or just filter valid ones
                const validCars = data.filter(c => c.images && c.images.length > 0).slice(0, 5);
                setCars(validCars);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch cars for promo:", error);
                setLoading(false);
            }
        }
        fetchCars();
    }, []);

    useEffect(() => {
        if (cars.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % cars.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [cars]);

    const getImageUrl = (car) => {
        if (!car || !car.images?.[0]) return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&auto=format&fit=crop";
        const imagePath = car.images[0];
        if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
            return imagePath;
        }
        return `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
    };

    const currentCar = cars[currentIndex];

    // Formatter for price
    const formatPrice = (price) => {
        return price?.toLocaleString('pl-PL') || "0";
    };

    return (
        <section className="py-12 md:py-32 relative overflow-hidden bg-white dark:bg-dark-main">
            {/* Soft Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] dark:bg-blue-600/10" />
            </div>

            <div className="max-w-7xl mx-auto px-2 relative z-10">
                <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-center">

                    {/* Visual Section: Phone Mockup with Real Cars */}
                    <div className="order-2  w-full md:w-1/3 flex justify-center justify-center">
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
                                transition={{ duration: 10, repeat: Infinity }}
                                className="absolute -inset-10 border border-blue-500/10 dark:border-blue-400/20 rounded-full pointer-events-none"
                            />

                            <div className="relative w-[350px] h-[650px] bg-gray-950 rounded-[3.5rem] p-3 shadow-2xl border-[6px] border-gray-800/80 ring-1 ring-white/10">
                                <div className="w-full h-full bg-white dark:bg-dark-panel rounded-[2.8rem] overflow-hidden relative border border-white/5">
                                    {/* Mock App Header */}
                                    <div className="absolute top-0 left-0 w-full h-12 flex items-center justify-between px-6 border-b border-gray-100 dark:border-dark-divider bg-white/80 dark:bg-dark-panel/80 backdrop-blur-md z-30">
                                        <div className="flex items-center gap-2">
                                            <Image src="/logooo.png" alt="" width={12} height={12} className="h-3 w-3" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Ojest Discover</span>
                                        </div>
                                    </div>

                                    {/* VERTICAL FEED SIMULATION */}
                                    <div className="absolute inset-x-1.5 top-14 bottom-16">
                                        <AnimatePresence mode="popLayout">
                                            {loading ? (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                                </div>
                                            ) : cars.length > 0 ? (
                                                <motion.div
                                                    key={currentCar?._id}
                                                    initial={{ opacity: 0, y: 100 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -100 }}
                                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                                    className="h-full w-full absolute inset-0 rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-900"
                                                >
                                                    <div className="relative h-full w-full">
                                                        <Image
                                                            src={getImageUrl(currentCar)}
                                                            alt={currentCar?.title || "Car"}
                                                            fill
                                                            className="object-cover"
                                                            loading="lazy"
                                                            sizes="350px"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-90" />

                                                        <div className="absolute bottom-5 left-5 right-5 text-white">
                                                            <div className="flex gap-2 mb-3">
                                                                <span className="px-2 py-0.5 bg-blue-600 rounded-md text-[7px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30">
                                                                    {currentCar?.condition || 'Premium'}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-xl font-black uppercase tracking-tighter italic leading-tight mb-2 truncate">
                                                                {currentCar?.year} {currentCar?.make} {currentCar?.model}
                                                            </h4>
                                                            <div className="flex items-center gap-2.5 text-gray-300 font-bold text-[8px] uppercase tracking-widest mb-6">
                                                                <div className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-blue-500" /> {currentCar?.location?.type === 'Point' ? 'Polska' : 'Polska'}</div>
                                                                <div className="w-0.5 h-0.5 rounded-full bg-blue-500/50" />
                                                                <div>{currentCar?.mileage?.toLocaleString()} KM</div>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[7px] font-black uppercase tracking-widest text-blue-400 mb-0.5 leading-none">Cena</span>
                                                                    <span className="text-xl font-black italic tracking-tighter leading-none">
                                                                        {formatPrice(currentCar?.financialInfo?.priceNetto)} <span className="text-[9px] align-super">PLN</span>
                                                                    </span>
                                                                </div>
                                                                <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                                    <Heart className="w-4 h-4 fill-white" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">No listings found</span>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Mock App Bottom Bar */}
                                    <div className="absolute bottom-0 left-0 w-full h-16 flex items-center justify-around px-8 bg-white dark:bg-dark-panel z-30 border-t border-gray-50 dark:border-dark-divider">
                                        <X className="w-5 h-5 text-gray-300" />
                                        <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                            <Heart className="w-5 h-5 fill-white" />
                                        </div>
                                        <Info className="w-5 h-5 text-gray-300" />
                                    </div>
                                </div>

                                {/* Physical Accents */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-950 rounded-b-xl z-40 flex items-center justify-center">
                                    <div className="w-8 h-1 bg-gray-900 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section: MATCHING HERO HEADINGS */}
                    <div className="order-1  w-full md:w-2/3 flex flex-col items-center lg:items-start">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2.5 px-2 py-2 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 mb-8"
                        >
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Discover Ojest</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl text-center md:text-left font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tighter"
                        >
                            Znajdź swoje <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400 italic">idealne dopasowanie.</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="hidden md:block text-lg md:text-2xl font-bold text-dark-text-secondary mb-12 leading-relaxed max-w-lg tracking-widest uppercase"
                        >
                            Nowy sposób na szukanie aut. <span className="text-gray-900 dark:text-white">Vertical Feed</span> dla prawdziwych pasjonatów.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link
                                href="/discovery"
                                className="inline-flex items-center justify-center px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all group"
                            >
                                Zacznij Teraz <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        {/* High-End Stats */}
                        <div className="mt-16 hidden md:flex items-center gap-10 border-t border-gray-100 dark:border-dark-divider pt-10">
                            <div>
                                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">10k+</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Matches Daily</p>
                            </div>
                            <div className="w-px h-10 bg-gray-100 dark:border-dark-divider" />
                            <div>
                                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">2.5s</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Avg Response</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
