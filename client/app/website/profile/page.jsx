"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaPhoneAlt, FaGlobe, FaInstagram, FaFacebook, FaPaw, FaCalendar, FaGasPump, FaCog } from "react-icons/fa";
import { MdEmail, MdVerified } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicUserInfo } from "../../../services/userService";
import { getAllPets } from "../../../services/petService";
import PetCard from "../../../components/website/PetCard";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");

const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/website/seller.jpg";
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) return imagePath;
    return `${API_BASE}/${imagePath.replace("\\", "/")}`;
};

const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";
    let cleaned = String(phoneNumber).replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    const digitsOnly = cleaned.substring(1);

    // Polish/2-digit formatting
    if (digitsOnly.length === 11) {
        return `+${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 5)} ${digitsOnly.substring(5, 8)} ${digitsOnly.substring(8)}`;
    }

    const groups = [];
    let countryCode = digitsOnly.length > 9 ? digitsOnly.substring(0, digitsOnly.length - 9) : "";
    let rest = digitsOnly.length > 9 ? digitsOnly.substring(digitsOnly.length - 9) : digitsOnly;
    for (let i = 0; i < rest.length; i += 3) groups.push(rest.substring(i, i + 3));
    return countryCode ? `+${countryCode} ${groups.join(" ")}` : `+${groups.join(" ")}`;
};

