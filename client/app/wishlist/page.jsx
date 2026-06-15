"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/website/Navbar';
import { Footer } from '../../components/website/Footer';
import CarCard from '../../components/website/CarCard';
import { getAllPets } from '../../services/petService';
import { getWishlist, passCar } from '../../services/userService';
import { useAuth } from '../../lib/auth/AuthContext';
import { Shovel as Ghost, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isSignedIn, getToken } = useAuth();

    useEffect(() => {
        const fetchWishlist = async () => {
            setLoading(true);
            try {
                if (isSignedIn) {
                    const dbWishlist = await getWishlist(getToken);
                    setWishlist(dbWishlist);
                    // Sync local storage
                    const likedIds = dbWishlist.map(car => car._id);
                    localStorage.setItem('ojest_liked_cars', JSON.stringify(likedIds));
                } else {
                    const likedIds = JSON.parse(localStorage.getItem('ojest_liked_cars') || '[]');
                    if (likedIds.length === 0) {
                        setWishlist([]);
                        return;
                    }
                    const allCars = await getAllPets();
                    const likedCars = allCars.filter(car => likedIds.includes(car._id));
                    setWishlist(likedCars);
                }
            } catch (error) {
                console.error("Error fetching wishlist:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [isSignedIn]);

    const removeFromWishlist = async (carId) => {
        // Update Local Storage
        const likedIds = JSON.parse(localStorage.getItem('ojest_liked_cars') || '[]');
        const updatedIds = likedIds.filter(id => id !== carId);
        localStorage.setItem('ojest_liked_cars', JSON.stringify(updatedIds));

        // Update DB if signed in (passing a car moves it from liked to passed)
        if (isSignedIn) {
            try {
                await passCar(carId, getToken);
            } catch (err) {
                console.error("Failed to remove from DB wishlist:", err);
            }
        }

        setWishlist(prev => prev.filter(car => car._id !== carId));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-main flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                            <img src="/logooo.png" alt="Ojest" className="h-3 w-3" />
                            Your Collection
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                            My <span className="text-blue-600">Wishlist</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                            {wishlist.length} Items Saved
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : wishlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl"
                    >
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-8">
                            <Ghost className="h-12 w-12 text-gray-300" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase italic">Your wishlist is empty</h2>
                        <p className="text-gray-500 font-medium mb-10 max-w-sm">
                            Looks like you haven't found your perfect match yet.
                            Head over to Discovery to find something you love!
                        </p>
                        <Link
                            href="/discovery"
                            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                        >
                            Start Discovery <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wishlist.map((car) => (
                            <div key={car._id} className="relative group">
                                <CarCard car={car} />
                                <button
                                    onClick={() => removeFromWishlist(car._id)}
                                    className="absolute top-4 right-6 z-30 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors border border-white/20 opacity-0 group-hover:opacity-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {wishlist.length > 0 && (
                    <div className="mt-20 p-12 bg-blue-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tight">Need more options?</h3>
                            <p className="text-blue-100 font-medium">Our Discovery algorithm is waiting for you.</p>
                        </div>
                        <Link
                            href="/discovery"
                            className="relative z-10 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            Back to Swiping <img src="/logooo.png" alt="Ojest" className="h-4 w-4" />
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

const X = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
const Check = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
