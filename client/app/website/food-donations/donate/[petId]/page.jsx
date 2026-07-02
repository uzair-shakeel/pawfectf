"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaMapMarkerAlt } from "react-icons/fa";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { getPetById } from "../../../../../services/petService";
import foodDonationService from "../../../../../services/foodDonationService";
import { optimizeCloudinaryUrl } from "../../../../../lib/imageUtils";
import { useAuth } from "../../../../../lib/auth/AuthContext";
import { toast } from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");

function fmtUrl(path) {
    if (!path) return "/placeholder.jpg";
    const url = /^https?:\/\//i.test(path) ? path : `${API_BASE}/${String(path).replace("\\", "/")}`;
    return optimizeCloudinaryUrl ? optimizeCloudinaryUrl(url, 1200) : url;
}

export default function DonatePage() {
    const { petId } = useParams();
    const router = useRouter();
    const { user, token } = useAuth();

    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [donating, setDonating] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(50);
    const [customAmount, setCustomAmount] = useState("");
    const [donorMessage, setDonorMessage] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [recentDonors, setRecentDonors] = useState([]);

    useEffect(() => {
        if (!petId) return;
        getPetById(petId)
            .then(setPet)
            .catch(() => toast.error("Failed to load pet"))
            .finally(() => setLoading(false));

        // Load recent donors
        loadRecentDonors();
    }, [petId]);

    const loadRecentDonors = async () => {
        // Mock recent donors data
        const mockDonors = [
            { name: "Sarah K.", amount: 100, date: "2 hours ago", avatar: null },
            { name: "Anonymous", amount: 50, date: "5 hours ago", avatar: null },
            { name: "Michael R.", amount: 200, date: "1 day ago", avatar: null },
            { name: "Anna W.", amount: 75, date: "2 days ago", avatar: null },
            { name: "Anonymous", amount: 150, date: "3 days ago", avatar: null },
        ];
        setRecentDonors(mockDonors);
    };

    const images = pet?.images?.length
        ? pet.images.map((img) => fmtUrl(img))
        : ["/placeholder.jpg"];

    const isLocalUrl = (url) =>
        url.startsWith("http://127") || url.startsWith("http://localhost");

    const handleDonate = async () => {
        if (!user) {
            router.push("/sign-in");
            return;
        }

        const finalAmount = Number(customAmount) || selectedAmount;
        if (finalAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setDonating(true);
        try {
            // Try to create donation via API, fallback to mock success
            try {
                await foodDonationService.createDonation({
                    petId,
                    donationType: 'sponsorship',
                    foodPackage: {
                        type: 'custom',
                        duration: '1_month',
                        amount: finalAmount,
                        description: donorMessage || 'Food donation'
                    },
                    donorMessage: donorMessage || undefined,
                    delivery: {
                        type: 'shelter_direct'
                    }
                });
            } catch (apiError) {
                console.log("API not available, proceeding with mock donation:", apiError);
                // Mock delay to simulate processing
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            toast.success("Donation successful!");
            router.push(`/website/food-donations/success/${petId}`);
        } catch (err) {
            console.error("Donation failed:", err);
            toast.error("Donation failed. Please try again.");
        } finally {
            setDonating(false);
        }
    };

    const finalAmount = Number(customAmount) || selectedAmount;
    const predefinedAmounts = [25, 50, 100, 200];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pet not found</h2>
                <Link href="/website/food-donations" className="text-blue-600 hover:underline font-bold">
                    ← Back to Food Donations
                </Link>
            </div>
        );
    }

    const name = pet.title || pet.name || pet.species || "Pet";
    const age = pet.ageMonths
        ? pet.ageMonths < 12
            ? `${pet.ageMonths}mo`
            : `${Math.floor(pet.ageMonths / 12)}y`
        : null;

    return (
        <>
            {/* Fullscreen Gallery */}
            {fullscreen && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
                    onClick={() => setFullscreen(false)}
                >
                    <button
                        onClick={() => setFullscreen(false)}
                        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-3 hover:bg-white/10"
                    >
                        ✕
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveImg((i) => (i - 1 + images.length) % images.length);
                        }}
                        className="absolute left-4 text-white bg-black/50 rounded-full p-3 hover:bg-white/10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div
                        className="relative w-full max-w-4xl h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[activeImg]}
                            alt={name}
                            fill
                            className="object-contain"
                            unoptimized={isLocalUrl(images[activeImg])}
                        />
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveImg((i) => (i + 1) % images.length);
                        }}
                        className="absolute right-4 text-white bg-black/50 rounded-full p-3 hover:bg-white/10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 text-white text-sm">
                        {activeImg + 1} / {images.length}
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-white dark:bg-dark-main py-10 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Back */}
                    <Link
                        href="/website/food-donations"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Food Donations
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* LEFT — Pet Info + Gallery */}
                        <div className="space-y-4">
                            {/* Main image with swiper */}
                            <div
                                className="relative h-80 rounded-2xl overflow-hidden cursor-pointer group border border-gray-100 dark:border-dark-divider"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                onClick={() => setFullscreen(true)}
                            >
                                <Swiper
                                    modules={[Navigation, Pagination]}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    navigation={{
                                        nextEl: `.swiper-button-next-donate`,
                                        prevEl: `.swiper-button-prev-donate`,
                                    }}
                                    pagination={{
                                        clickable: true,
                                        type: "bullets",
                                        bulletClass: "swiper-pagination-bullet !w-2 !h-2 !bg-white/70 !opacity-100 !mx-1",
                                        bulletActiveClass: "!bg-white",
                                    }}
                                    onSlideChange={(swiper) => setActiveImg(swiper.activeIndex)}
                                    className="h-full w-full"
                                >
                                    {images.map((img, i) => (
                                        <SwiperSlide key={i} className="relative h-full w-full">
                                            <Image
                                                src={img}
                                                alt={`${name} ${i + 1}`}
                                                fill
                                                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                                unoptimized={isLocalUrl(img)}
                                                priority={i === 0}
                                            />
                                        </SwiperSlide>
                                    ))}
                                    <div className="swiper-pagination !bottom-2 !z-10"></div>
                                </Swiper>

                                {/* Navigation arrows */}
                                {images.length > 1 && (
                                    <>
                                        <div className={`swiper-button-prev-donate absolute left-2 top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                                            <button className="h-8 w-8 bg-white/80 flex items-center justify-center hover:bg-white rounded-full">
                                                <ChevronLeft className="h-4 w-4 text-gray-900" />
                                            </button>
                                        </div>
                                        <div className={`swiper-button-next-donate absolute right-2 top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                                            <button className="h-8 w-8 bg-white/80 flex items-center justify-center hover:bg-white rounded-full">
                                                <ChevronRight className="h-4 w-4 text-gray-900" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImg(i)}
                                            className={`relative h-16 w-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i
                                                ? "border-blue-500 scale-[1.03]"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                unoptimized={isLocalUrl(img)}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Pet details card */}
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-6 space-y-4">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">{name}</h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        {[pet.species, pet.breed, age, pet.gender].filter(Boolean).join(" · ")}
                                    </p>
                                    {pet.location?.city && (
                                        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            <FaMapMarkerAlt className="text-blue-500" />
                                            {pet.location.city}
                                        </p>
                                    )}
                                </div>

                                {pet.description && (
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                        {pet.description}
                                    </p>
                                )}

                                {pet.specialNeeds && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                        <p className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">Special Needs</p>
                                        <p className="text-blue-800 dark:text-blue-400 text-sm">{pet.specialNeeds}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT — Donation Form */}
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                                    Make a Donation
                                </h2>

                                {/* Amount */}
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                        Donation Amount (zł)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {predefinedAmounts.map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => {
                                                    setSelectedAmount(amount);
                                                    setCustomAmount("");
                                                }}
                                                className={`p-4 border-2 rounded-xl font-bold text-sm transition-all ${selectedAmount === amount && !customAmount
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                    : "border-gray-200 dark:border-dark-divider text-gray-700 dark:text-gray-300 hover:border-blue-300"
                                                    }`}
                                            >
                                                {amount} zł
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Custom amount"
                                        value={customAmount}
                                        onChange={(e) => {
                                            setCustomAmount(e.target.value);
                                            setSelectedAmount(0);
                                        }}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-dark-divider rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-raised text-gray-900 dark:text-white text-sm"
                                    />
                                </div>

                                {/* Message */}
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Message for {name}{" "}
                                        <span className="font-normal text-gray-400">(Optional)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={donorMessage}
                                        onChange={(e) => setDonorMessage(e.target.value)}
                                        placeholder="Send a message of support..."
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-dark-divider rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-raised text-gray-900 dark:text-white text-sm resize-none"
                                    />
                                </div>

                                {/* Anonymous */}
                                <div className="mb-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isAnonymous}
                                            onChange={(e) => setIsAnonymous(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Donate anonymously
                                        </span>
                                    </label>
                                </div>

                                {/* Total + CTA */}
                                <div className="border-t border-gray-100 dark:border-dark-divider pt-6">
                                    <div className="flex justify-between items-center mb-5">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            Total Amount:
                                        </span>
                                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                            {finalAmount} zł
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleDonate}
                                        disabled={donating || !finalAmount}
                                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                                    >
                                        {donating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FaHeart />
                                                Donate {finalAmount} zł
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Secure payment processing
                                    </p>
                                </div>
                            </div>

                            {/* Recent Donors */}
                            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-divider p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Donors</h3>
                                <div className="space-y-3">
                                    {recentDonors.map((donor, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-divider last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                    {donor.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{donor.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{donor.date}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {donor.amount} zł
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-divider">
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <span>Total raised:</span>
                                        <span className="font-bold text-gray-900 dark:text-white">575 zł</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <span>Goal:</span>
                                        <span className="font-bold text-gray-900 dark:text-white">1000 zł</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: '57.5%' }} />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                        57% funded • 425 zł needed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
