"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Plus, Trash2, PawPrint, AlertCircle } from "lucide-react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { getPetsByUserId, deletePet } from "../../../services/petService";
import { optimizeCloudinaryUrl } from "../../../lib/imageUtils";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const FALLBACK = "/home/hero-dog.jpg";

const firstImage = (pet) => {
  const raw = pet?.images?.[0];
  if (typeof raw === "string") return raw;
  return raw?.url || raw?.src || pet?.categorizedImages?.[0]?.url || "";
};

const petPhoto = (src) => {
  if (!src || src === "undefined" || src === "null") return FALLBACK;
  let url = String(src).trim().replace(/\\/g, "/");
  if (url.startsWith("//")) url = `https:${url}`;
  if (/^https?:\/\//i.test(url)) return optimizeCloudinaryUrl(url, 800);
  if (url.startsWith("/home/") || url.startsWith("/images/")) return url;
  if (!API_BASE) return FALLBACK;
  return optimizeCloudinaryUrl(`${API_BASE}/${url.replace(/^\//, "")}`, 800);
};

const ageLabel = (ageMonths) => {
  if (ageMonths == null && ageMonths !== 0) return null;
  if (ageMonths <= 6) return "Szczeniak";
  if (ageMonths <= 24) return "Młody";
  if (ageMonths <= 84) return "Dorosły";
  return "Starszy";
};

const genderLabel = (gender) => {
  if (gender === "Male") return "Samiec";
  if (gender === "Female") return "Suczka";
  return gender || null;
};

function ListingThumb({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      loading="lazy"
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 group-hover/img:scale-[1.03]"
      onError={() => {
        if (imgSrc !== FALLBACK) setImgSrc(FALLBACK);
      }}
    />
  );
}

function StatusBadge({ status, t }) {
  if (status === "Approved") {
    return (
      <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
        {t("dashboard:myPets.active", "Active")}
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="text-[13px] font-semibold text-amber-600 dark:text-amber-400">
        {t("dashboard:myPets.underReview", "Under Review")}
      </span>
    );
  }
  return (
    <span className="text-[13px] font-semibold text-red-600 dark:text-red-400">
      {t("dashboard:myPets.rejected", "Rejected")}
    </span>
  );
}

export default function DashboardPetsPage() {
  const { t } = useLanguage();
  const { user, getToken, userId, loading: authLoading } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadPets = async () => {
      if (!userId) {
        if (!cancelled) {
          setPets([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) setIsLoading(true);
        const response = await getPetsByUserId(userId, getTokenRef.current);
        if (cancelled) return;
        setPets(Array.isArray(response) ? response : response?.pets || []);
      } catch (error) {
        console.error("Error loading pets:", error);
        if (!cancelled) setPets([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPets();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleDelete = async (petId) => {
    if (
      !window.confirm(
        t("dashboard:myPets.confirmDelete", "Are you sure you want to delete this pet listing?")
      )
    ) {
      return;
    }
    try {
      await deletePet(petId, getTokenRef.current);
      const response = await getPetsByUserId(userId, getTokenRef.current);
      setPets(Array.isArray(response) ? response : response?.pets || []);
    } catch (error) {
      alert("Failed to delete pet: " + (error?.message || error));
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="marketing-ui flex min-h-[50vh] flex-col items-center justify-center p-8">
        <div className="mb-4 h-10 w-10 animate-spin border-2 border-[#E2E8F0] border-t-[#2563EB]" />
        <p className="text-sm font-medium text-[#64748B]">
          {t("dashboard:myPets.loading", "Loading...")}
        </p>
      </div>
    );
  }

  if (!user) return null;

  const pendingCount = pets.filter((p) => p?.status && p.status !== "Approved").length;

  return (
    <div className="marketing-ui mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white md:text-[1.75rem]">
            {t("dashboard:myPets.title", "My Pets")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-[#64748B] dark:text-gray-400">
            {t("dashboard:myPets.subtitle", "Manage your adoption listings.")}
          </p>
        </div>
        <Link
          href="/dashboard/cars/add"
          className="inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t("dashboard:myPets.addPet", "Add Pet")}
        </Link>
      </div>

      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              {t("dashboard:myPets.pendingApproval", "Pending Approval")}
            </p>
            <p className="mt-0.5 opacity-90">
              {t(
                "dashboard:myPets.pendingDesc",
                "Some of your listings are being reviewed. They will be visible to adopters once approved by an administrator."
              )}
            </p>
          </div>
        </motion.div>
      )}

      {pets.length === 0 ? (
        <div className="border border-dashed border-[#CBD5E1] bg-white px-6 py-20 text-center dark:border-dark-divider dark:bg-dark-card">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15">
            <PawPrint className="h-7 w-7" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-white">
            {t("dashboard:myPets.noPets", "No pets listed yet")}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard:myPets.noPetsDesc",
              "You don't have any active listings. Create your first listing to help a pet find a home."
            )}
          </p>
          <Link
            href="/dashboard/cars/add"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-6 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {t("dashboard:myPets.createFirst", "Create First Listing")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pets.map((pet, index) => {
            const id = pet?._id || pet?.id;
            const href = `/website/pets/${id}`;
            const name = pet?.name || pet?.breed || pet?.species || "Zwierzak";
            const meta = [pet?.breed, ageLabel(pet?.ageMonths), genderLabel(pet?.gender)]
              .filter(Boolean)
              .join(" · ");
            const location = [pet?.location?.city, pet?.location?.state].filter(Boolean).join(", ");
            const photo = petPhoto(firstImage(pet));

            return (
              <motion.article
                key={id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.25), duration: 0.35 }}
                className="group flex flex-col overflow-hidden border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card"
              >
                <Link
                  href={href}
                  className="group/img relative block aspect-[5/4] overflow-hidden bg-[#E2E8F0] dark:bg-dark-raised"
                >
                  <ListingThumb src={photo} alt={name} />
                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover/img:bg-black/10" />
                </Link>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <StatusBadge status={pet.status} t={t} />
                    {location ? (
                      <span className="flex min-w-0 items-center gap-1 text-xs text-[#94A3B8]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{location}</span>
                      </span>
                    ) : null}
                  </div>

                  <Link href={href} className="min-w-0">
                    <h2 className="font-display text-[1.55rem] font-bold leading-[1.15] text-[#0F172A] transition group-hover:text-[#2563EB] dark:text-white">
                      {name}
                    </h2>
                    {meta && (
                      <p className="mt-1.5 text-[13px] font-medium text-[#64748B] dark:text-gray-400">
                        {meta}
                      </p>
                    )}
                    {pet?.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#64748B] dark:text-white/45">
                        {pet.description}
                      </p>
                    )}
                  </Link>

                  <div className="mt-5 flex items-center gap-2">
                    <Link
                      href={href}
                      className="inline-flex h-10 flex-1 items-center justify-center bg-[#2563EB] text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                    >
                      {t("dashboard:myPets.view", "View")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(id)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 border border-[#E2E8F0] px-3.5 text-sm font-medium text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-dark-divider dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      aria-label={t("dashboard:myPets.delete", "Delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{t("dashboard:myPets.delete", "Delete")}</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
