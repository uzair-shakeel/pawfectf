"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Heart,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../lib/auth/AuthContext";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import { getPetsByUserId, deletePet } from "../../../services/petService";
import CustomSelect from "../../../components/website/CustomSelect";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const FALLBACK = "/home/hero-dog.jpg";

function getImageSrc(images) {
  if (!images || images.length === 0) return FALLBACK;
  const img = images[0];
  if (typeof img !== "string") return img?.url || FALLBACK;
  if (img.startsWith("http")) return img;
  return `${API_BASE}/${img.replace(/^[/\\]+/, "")}`;
}

function formatAge(ageMonths) {
  if (!ageMonths && ageMonths !== 0) return null;
  if (ageMonths < 12) return `${ageMonths} miesiące`;
  const y = Math.floor(ageMonths / 12);
  const m = ageMonths % 12;
  const yearWord = y === 1 ? "rok" : y >= 2 && y <= 4 ? "Lata" : "Lat";
  return m ? `${y} ${yearWord} ${m} miesiące` : `${y} ${yearWord}`;
}

function StatusText({ status, t }) {
  if (status === "Approved") {
    return (
      <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
        {t("dashboard:foodDonations.approved", "Approved")}
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="text-[13px] font-semibold text-amber-600 dark:text-amber-400">
        {t("dashboard:foodDonations.pending", "Pending")}
      </span>
    );
  }
  return (
    <span className="text-[13px] font-semibold text-red-600 dark:text-red-400">
      {t("dashboard:foodDonations.rejected", "Rejected")}
    </span>
  );
}

