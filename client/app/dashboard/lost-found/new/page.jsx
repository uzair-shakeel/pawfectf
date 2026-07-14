"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPaw, FaMapMarkerAlt, FaCalendarAlt, FaCamera, FaInfoCircle, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { createLostFound } from "../../../../services/lostFoundService";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { useLanguage } from "../../../../lib/i18n/LanguageContext";
import Image from "next/image";

export default function NewLostFoundPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [formData, setFormData] = useState({
        type: "Lost",
        title: "",
        description: "",
        species: "Dog",
        breed: "",
        gender: "Unknown",
        color: "",
        location: "", // String to be converted
        dateLostOrFound: new Date().toISOString().split('T')[0],
        contactPhone: "",
        contactEmail: "",
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages((prev) => [...prev, ...files]);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'location') {
                    // For simplicity, just use a dummy point, or geocode if possible.
                    data.append('location', JSON.stringify({ type: "Point", coordinates: [21.01178, 52.22977], city: formData.location }));
                } else {
                    data.append(key, formData[key]);
                }
            });
            images.forEach(img => data.append('images', img));

            await createLostFound(data, getToken);
            router.push('/dashboard/lost-found');
        } catch (error) {
            console.error("Error creating report:", error);
            alert("Failed to create report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 py-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">{t("dashboard:reportPet.title", "Report a Pet")}</h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-divider p-6 sm:p-8 space-y-8">

                {/* Type Selection */}
                <div>
                    <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("dashboard:reportPet.whatReporting", "What are you reporting?")}</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${formData.type === 'Lost' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-dark-divider'}`}>
                            <input type="radio" name="type" value="Lost" checked={formData.type === 'Lost'} onChange={handleChange} className="hidden" />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === 'Lost' ? 'border-red-500' : 'border-gray-300'}`}>
                                {formData.type === 'Lost' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
                            </div>
                            <span className={`font-bold ${formData.type === 'Lost' ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>{t("dashboard:reportPet.lostPet", "I lost a pet")}</span>
                        </label>
                        <label className={`flex-1 cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${formData.type === 'Found' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-dark-divider'}`}>
                            <input type="radio" name="type" value="Found" checked={formData.type === 'Found'} onChange={handleChange} className="hidden" />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === 'Found' ? 'border-green-500' : 'border-gray-300'}`}>
                                {formData.type === 'Found' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                            </div>
                            <span className={`font-bold ${formData.type === 'Found' ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>{t("dashboard:reportPet.foundPet", "I found a pet")}</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("dashboard:reportPet.titleLabel", "Title")}</label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder={t("dashboard:reportPet.titlePlaceholder", "e.g. Small white poodle found near City Center")} className="w-full bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-dark-divider rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("dashboard:reportPet.descriptionLabel", "Description")}</label>
                        <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} placeholder={t("dashboard:reportPet.descriptionPlaceholder", "Provide details about the pet, collar, behaviors, exact location...")} className="w-full bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-dark-divider rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("dashboard:reportPet.species", "Species")}</label>
                        <select name="species" value={formData.species} onChange={handleChange} className="w-full bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-dark-divider rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                            <option value="Dog">{t("dashboard:reportPet.dog", "Dog")}</option>
                            <option value="Cat">{t("dashboard:reportPet.cat", "Cat")}</option>
                            <option value="Bird">{t("dashboard:reportPet.bird", "Bird")}</option>
                            <option value="Other">{t("dashboard:reportPet.other", "Other")}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("dashboard:reportPet.gender", "Gender")}</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-dark-divider rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                            <option value="Male">{t("dashboard:reportPet.male", "Male")}</option>
                            <option value="Female">{t("dashboard:reportPet.female", "Female")}</option>
                            <option value="Unknown">{t("dashboard:reportPet.unknown", "Unknown")}</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"><FaMapMarkerAlt className="inline mr-2" />{t("dashboard:reportPet.location", "Location (City/Area)")}</label>
                        <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder={t("dashboard:reportPet.locationPlaceholder", "e.g. Warsaw, Mokotów")} className="w-full bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-dark-divider rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"><FaCalendarAlt className="inline mr-2" />{t("dashboard:reportPet.date", "Date")}</label>
                        <input required type="date" name="dateLostOrFound" value={formData.dateLostOrFound} onChange={handleChange} className="w-full bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-dark-divider rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-dark-divider pt-6">
                    <div>
                        <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"><FaPhoneAlt className="inline mr-2" />{t("dashboard:reportPet.contactPhone", "Contact Phone")}</label>
                        <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="e.g. +48 123 456 789" className="w-full bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-dark-divider rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"><FaEnvelope className="inline mr-2" />{t("dashboard:reportPet.contactEmail", "Contact Email")}</label>
                        <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="your@email.com" className="w-full bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-dark-divider rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-dark-divider pt-6">
                    <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"><FaCamera className="inline mr-2" />{t("dashboard:reportPet.photos", "Photos")}</label>
                    <div className="flex flex-wrap gap-4 mb-4">
                        {imagePreviews.map((src, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-divider">
                                <Image src={src} alt="Preview" fill className="object-cover" />
                                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">x</button>
                            </div>
                        ))}
                        <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-divider flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-card cursor-pointer transition-colors">
                            <span className="text-2xl">+</span>
                            <span className="text-sm">{t("dashboard:reportPet.addPhoto", "Add Photo")}</span>
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : t("dashboard:reportPet.submit", "Submit Report")}
                    </button>
                </div>
            </form>
        </div>
    );
}
