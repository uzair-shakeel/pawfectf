"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { getLostFoundById } from "../../../../services/lostFoundService";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { optimizeCloudinaryUrl } from "../../../../lib/imageUtils";
import { toTelHref } from "../../../../lib/utils";
import { getPublicUserInfo } from "../../../../services/userService";
import Link from "next/link";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");

const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/images/hamer1.png";
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) return optimizeCloudinaryUrl(imagePath, 1200);
    return optimizeCloudinaryUrl(`${API_BASE}/${imagePath.replace("\\", "/")}`, 1200);
};

export default function LostFoundDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [entry, setEntry] = useState(null);
    const [reporter, setReporter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImg, setActiveImg] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [city, setCity] = useState("");

    useEffect(() => {
        if (!id) return;
        const fetchEntry = async () => {
            try {
                const data = await getLostFoundById(id);
                setEntry(data);
                if (data.reporterId) {
                    try {
                        const reporterData = await getPublicUserInfo(data.reporterId);
                        setReporter(reporterData);
                    } catch (e) {
                        console.error("Failed to load reporter info", e);
                    }
                }
                const coords = data?.location?.coordinates;
                if (coords) {
                    try {
                        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords[1]}&lon=${coords[0]}&format=json`);
                        const d = await r.json();
                        setCity(d.address?.city || d.address?.town || d.address?.village || "");
                    } catch (e) { }
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load details");
            } finally {
                setLoading(false);
            }
        };
        fetchEntry();
    }, [id]);

    useEffect(() => {
        const handler = (e) => {
            if (!fullscreen || !images.length) return;
            if (e.key === "Escape") setFullscreen(false);
            if (e.key === "ArrowRight") setActiveImg(i => (i + 1) % images.length);
            if (e.key === "ArrowLeft") setActiveImg(i => (i - 1 + images.length) % images.length);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [fullscreen, entry]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div></div>;
    if (error || !entry) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error || "Entry not found"}</div>;

    const images = (entry.images || []).map(formatImageUrl);
    if (!images.length) images.push("/images/hamer1.png");

    const reporterName = reporter?.companyName || `${reporter?.firstName || ""} ${reporter?.lastName || ""}`.trim() || "User";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-main py-8 px-4 sm:px-6">
            {fullscreen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setFullscreen(false)}>
                    <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-3 hover:bg-black/80 transition-colors">✕</button>
                    {images.length > 1 && <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }} className="absolute left-4 text-white bg-black/50 hover:bg-black/80 transition-colors rounded-full p-3"><ChevronLeft className="w-6 h-6" /></button>}
                    <div className="relative w-full max-w-4xl h-[80vh]" onClick={e => e.stopPropagation()}>
                        <Image src={images[activeImg]} alt={entry.title} fill className="object-contain" sizes="100vw" priority unoptimized />
                    </div>
                    {images.length > 1 && <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }} className="absolute right-4 text-white bg-black/50 hover:bg-black/80 transition-colors rounded-full p-3"><ChevronRight className="w-6 h-6" /></button>}
                    <div className="absolute bottom-4 text-white text-md font-semibold">{activeImg + 1} / {images.length}</div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-md font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to List
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Gallery & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-dark-card rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-dark-divider p-2">
                            <div className="relative h-[300px] sm:h-[450px] rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setFullscreen(true)}>
                                <Image src={images[activeImg]} alt={entry.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" priority />
                                {images.length > 1 && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors shadow-lg backdrop-blur-sm"><ChevronLeft className="w-5 h-5" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors shadow-lg backdrop-blur-sm"><ChevronRight className="w-5 h-5" /></button>
                                    </>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider text-white shadow-lg ${entry.type === 'Lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                                        {entry.type}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-sm font-semibold shadow-lg">
                                    {activeImg + 1} / {images.length}
                                </div>
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-2 p-2">
                                    {images.map((img, i) => (
                                        <button key={i} onClick={() => setActiveImg(i)} className={`relative h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? "border-blue-500 shadow-md scale-[1.02]" : "border-transparent opacity-70 hover:opacity-100 hover:scale-[1.02]"}`}>
                                            <Image src={img} alt="" fill className="object-cover" sizes="112px" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-dark-divider shadow-sm">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Description</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                        </div>
                    </div>

                    {/* Right Column - Details & Contact */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-dark-divider shadow-sm sticky top-8">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{entry.title}</h1>
                            <div className="flex items-center gap-2 text-md text-gray-500 dark:text-gray-400 mb-6 font-medium bg-gray-50 dark:bg-dark-raised p-3 rounded-xl">
                                <FaCalendarAlt className="text-blue-500" /> Date: {new Date(entry.dateLostOrFound).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>

                            <div className="space-y-4 mb-8 border-t border-b border-gray-100 dark:border-dark-divider py-6">
                                <h3 className="text-sm uppercase tracking-widest font-black text-gray-400 mb-4">Details</h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold">Species</p>
                                        <p className="font-bold text-gray-900 dark:text-gray-200">{entry.species}</p>
                                    </div>
                                    {entry.breed && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold">Breed</p>
                                            <p className="font-bold text-gray-900 dark:text-gray-200">{entry.breed}</p>
                                        </div>
                                    )}
                                    {entry.gender && entry.gender !== "Unknown" && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold">Gender</p>
                                            <p className="font-bold text-gray-900 dark:text-gray-200">{entry.gender}</p>
                                        </div>
                                    )}
                                    {entry.color && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold">Color</p>
                                            <p className="font-bold text-gray-900 dark:text-gray-200">{entry.color}</p>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold">Location</p>
                                        <p className="font-bold text-gray-900 dark:text-gray-200 flex items-center gap-1 mt-1">
                                            <FaMapMarkerAlt className="text-red-500" /> {city || "Unknown Location"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm uppercase tracking-widest font-black text-gray-400">Contact Person</h3>

                                {reporter && (
                                    <Link href={`/website/profile?id=${entry.reporterId}`} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-dark-raised hover:bg-gray-100 dark:hover:bg-dark-card transition-colors group cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 relative group-hover:ring-2 ring-blue-500 transition-all">
                                            {reporter.image ? <Image src={formatImageUrl(reporter.image)} alt={reporterName} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-gray-400">{reporterName[0]}</div>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">{reporterName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">View Profile</p>
                                        </div>
                                    </Link>
                                )}

                                <div className="flex flex-col gap-3 mt-4">
                                    {entry.contactPhone && (
                                        <a href={toTelHref(entry.contactPhone)} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-md transition-all shadow-lg shadow-green-600/25 active:scale-[0.98]">
                                            <FaPhoneAlt /> Call {entry.contactPhone}
                                        </a>
                                    )}
                                    {entry.contactEmail && (
                                        <a href={`mailto:${entry.contactEmail}`} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-card text-gray-700 dark:text-gray-200 font-bold text-md transition-all active:scale-[0.98]">
                                            <FaEnvelope /> Email Contact
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