export default function FoodPetsPage() {
  const { t } = useLanguage();
  const { user, getToken, userId } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const loadPets = async () => {
      if (!userId) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        if (!cancelled) setLoading(true);
        const data = await getPetsByUserId(userId, getTokenRef.current);
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setPets(list.filter((pet) => pet.type === "food_donation"));
        }
      } catch (error) {
        console.error("Error loading pets:", error);
        toast.error("Failed to load pets");
        if (!cancelled) setPets([]);
      } finally {
        if (!cancelled) setLoading(false);
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
        t(
          "dashboard:foodDonations.confirmDelete",
          "Are you sure you want to delete this pet listing?"
        )
      )
    ) {
      return;
    }
    try {
      await deletePet(petId, getTokenRef.current);
      toast.success("Pet removed");
      setPets((prev) => prev.filter((p) => p._id !== petId));
    } catch (error) {
      toast.error("Failed to delete: " + (error?.message || error));
    }
  };

  const filtered = pets.filter((pet) => {
    const matchesSearch =
      !search ||
      pet.title?.toLowerCase().includes(search.toLowerCase()) ||
      pet.name?.toLowerCase().includes(search.toLowerCase()) ||
      pet.species?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || pet.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: t("dashboard:foodDonations.allStatus", "All Status") },
    { value: "pending", label: t("dashboard:foodDonations.pending", "Pending") },
    { value: "approved", label: t("dashboard:foodDonations.approved", "Approved") },
    { value: "rejected", label: t("dashboard:foodDonations.rejected", "Rejected") },
  ];

  const stats = [
    {
      label: t("dashboard:foodDonations.approved", "Approved"),
      value: pets.filter((p) => p.status === "Approved").length,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: t("dashboard:foodDonations.pending", "Pending"),
      value: pets.filter((p) => p.status === "Pending").length,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: t("dashboard:foodDonations.rejected", "Rejected"),
      value: pets.filter((p) => p.status === "Rejected").length,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: t("dashboard:foodDonations.totalListed", "Total Listed"),
      value: pets.length,
      icon: Heart,
      color: "text-[#2563EB]",
      bg: "bg-[#EEF2FF] dark:bg-[#2563EB]/15",
    },
  ];

  if (loading || !user) {
    return (
      <div className="marketing-ui flex min-h-[50vh] flex-col items-center justify-center p-8">
        <div className="mb-4 h-10 w-10 animate-spin border-2 border-[#E2E8F0] border-t-[#2563EB]" />
        <p className="text-sm font-medium text-[#64748B]">
          {t("dashboard:foodDonations.loading", "Loading...")}
        </p>
      </div>
    );
  }

  return (
    <div className="marketing-ui mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white md:text-[1.75rem]">
            {t("dashboard:foodDonations.title", "Food Donation Pets")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard:foodDonations.subtitle",
              "Manage pets listed for food sponsorship"
            )}
          </p>
        </div>
        <Link
          href="/dashboard/food-pets/add"
          className="inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t("dashboard:foodDonations.addPet", "Add Pet for Food Donations")}
        </Link>
      </div>

      {pets.some((p) => p.status !== "Approved") && (
        <div className="flex items-start gap-3 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <Clock className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              {t("dashboard:foodDonations.pendingApproval", "Pending Approval")}
            </p>
            <p className="mt-0.5 opacity-90">
              {t(
                "dashboard:foodDonations.pendingDesc",
                "Some pets are under review. They will be visible to donors once approved by an administrator."
              )}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="border border-[#E2E8F0] bg-white p-4 dark:border-dark-divider dark:bg-dark-card"
          >
            <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl font-bold text-[#0F172A] dark:text-white">
                  {value}
                </p>
                <p className="text-xs font-medium leading-snug text-[#64748B] dark:text-gray-400">
                  {label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border border-[#E2E8F0] bg-white p-4 dark:border-dark-divider dark:bg-dark-card sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder={t(
              "dashboard:foodDonations.searchPlaceholder",
              "Search by pet name or species..."
            )}
            className="h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-3.5 text-[15px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] dark:border-[#494952] dark:bg-[#303030] dark:text-[#e2e7e3] dark:placeholder:text-white/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-52">
          <CustomSelect
            variant="filter"
            tone="light"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            ariaLabel={t("dashboard:foodDonations.allStatus", "All Status")}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-[#CBD5E1] bg-white px-6 py-20 text-center dark:border-dark-divider dark:bg-dark-card">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15">
            <Heart className="h-7 w-7" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-white">
            {t("dashboard:foodDonations.noPets", "No pets listed yet")}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard:foodDonations.noPetsDesc",
              "List your pets to start receiving food donations from caring supporters."
            )}
          </p>
          <Link
            href="/dashboard/food-pets/add"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-6 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {t("dashboard:foodDonations.addFirst", "Add Your First Pet")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((pet, index) => {
            const title = pet.title || pet.name || "Pet";
            const meta = [pet.species, pet.breed, formatAge(pet.ageMonths)]
              .filter(Boolean)
              .join(" · ");
            const photo = getImageSrc(pet.images);

            return (
              <motion.article
                key={pet._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.25) }}
                className="group flex flex-col overflow-hidden border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-[#E2E8F0] dark:bg-dark-raised">
                  <Image
                    src={photo}
                    alt={title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    unoptimized={
                      photo.startsWith("http://127") ||
                      photo.startsWith("http://localhost")
                    }
                  />
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <StatusText status={pet.status} t={t} />
                    {pet.location?.city ? (
                      <span className="flex min-w-0 items-center gap-1 text-xs text-[#94A3B8]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{pet.location.city}</span>
                      </span>
                    ) : null}
                  </div>

                  <h2 className="font-display text-[1.45rem] font-bold leading-snug text-[#0F172A] dark:text-white">
                    {title}
                  </h2>
                  {meta && (
                    <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">
                      {meta}
                    </p>
                  )}

                  <div className="mt-5 flex items-center gap-2">
                    <Link
                      href={`/website/pets/${pet._id}`}
                      className="inline-flex h-10 flex-1 items-center justify-center bg-[#2563EB] text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                    >
                      {t("dashboard:foodDonations.view", "View")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(pet._id)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 border border-[#E2E8F0] px-3.5 text-sm font-medium text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-dark-divider dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{t("dashboard:foodDonations.delete", "Delete")}</span>
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
