"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UploadCloud, X, MapPin, Calendar, Phone, Mail } from "lucide-react";
import { createLostFound } from "../../../../services/lostFoundService";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { useLanguage } from "../../../../lib/i18n/LanguageContext";
import CustomSelect from "../../../../components/website/CustomSelect";

const labelClass =
  "mb-1.5 block text-sm font-semibold text-[#0F172A] dark:text-gray-200";
const inputClass =
  "h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[15px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] dark:border-[#494952] dark:bg-[#303030] dark:text-[#e2e7e3] dark:placeholder:text-white/40";
const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-6 text-sm font-bold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60";
const ghostBtn =
  "inline-flex h-11 items-center justify-center px-4 text-sm font-semibold text-[#64748B] transition hover:text-[#0F172A] dark:hover:text-white";

export default function NewLostFoundPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

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
    location: "",
    dateLostOrFound: new Date().toISOString().split("T")[0],
    contactPhone: "",
    contactEmail: "",
  });

  const speciesOptions = [
    { value: "Dog", label: t("dashboard:reportPet.dog", "Dog") },
    { value: "Cat", label: t("dashboard:reportPet.cat", "Cat") },
    { value: "Bird", label: t("dashboard:reportPet.bird", "Bird") },
    { value: "Other", label: t("dashboard:reportPet.other", "Other") },
  ];

  const genderOptions = [
    { value: "Male", label: t("dashboard:reportPet.male", "Male") },
    { value: "Female", label: t("dashboard:reportPet.female", "Female") },
    { value: "Unknown", label: t("dashboard:reportPet.unknown", "Unknown") },
  ];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
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
      Object.keys(formData).forEach((key) => {
        if (key === "location") {
          data.append(
            "location",
            JSON.stringify({
              type: "Point",
              coordinates: [21.01178, 52.22977],
              city: formData.location,
            })
          );
        } else {
          data.append(key, formData[key]);
        }
      });
      images.forEach((img) => data.append("images", img));

      await createLostFound(data, getTokenRef.current);
      router.push("/dashboard/lost-found");
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Failed to create report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marketing-ui mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white md:text-[1.75rem]">
          {t("dashboard:reportPet.title", "Report a Pet")}
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">
          {t(
            "dashboard:reportPet.subtitle",
            "Share details so the community can help reunite pets faster."
          )}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card"
      >
        <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-7">
          <div>
            <p className={labelClass}>
              {t("dashboard:reportPet.whatReporting", "What are you reporting?")}
            </p>
            <div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "Lost" })}
                className={`border px-4 py-4 text-left transition ${
                  formData.type === "Lost"
                    ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1] dark:border-dark-divider"
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    formData.type === "Lost"
                      ? "text-red-700 dark:text-red-300"
                      : "text-[#64748B]"
                  }`}
                >
                  {t("dashboard:reportPet.lostPet", "I lost a pet")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "Found" })}
                className={`border px-4 py-4 text-left transition ${
                  formData.type === "Found"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1] dark:border-dark-divider"
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    formData.type === "Found"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-[#64748B]"
                  }`}
                >
                  {t("dashboard:reportPet.foundPet", "I found a pet")}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {t("dashboard:reportPet.titleLabel", "Title")}
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t(
                "dashboard:reportPet.titlePlaceholder",
                "e.g. Small white poodle found near City Center"
              )}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              {t("dashboard:reportPet.descriptionLabel", "Description")}
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={t(
                "dashboard:reportPet.descriptionPlaceholder",
                "Provide details about the pet, collar, behaviors, exact location..."
              )}
              className={`${inputClass} !h-auto min-h-[110px] py-3`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                {t("dashboard:reportPet.species", "Species")}
              </label>
              <div className="mt-0">
                <CustomSelect
                  variant="filter"
                  tone="light"
                  value={formData.species}
                  onChange={(v) => setFormData({ ...formData, species: v })}
                  options={speciesOptions}
                  ariaLabel={t("dashboard:reportPet.species", "Species")}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:reportPet.gender", "Gender")}
              </label>
              <div className="mt-0">
                <CustomSelect
                  variant="filter"
                  tone="light"
                  value={formData.gender}
                  onChange={(v) => setFormData({ ...formData, gender: v })}
                  options={genderOptions}
                  ariaLabel={t("dashboard:reportPet.gender", "Gender")}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
                  {t("dashboard:reportPet.location", "Location (City/Area)")}
                </span>
              </label>
              <input
                required
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t(
                  "dashboard:reportPet.locationPlaceholder",
                  "e.g. Warsaw, Mokotów"
                )}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#2563EB]" />
                  {t("dashboard:reportPet.date", "Date")}
                </span>
              </label>
              <input
                required
                type="date"
                name="dateLostOrFound"
                value={formData.dateLostOrFound}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-[#E2E8F0] pt-6 dark:border-dark-divider sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#2563EB]" />
                  {t("dashboard:reportPet.contactPhone", "Contact Phone")}
                </span>
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="e.g. +48 123 456 789"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#2563EB]" />
                  {t("dashboard:reportPet.contactEmail", "Contact Email")}
                </span>
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="border-t border-[#E2E8F0] pt-6 dark:border-dark-divider">
            <p className={labelClass}>{t("dashboard:reportPet.photos", "Photos")}</p>
            <div className="mt-1.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#2563EB]/40 bg-[#EEF2FF] text-[#2563EB] transition hover:border-[#2563EB] hover:bg-[#DBEAFE] dark:bg-[#2563EB]/10">
                <UploadCloud className="mb-2 h-7 w-7" />
                <span className="px-2 text-center text-xs font-semibold">
                  {t("dashboard:reportPet.addPhoto", "Add Photo")}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden border border-[#E2E8F0] dark:border-dark-divider"
                >
                  <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-2 top-2 bg-[#0F172A]/70 p-1.5 text-white transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-5 py-4 dark:border-dark-divider sm:px-8">
          <Link href="/dashboard/lost-found" className={ghostBtn}>
            {t("dashboard:addPet.cancel", "Cancel")}
          </Link>
          <button type="submit" disabled={loading} className={primaryBtn}>
            {loading
              ? t("dashboard:reportPet.submitting", "Submitting...")
              : t("dashboard:reportPet.submit", "Submit Report")}
          </button>
        </div>
      </form>
    </div>
  );
}
