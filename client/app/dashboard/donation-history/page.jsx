"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, ArrowRight, CheckCircle, Wallet, PawPrint } from "lucide-react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import foodDonationService from "../../../services/foodDonationService";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

function getImageSrc(images) {
  if (!images || images.length === 0) return "/placeholder.jpg";
  const img = images[0];
  if (!img) return "/placeholder.jpg";
  if (img.startsWith("http")) return img;
  return `${API_BASE}/${img.replace(/^[/\\]+/, "")}`;
}

export default function DonationHistoryPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(false);

  useEffect(() => {
    if (!user || loadRef.current) return;
    loadRef.current = true;
    loadDonations();
  }, [user]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await foodDonationService.getMyDonations();
      const donationsArray = data.donations || data || [];
      setDonations(Array.isArray(donationsArray) ? donationsArray : []);
    } catch (error) {
      console.error("[DONATION HISTORY] Error loading donations:", error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const totalDonated = donations.reduce(
    (sum, d) => sum + (d.payment?.amount || 0),
    0
  );
  const petsHelped = new Set(
    donations.map((d) => d.petId?._id || d.petId).filter(Boolean)
  ).size;

  const stats = [
    {
      label: t("dashboard:donationHistory.totalDonations", "Total Donations"),
      value: donations.length,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: t("dashboard:donationHistory.petsHelped", "Pets Helped"),
      value: petsHelped,
      icon: PawPrint,
      color: "text-[#2563EB]",
      bg: "bg-[#EEF2FF] dark:bg-[#2563EB]/15",
    },
    {
      label: t("dashboard:donationHistory.totalDonated", "Total Donated"),
      value: `${totalDonated} zł`,
      icon: Wallet,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  if (loading || !user) {
    return (
      <div className="marketing-ui flex min-h-[50vh] flex-col items-center justify-center p-8">
        <div className="mb-4 h-10 w-10 animate-spin border-2 border-[#E2E8F0] border-t-[#2563EB]" />
        <p className="text-sm font-medium text-[#64748B]">
          {t("dashboard:donationHistory.loading", "Loading...")}
        </p>
      </div>
    );
  }

  return (
    <div className="marketing-ui mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white md:text-[1.75rem]">
            {t("dashboard:donationHistory.title", "Donation History")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard:donationHistory.subtitle",
              "View all your food donations to pets in need"
            )}
          </p>
        </div>
        <Link
          href="/website/food-donations"
          className="inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
        >
          <Heart className="h-4 w-4" strokeWidth={2.5} />
          {t("dashboard:donationHistory.donateMore", "Donate to More Pets")}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="border border-[#E2E8F0] bg-white p-4 dark:border-dark-divider dark:bg-dark-card"
          >
            <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center ${bg}`}
              >
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

      {donations.length === 0 ? (
        <div className="border border-dashed border-[#CBD5E1] bg-white px-6 py-20 text-center dark:border-dark-divider dark:bg-dark-card">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15">
            <Heart className="h-7 w-7" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-white">
            {t("dashboard:donationHistory.noDonations", "No donations yet")}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard:donationHistory.noDonationsDesc",
              "Start making a difference by donating food to pets in need."
            )}
          </p>
          <Link
            href="/website/food-donations"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-6 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
          >
            <Heart className="h-4 w-4" strokeWidth={2.5} />
            {t("dashboard:donationHistory.browsePets", "Browse Pets to Help")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {donations.map((donation) => {
            const pet = donation.petId;
            const imgSrc = getImageSrc(pet?.images);
            const isLocalUrl =
              imgSrc.startsWith("http://127") ||
              imgSrc.startsWith("http://localhost");
            const title = pet?.title || pet?.name || "Pet";
            const meta = [pet?.species, pet?.breed || "Mixed"]
              .filter(Boolean)
              .join(" · ");

            return (
              <article
                key={donation._id}
                className="group flex flex-col overflow-hidden border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card sm:flex-row"
              >
                <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-[#E2E8F0] dark:bg-dark-raised sm:aspect-auto sm:h-auto sm:w-40">
                  <Image
                    src={imgSrc}
                    alt={title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 160px"
                    unoptimized={isLocalUrl}
                  />
                  <span className="absolute left-3 top-3 bg-emerald-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {t("dashboard:donationHistory.donated", "Donated")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-white">
                        {title}
                      </h3>
                      <p className="mt-0.5 text-sm text-[#64748B] dark:text-gray-400">
                        {meta}
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-lg font-bold text-[#2563EB]">
                      {donation.payment?.amount ?? 0} zł
                    </p>
                  </div>

                  {pet?.location?.city && (
                    <div className="mt-3 flex items-center gap-1.5 text-sm text-[#64748B] dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
                      <span>{pet.location.city}</span>
                    </div>
                  )}

                  {donation.donorMessage && (
                    <p className="mt-3 border-l-2 border-[#2563EB] bg-[#EEF2FF] px-3 py-2 text-sm italic text-[#1E40AF] dark:bg-[#2563EB]/10 dark:text-blue-200">
                      &ldquo;{donation.donorMessage}&rdquo;
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-[#E2E8F0] pt-3 dark:border-dark-divider">
                    <p className="text-xs font-medium text-[#94A3B8]">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </p>
                    <Link
                      href={`/website/pets/${pet?._id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
                    >
                      {t("dashboard:donationHistory.viewPet", "View Pet")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
