"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../../components/website/Navbar';
import { Footer } from '../../components/website/Footer';
import DiscoveryCard from '../../components/website/DiscoveryCard';
import { getAllPets } from '../../services/petService';
import { getInteractedCars, likeCar, passCar, resetDiscoveryInteractions } from '../../services/userService';
import { useAuth } from '../../lib/auth/AuthContext';
import { AlertCircle, RefreshCw, Filter, Heart } from 'lucide-react';
import Link from 'next/link';

export default function DiscoveryPage() {
    const [cars, setCars] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isSignedIn, getToken } = useAuth();

    const loadCars = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllPets();
            let likedIds = [];
            let passedIds = [];

            if (isSignedIn) {
                try {
                    const interacted = await getInteractedCars(getToken);
                    likedIds = interacted.likedCars.map(id => id.toString());
                    passedIds = interacted.passedCars.map(id => id.toString());

                    localStorage.setItem('ojest_liked_cars', JSON.stringify(likedIds));
                    localStorage.setItem('ojest_passed_cars', JSON.stringify(passedIds));
                } catch (err) {
                    likedIds = JSON.parse(localStorage.getItem('ojest_liked_cars') || '[]');
                    passedIds = JSON.parse(localStorage.getItem('ojest_passed_cars') || '[]');
                }
            } else {
                likedIds = JSON.parse(localStorage.getItem('ojest_liked_cars') || '[]');
                passedIds = JSON.parse(localStorage.getItem('ojest_passed_cars') || '[]');
            }

            const interactedIds = new Set([...likedIds, ...passedIds]);
            const filtered = data.filter(car => !interactedIds.has(car._id));
            const shuffled = [...filtered].sort(() => Math.random() - 0.5);
            setCars(shuffled);
        } catch (err) {
            setError("Failed to load cars. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [isSignedIn, getToken]);

    useEffect(() => {
        loadCars();
    }, [loadCars]);

    const handleSwipe = useCallback((direction, car) => {
        setCurrentIndex(prev => prev + 1);

        const isLike = direction === 'right';
        const storageKey = isLike ? 'ojest_liked_cars' : 'ojest_passed_cars';

        const currentInteracted = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!currentInteracted.includes(car._id)) {
            currentInteracted.push(car._id);
            localStorage.setItem(storageKey, JSON.stringify(currentInteracted));
        }

        if (isSignedIn) {
            const updateDB = async () => {
                try {
                    if (isLike) {
                        await likeCar(car._id, getToken);
                    } else {
                        await passCar(car._id, getToken);
                    }
                } catch (err) {
                    console.error(`Failed to save ${direction} to DB:`, err);
                }
            };
            updateDB();
        }
    }, [isSignedIn, getToken]);

    const visibleCars = useMemo(() => {
        return cars.slice(currentIndex, currentIndex + 2);
    }, [cars, currentIndex]);

    const isStackEmpty = currentIndex >= cars.length && !loading;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-main flex flex-col transition-colors duration-300 overflow-x-hidden">
            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center p-6 py-24 relative overflow-hidden">
                {/* Visual Flair Backgrounds - Optimized Blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20 dark:opacity-10 z-0">
                    <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[80px] transform-gpu" />
                    <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-sky-400 rounded-full blur-[80px] transform-gpu" />
                </div>

                <div className="text-center mb-10 relative z-10 transition-transform duration-500">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-600/20">
                        <img src="/logooo.png" alt="Ojest" className="h-3.5 w-3.5" />
                        Ojest Discovery Beta
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase italic leading-none">
                        Ojest <span className="text-blue-600 dark:text-blue-400">Discover</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                        {loading ? "Preparing your showroom..." : `Explore ${cars.length - currentIndex} premium listings`}
                    </p>
                </div>

                <div className="relative w-full max-w-4xl mx-auto h-[80vh] z-10">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                    <img src="/logooo.png" alt="Ojest" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6" />
                                </div>
                                <p className="mt-8 font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Curating your showroom...</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-12 text-center"
                            >
                                <AlertCircle className="h-12 w-12 text-red-500 mb-6" />
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Engines stalled</h3>
                                <p className="text-gray-500 font-medium mb-8 text-sm">{error}</p>
                                <button
                                    onClick={loadCars}
                                    className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold flex items-center gap-2 text-sm"
                                >
                                    <RefreshCw className="h-4 w-4" /> Try Again
                                </button>
                            </motion.div>
                        ) : isStackEmpty ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-12 text-center"
                            >
                                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-8">
                                    <img src="/logooo.png" alt="Ojest" className="h-10 w-10" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase italic leading-none">That's all for now!</h3>
                                <p className="text-gray-500 font-bold mb-10 leading-relaxed text-sm">
                                    You've explored all available cars.
                                    We update our showroom every hour!
                                </p>
                                <div className="flex flex-col w-full max-w-xs mx-auto gap-3">
                                    <Link href="/wishlist" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/25 active:scale-95 transition-transform uppercase tracking-wider text-xs flex items-center justify-center gap-2">
                                        <Heart className="h-4 w-4 fill-white" /> View Wishlist
                                    </Link>
                                    <button onClick={async () => {
                                        localStorage.removeItem('ojest_passed_cars');
                                        localStorage.removeItem('ojest_liked_cars');
                                        if (isSignedIn) {
                                            try { await resetDiscoveryInteractions(getToken); } catch (err) { }
                                        }
                                        loadCars();
                                        setCurrentIndex(0);
                                    }} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black active:scale-95 transition-transform uppercase tracking-wider text-xs flex items-center justify-center gap-2">
                                        <RefreshCw className="h-4 w-4" /> Reset Discovery
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div key="feed" className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-hide rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative bg-white dark:bg-gray-950">
                                {cars.slice(currentIndex).map((car) => (
                                    <div key={car._id} className="h-full w-full snap-start snap-always relative border-b border-gray-100 dark:border-gray-900 last:border-0">
                                        <DiscoveryCard
                                            car={car}
                                            active={true}
                                            onAction={(action) => handleSwipe(action === 'like' ? 'right' : 'left', car)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
}


const X = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