function ProfileContent({ sellerId }) {
    const router = useRouter();
    const { t } = useLanguage();
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("listings");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!sellerId) { setError("No seller ID provided"); setLoading(false); return; }
            try {
                setLoading(true);
                const userData = await getPublicUserInfo(sellerId);
                setUser(userData);
                const allPetsData = await getAllPets();
                const allPetsArray = Array.isArray(allPetsData) ? allPetsData : allPetsData.pets || [];
                const sellerPets = allPetsArray.filter((p) => {
                    const creatorId = typeof p.createdBy === 'object' ? p.createdBy._id : p.createdBy;
                    return String(creatorId) === String(sellerId);
                });
                setPets(sellerPets);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setError("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sellerId]);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full" />
        </div>
    );

    if (error || !user) return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center p-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 dark:text-white mb-2">{t('profile.userNotFound')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{error || t('profile.checkLink')}</p>
        </motion.div>
    );

    const displayName = user?.companyName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
    const bio = user?.description || "";
    const hasLocation = user?.location?.coordinates && user.location.coordinates.length === 2;
    const mapCenter = hasLocation ? { lat: user.location.coordinates[1], lng: user.location.coordinates[0] } : { lat: 52.22977, lng: 21.01178 };
    const phones = user?.phoneNumbers || [];
    const socials = user?.socialMedia || {};
    const sellerType = user?.sellerType || "private";
    const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;
    const uniqueSpecies = [...new Set(pets.map(p => p.species))].filter(Boolean).sort();

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

                {/* Standard Pawfect Profile Header */}
                <div className="bg-white dark:bg-dark-main p-6 sm:p-10 rounded-3xl border border-gray-100 dark:border-dark-divider shadow-sm mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gray-50 dark:border-gray-800 shadow-md flex-shrink-0 bg-white">
                            <Image src={formatImageUrl(user?.image || user?.profilePicture)} alt={displayName} width={160} height={160} className="object-cover w-full h-full" />
                        </div>
                        {sellerType === "company" && (
                            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm">
                                <MdVerified className="text-3xl text-blue-600" title={t('profile.verifiedShelter')} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                            {displayName}
                        </h1>

                        <p className="text-gray-600 dark:text-gray-300 font-medium text-sm md:text-base mb-6 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                            {bio || t('profile.defaultBio')}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                            <span className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-raised px-4 py-2 rounded-xl border border-gray-100 dark:border-dark-divider">
                                <FaPaw className="text-blue-600" /> {pets.length} {pets.length === 1 ? t('profile.pet') : t('profile.pets')}
                            </span>
                            {joinDate && (
                                <span className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-raised px-4 py-2 rounded-xl border border-gray-100 dark:border-dark-divider">
                                    <FaCalendar className="text-blue-600" /> {t('profile.joined')} {joinDate}
                                </span>
                            )}
                            <span className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-raised px-4 py-2 rounded-xl border border-gray-100 dark:border-dark-divider">
                                {sellerType === "company" ? "🏢 " + t('profile.shelterBreeder') : "👤 " + t('profile.privateSeller')}
                            </span>
                        </div>

                        {uniqueSpecies.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                {uniqueSpecies.map((species) => (
                                    <span key={species} className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                        {species}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex md:flex-col gap-4 justify-center items-center">
                        {socials?.facebook && (
                            <a href={socials.facebook.startsWith('http') ? socials.facebook : `https://${socials.facebook}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-dark-raised text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all border border-gray-100 dark:border-dark-divider">
                                <FaFacebook size={20} />
                            </a>
                        )}
                        {socials?.instagram && (
                            <a href={socials.instagram.startsWith('http') ? socials.instagram : `https://${socials.instagram}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-dark-raised text-gray-600 dark:text-gray-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white transition-all border border-gray-100 dark:border-dark-divider">
                                <FaInstagram size={20} />
                            </a>
                        )}
                        {socials?.website && (
                            <a href={socials.website.startsWith('http') ? socials.website : `https://${socials.website}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-dark-raised text-gray-600 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white transition-all border border-gray-100 dark:border-dark-divider">
                                <FaGlobe size={20} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-dark-main rounded-xl shadow-md p-2 mb-8">
                    <div className="flex gap-2">
                        {["listings", "contact", "location"].map((tab) => (
                            <motion.button key={tab} onClick={() => setActiveTab(tab)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === tab ? "bg-gradient-to-r from-blue-500 to-blue-800 text-white shadow-lg" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card"}`}>>
                                {t(`profile.${tab}`)}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === "listings" && (
                        <motion.div key="listings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                            {pets.length > 0 ? (
                                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pets.map((pet) => (
                                        <motion.div key={pet._id} variants={itemVariants}>
                                            <PetCard pet={pet} viewMode="grid" />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-dark-main rounded-xl p-12 text-center shadow-lg">
                                    <FaPaw className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">{t('profile.noPetsListed')}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "contact" && (
                        <motion.div key="contact" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="max-w-2xl mx-auto">
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                                {phones.map((phoneObj, idx) => {
                                    const phone = typeof phoneObj === "object" ? phoneObj.number || phoneObj.phone : phoneObj;
                                    let sanitized = String(phone).replace(/[^\d+]/g, "");
                                    if (!sanitized.startsWith("+") && sanitized.length > 0) {
                                        sanitized = "+" + sanitized;
                                    }
                                    return (
                                        <motion.a key={idx} variants={itemVariants} whileHover={{ scale: 1.02, x: 8 }} whileTap={{ scale: 0.98 }} href={`tel:${sanitized}`} className="flex items-center gap-4 p-5 bg-white dark:bg-dark-main rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 transition-all shadow-md hover:shadow-xl group">
                                            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }} className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                                                <FaPhoneAlt className="text-lg" />
                                            </motion.div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-gray-200 dark:text-white text-lg">{formatPhoneNumber(phone)}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.clickToCall')}</p>
                                            </div>
                                            <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                                        </motion.a>
                                    );
                                })}

                                {user?.email && (
                                    <motion.a variants={itemVariants} whileHover={{ scale: 1.02, x: 8 }} whileTap={{ scale: 0.98 }} href={`mailto:${user.email}`} className="flex items-center gap-4 p-5 bg-white dark:bg-dark-main rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-md hover:shadow-xl group">
                                        <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }} className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
                                            <MdEmail className="text-xl" />
                                        </motion.div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-gray-200 dark:text-white text-lg">{user.email}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.sendEmail')}</p>
                                        </div>
                                        <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                                    </motion.a>
                                )}

                                {(socials?.website || socials?.instagram || socials?.facebook) && (
                                    <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 pt-4">
                                        {socials?.website && <motion.a whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }} href={socials.website.startsWith("http") ? socials.website : `https://${socials.website}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-xl transition-all border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"><div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white"><FaGlobe className="text-xl" /></div><span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('profile.website')}</span></motion.a>}
                                        {socials?.instagram && <motion.a whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }} href={socials.instagram.startsWith("http") ? socials.instagram : `https://${socials.instagram}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl hover:shadow-xl transition-all border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-600"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white"><FaInstagram className="text-xl" /></div><span className="text-sm font-semibold text-pink-700 dark:text-pink-300">{t('profile.instagram')}</span></motion.a>}
                                        {socials?.facebook && <motion.a whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }} href={socials.facebook.startsWith("http") ? socials.facebook : `https://${socials.facebook}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600"><div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white"><FaFacebook className="text-xl" /></div><span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{t('profile.facebook')}</span></motion.a>}
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === "location" && (
                        <motion.div key="location" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-dark-main rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700">
                                <div className="h-96 bg-gray-200 dark:bg-dark-card relative">
                                    <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&hl=en;z=14&output=embed`}></iframe>
                                </div>
                                <div className="p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                                            <FaMapMarkerAlt className="text-xl" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white mb-2">{t('profile.location')}</h3>
                                            <p className="text-gray-700 dark:text-gray-300 mb-4">{hasLocation ? user.location.address || t('profile.sellersLocation') : t('profile.locationNotSpecified')}</p>
                                            {hasLocation && <motion.button whileHover={{ scale: 1.05, x: 4 }} whileTap={{ scale: 0.95 }} onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${mapCenter.lat},${mapCenter.lng}`, "_blank")} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all">{t('profile.getDirections')}<FaMapMarkerAlt /></motion.button>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ProfileDataWrapper({ params }) {
    const unwrappedParams = params;
    const searchParams = useSearchParams();
    const sellerId = unwrappedParams?.profile || unwrappedParams?.id || searchParams.get("id");

    return <ProfileContent sellerId={sellerId} />;
}

export default function ProfilePage({ params }) {
    return (
        <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" /></div>}>
            <ProfileDataWrapper params={params} />
        </Suspense>
    );
}
