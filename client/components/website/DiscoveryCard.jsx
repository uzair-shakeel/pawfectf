"use client";
import React, { useMemo } from 'react';
import { motion, useMotionValue, useTransform, usePresence } from 'framer-motion';
import { Fuel, Gauge, Settings2, MapPin, Heart, X, Info, Activity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { optimizeCloudinaryUrl } from '../../lib/imageUtils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const DiscoveryCard = React.memo(function DiscoveryCard({ pet, onAction, active }) {
    const imageUrl = useMemo(() => {
        const imagePath = pet.images?.[0];
        if (!imagePath) return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&auto=format&fit=crop";
        let finalUrl;
        if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
            finalUrl = imagePath;
        } else {
            finalUrl = `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
        }
        return optimizeCloudinaryUrl(finalUrl, 800);
    }, [pet.images]);

    const displayTitle = useMemo(() => {
        const toTitleCase = (text) =>
            text ? text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
        return `${toTitleCase(pet.name || 'Pet')} - ${toTitleCase(pet.breed || pet.species)}`;
    }, [pet.name, pet.breed, pet.species]);

    return (
        <div className="h-full w-full flex flex-col bg-white dark:bg-gray-950 relative overflow-hidden group">
            {/* Image Section - Cinematic Style */}
            <div className="relative flex-1 overflow-hidden">
                <Image
                    src={imageUrl}
                    className="object-cover transition-transform duration-10000 ease-linear group-hover:scale-110"
                    alt={displayTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Badges - Floating Style */}
                <div className="absolute top-6 left-6 md:top-8 md:left-8 flex flex-col gap-2 md:gap-3">
                    {pet.isFeatured && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-blue-500/20"
                        >
                            <img src="/logooo.png" alt="Rafraf" className="h-3 w-3 md:h-3.5 md:w-3.5 animate-pulse" />
                            Premium Listing
                        </motion.div>
                    )}
                    <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] w-fit">
                        {pet.gender || 'Unknown'}
                    </div>
                </div>

                {/* Main Content Overlay */}
                <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 text-white">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-2xl md:text-5xl font-black mb-1 md:mb-2 tracking-tighter uppercase italic drop-shadow-2xl leading-none">
                            {displayTitle}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-gray-300 font-bold mb-4 md:mb-6">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3 md:h-4 w-3 md:w-4 text-blue-400" />
                                <span className="text-[10px] md:text-sm uppercase tracking-wider">{pet.location?.city || "Unknown"}</span>
                            </div>
                            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-blue-400/50" />
                            <span className="text-[10px] md:text-sm uppercase tracking-wider">{pet.ageMonths ? `${pet.ageMonths} months` : 'Age N/A'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">Adoption Fee</span>
                                <div className="text-2xl md:text-4xl font-black italic tracking-tighter leading-none">
                                    {pet.adoptionFee?.toLocaleString('pl-PL') || "0"} <span className="text-[10px] md:text-sm align-super">zł</span>
                                </div>
                            </div>

                            <Link
                                href={`/website/pets/${pet._id}`}
                                className="h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all group/info"
                            >
                                <Info className="h-5 w-5 md:h-6 md:w-6 group-hover/info:scale-110 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Simple Action Bar */}
            <div className="p-4 md:p-8 bg-white dark:bg-gray-950 flex gap-3 md:gap-6">
                <button
                    onClick={() => onAction('pass')}
                    className="flex-1 py-3.5 md:py-5 bg-gray-50 dark:bg-gray-900 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 md:gap-3 border border-gray-100 dark:border-gray-800 active:scale-95"
                >
                    <X className="w-4 h-4 md:w-5 md:h-5" /> Pass
                </button>
                <button
                    onClick={() => onAction('like')}
                    className="flex-[1.5] py-3.5 md:py-5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3"
                >
                    <Heart className="w-4 h-4 md:w-5 md:h-5 fill-white" /> Save Pet
                </button>
            </div>
        </div>
    );
});

export default DiscoveryCard;

