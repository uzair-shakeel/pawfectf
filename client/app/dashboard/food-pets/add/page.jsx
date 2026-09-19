"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  UploadCloud,
  X,
  MapPin,
  AlertCircle,
  Camera,
  PawPrint,
  Utensils,
  Building2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { useLanguage } from "../../../../lib/i18n/LanguageContext";
import CustomSelect from "../../../../components/website/CustomSelect";

const labelClass =
  "mb-1.5 block text-sm font-semibold text-[#0F172A] dark:text-gray-200";
const inputClass =
  "h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[15px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] dark:border-[#494952] dark:bg-[#303030] dark:text-[#e2e7e3] dark:placeholder:text-white/40";
const sectionCard =
  "rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-6 dark:border-dark-divider dark:bg-dark-card";
const sectionTitle =
  "mb-5 flex items-center gap-2 font-display text-lg font-bold text-[#0F172A] dark:text-white";
const sectionIcon = "h-5 w-5 shrink-0 text-[#2563EB]";
const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-6 text-sm font-bold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60";
const ghostBtn =
  "inline-flex h-11 items-center justify-center px-4 text-sm font-semibold text-[#64748B] transition hover:text-[#0F172A] dark:hover:text-white";

const DOG_BREEDS = [
  "Kundel / mieszaniec",
  "Akita",
  "Alaskan malamute",
  "Amstaff",
  "Australian shepherd",
  "Beagle",
  "Bernardyn",
  "Bichon frise",
  "Border collie",
  "Bokser",
  "Buldog angielski",
  "Buldog francuski",
  "Cane corso",
  "Chihuahua",
  "Chow chow",
  "Cocker spaniel",
  "Collie",
  "Dalmatyńczyk",
  "Doberman",
  "Dog niemiecki",
  "Golden retriever",
  "Gończy polski",
  "Husky syberyjski",
  "Jack russell terrier",
  "Jamnik",
  "Labrador retriever",
  "Maltańczyk",
  "Mastif",
  "Mops",
  "Nowofundland",
  "Owczarek belgijski",
  "Owczarek niemiecki",
  "Owczarek podhalański",
  "Papillon",
  "Pekińczyk",
  "Pit bull",
  "Pointer",
  "Pomeranian",
  "Pudel",
  "Rottweiler",
  "Samoyed",
  "Seter",
  "Shar pei",
  "Shiba inu",
  "Shih tzu",
  "Spaniel",
  "Staffordshire bull terrier",
  "Sznaucer",
  "Terier",
  "West highland white terrier",
  "Whippet",
  "Wyżeł",
  "Yorkshire terrier",
];

const CAT_BREEDS = [
  "Kundel / mieszaniec",
  "Abisyński",
  "American shorthair",
  "Angora turecka",
  "Bengalski",
  "Birma",
  "Bombay",
  "Brytyjski krótkowłosy",
  "Brytyjski długowłosy",
  "Devon rex",
  "Egzotyczny krótkowłosy",
  "Maine coon",
  "Norweski leśny",
  "Pers",
  "Ragdoll",
  "Rosyjski niebieski",
  "Sfinks",
  "Syjamski",
  "Syberyjski",
];

export default function AddFoodPetPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    age: "",
    gender: "Male",
    size: "Medium",
    description: "",
    foodNeed: {
      urgency: "medium",
      specialDiet: "",
      reason: "",
      estimatedCost: "",
      duration: "1_month",
    },
    shelter: {
      name: "",
      address: "",
      contactPhone: "",
      contactEmail: "",
      licenseNumber: "",
    },
    location: {
      city: "",
      address: "",
      coordinates: [21.01178, 52.22977],
    },
  });

  const speciesOptions = [
    { value: "Dog", label: t("dashboard:reportPet.dog", "Dog") },
    { value: "Cat", label: t("dashboard:reportPet.cat", "Cat") },
    { value: "Bird", label: t("dashboard:reportPet.bird", "Bird") },
    { value: "Rabbit", label: "Rabbit" },
    { value: "Other", label: t("dashboard:reportPet.other", "Other") },
  ];

  const genderOptions = [
    { value: "Male", label: t("dashboard:reportPet.male", "Male") },
    { value: "Female", label: t("dashboard:reportPet.female", "Female") },
    { value: "Unknown", label: t("dashboard:reportPet.unknown", "Unknown") },
  ];

  const sizeOptions = [
    { value: "Small", label: "Small" },
    { value: "Medium", label: "Medium" },
    { value: "Large", label: "Large" },
    { value: "Extra Large", label: "Extra Large" },
  ];

  const urgencyOptions = [
    { value: "low", label: "Low - Regular feeding schedule" },
    { value: "medium", label: "Medium - Need consistent food supply" },
    { value: "high", label: "High - Running low on food" },
    { value: "critical", label: "Critical - Out of food in days" },
  ];

  const breedOptions = useMemo(() => {
    const empty = {
      value: "",
      label: t("dashboard:foodPets.selectBreed", "Select breed (optional)"),
    };
    if (formData.species === "Dog") {
      return [empty, ...DOG_BREEDS.map((b) => ({ value: b, label: b }))];
    }
    if (formData.species === "Cat") {
      return [empty, ...CAT_BREEDS.map((b) => ({ value: b, label: b }))];
    }
    return [empty, { value: "Mixed", label: "Mixed" }];
  }, [formData.species, t]);

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData((prev) => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [
          ...prev,
          {
            file,
            preview: event.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.species || !formData.description) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (images.length === 0) {
        toast.error("Please upload at least one image");
        return;
      }

      const token = await getTokenRef.current();
      if (!token) {
        toast.error("Please sign in to add a pet");
        router.push("/sign-in");
        return;
      }

      const backendFormData = new FormData();
      backendFormData.append("title", formData.name);
      backendFormData.append("name", formData.name);
      backendFormData.append("description", formData.description);
      backendFormData.append("species", formData.species);
      backendFormData.append("breed", formData.breed || "");

      if (formData.age && !isNaN(parseInt(formData.age, 10))) {
        backendFormData.append("ageMonths", parseInt(formData.age, 10) * 12);
      }

      backendFormData.append("gender", formData.gender);
      backendFormData.append("size", formData.size);
      backendFormData.append("type", "food_donation");
      backendFormData.append("status", "Pending");
      backendFormData.append("adoptionStatus", "Available");
      backendFormData.append(
        "isUrgent",
        formData.foodNeed?.urgency === "high" ||
          formData.foodNeed?.urgency === "critical"
      );
      backendFormData.append("foodNeed", JSON.stringify(formData.foodNeed || {}));
      backendFormData.append("shelter", JSON.stringify(formData.shelter || {}));
      backendFormData.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: formData.location.coordinates,
          city: formData.location.city,
        })
      );

      images.forEach((img) => {
        backendFormData.append("images", img.file);
      });

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://rafraf.pl";
      const apiUrl = `${API_BASE}/pets`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: backendFormData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Pet added for food donations! Awaiting admin approval.");
        router.push("/dashboard/food-pets");
      } else {
        throw new Error(data.error || data.message || "Failed to add pet");
      }
    } catch (error) {
      console.error("Error adding pet:", error);
      toast.error(error.message || "Failed to add pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marketing-ui mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white md:text-[1.75rem]">
          {t("dashboard:foodPets.addTitle", "Add Pet for Food Donations")}
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">
          {t(
            "dashboard:foodPets.addSubtitle",
            "Help a pet in need by listing them for food sponsorship"
          )}
        </p>
      </div>

      <div className="flex items-start gap-3 border-l-2 border-[#2563EB] bg-[#EEF2FF] px-4 py-3 text-sm text-[#1E40AF] dark:bg-[#2563EB]/15 dark:text-blue-200">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">
            {t("dashboard:foodPets.approvalRequired", "Admin Approval Required")}
          </p>
          <p className="mt-0.5 opacity-90">
            {t(
              "dashboard:foodPets.approvalDesc",
              "All pets must be approved by our admin team before appearing on the platform. We'll review your submission within 24 hours."
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <PawPrint className={sectionIcon} />
            {t("dashboard:foodPets.petInfo", "Pet Information")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.petName", "Pet Name *")}
              </label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Luna"
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.species", "Species *")}
              </label>
              <CustomSelect
                variant="filter"
                tone="light"
                value={formData.species}
                onChange={(v) => {
                  handleInputChange("species", v);
                  handleInputChange("breed", "");
                }}
                options={speciesOptions}
                ariaLabel={t("dashboard:foodPets.species", "Species")}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.breed", "Breed")}
              </label>
              <CustomSelect
                variant="filter"
                tone="light"
                value={formData.breed}
                onChange={(v) => handleInputChange("breed", v)}
                options={breedOptions}
                ariaLabel={t("dashboard:foodPets.breed", "Breed")}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.age", "Age")}
              </label>
              <input
                type="text"
                className={inputClass}
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="e.g. 2 years"
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.gender", "Gender")}
              </label>
              <CustomSelect
                variant="filter"
                tone="light"
                value={formData.gender}
                onChange={(v) => handleInputChange("gender", v)}
                options={genderOptions}
                ariaLabel={t("dashboard:foodPets.gender", "Gender")}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.size", "Size")}
              </label>
              <CustomSelect
                variant="filter"
                tone="light"
                value={formData.size}
                onChange={(v) => handleInputChange("size", v)}
                options={sizeOptions}
                ariaLabel={t("dashboard:foodPets.size", "Size")}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>
              {t("dashboard:foodPets.description", "Description *")}
            </label>
            <textarea
              required
              rows={4}
              className={`${inputClass} !h-auto min-h-[110px] py-3`}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Tell us about this pet's personality, current situation, and why they need food support..."
            />
          </div>
        </section>

        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <Utensils className={sectionIcon} />
            {t("dashboard:foodPets.foodNeedDetails", "Food Need Details")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.urgencyLevel", "Urgency Level")}
              </label>
              <CustomSelect
                variant="filter"
                tone="light"
                value={formData.foodNeed.urgency}
                onChange={(v) => handleInputChange("urgency", v, "foodNeed")}
                options={urgencyOptions}
                ariaLabel={t("dashboard:foodPets.urgencyLevel", "Urgency Level")}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.estimatedCost", "Estimated Monthly Cost")}
              </label>
              <input
                type="number"
                className={inputClass}
                value={formData.foodNeed.estimatedCost}
                onChange={(e) =>
                  handleInputChange("estimatedCost", e.target.value, "foodNeed")
                }
                placeholder="e.g. 200"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>
              {t("dashboard:foodPets.specialDiet", "Special Dietary Requirements")}
            </label>
            <input
              type="text"
              className={inputClass}
              value={formData.foodNeed.specialDiet}
              onChange={(e) =>
                handleInputChange("specialDiet", e.target.value, "foodNeed")
              }
              placeholder="e.g. Grain-free, Senior formula, Prescription diet..."
            />
          </div>
          <div className="mt-4">
            <label className={labelClass}>
              {t("dashboard:foodPets.reasonForNeed", "Reason for Food Need")}
            </label>
            <textarea
              rows={3}
              className={`${inputClass} !h-auto min-h-[90px] py-3`}
              value={formData.foodNeed.reason}
              onChange={(e) =>
                handleInputChange("reason", e.target.value, "foodNeed")
              }
              placeholder="Explain why this pet needs food support..."
            />
          </div>
        </section>

        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <Building2 className={sectionIcon} />
            {t("dashboard:foodPets.shelterInfo", "Shelter/Care Provider Information")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.orgName", "Organization Name *")}
              </label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.shelter.name}
                onChange={(e) =>
                  handleInputChange("name", e.target.value, "shelter")
                }
                placeholder="e.g. Happy Paws Shelter"
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.licenseNumber", "License Number")}
              </label>
              <input
                type="text"
                className={inputClass}
                value={formData.shelter.licenseNumber}
                onChange={(e) =>
                  handleInputChange("licenseNumber", e.target.value, "shelter")
                }
                placeholder="Organization license number"
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.contactPhone", "Contact Phone *")}
              </label>
              <input
                type="tel"
                required
                className={inputClass}
                value={formData.shelter.contactPhone}
                onChange={(e) =>
                  handleInputChange("contactPhone", e.target.value, "shelter")
                }
                placeholder="+48 123 456 789"
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("dashboard:foodPets.contactEmail", "Contact Email *")}
              </label>
              <input
                type="email"
                required
                className={inputClass}
                value={formData.shelter.contactEmail}
                onChange={(e) =>
                  handleInputChange("contactEmail", e.target.value, "shelter")
                }
                placeholder="contact@shelter.org"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>
              {t("dashboard:foodPets.address", "Address *")}
            </label>
            <input
              type="text"
              required
              className={inputClass}
              value={formData.shelter.address}
              onChange={(e) =>
                handleInputChange("address", e.target.value, "shelter")
              }
              placeholder="Full shelter address"
            />
          </div>
        </section>

        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <MapPin className={sectionIcon} />
            {t("dashboard:foodPets.location", "Location")}
          </h2>
          <div>
            <label className={labelClass}>
              {t("dashboard:foodPets.city", "City *")}
            </label>
            <input
              type="text"
              required
              className={inputClass}
              value={formData.location.city}
              onChange={(e) =>
                handleInputChange("city", e.target.value, "location")
              }
              placeholder="e.g. Warsaw"
            />
          </div>
        </section>

        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <Camera className={sectionIcon} />
            {t("dashboard:foodPets.photos", "Pet Photos")}
          </h2>
          <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center transition hover:border-[#2563EB] hover:bg-[#EEF2FF] dark:border-[#494952] dark:bg-[#303030] dark:hover:border-[#2563EB] dark:hover:bg-[#2563EB]/10">
            <UploadCloud className="mb-3 h-8 w-8 text-[#94A3B8] dark:text-white/50" />
            <span className="text-sm font-semibold text-[#0F172A] dark:text-[#e2e7e3]">
              {t(
                "dashboard:foodPets.clickUploadDrop",
                "Click to upload or drag and drop"
              )}
            </span>
            <span className="mt-1 text-xs text-[#94A3B8] dark:text-white/40">
              PNG, JPG or JPEG (MAX. 5MB each)
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-dark-divider"
                >
                  <Image
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-md bg-[#0F172A]/70 p-1.5 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className={`${sectionCard} flex items-center justify-between !py-4`}>
          <button type="button" onClick={() => router.back()} className={ghostBtn}>
            {t("dashboard:foodPets.cancel", "Cancel")}
          </button>
          <button type="submit" disabled={loading} className={primaryBtn}>
            {loading ? (
              t("dashboard:foodPets.submitting", "Submitting...")
            ) : (
              <>
                <Heart className="h-4 w-4" />
                {t("dashboard:foodPets.submitApproval", "Submit for Approval")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
