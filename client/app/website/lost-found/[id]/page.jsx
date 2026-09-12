"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Mail, MapPin, Phone, X } from "lucide-react";
import { getLostFoundById } from "../../../../services/lostFoundService";
import { getPublicUserInfo } from "../../../../services/userService";
import { optimizeCloudinaryUrl } from "../../../../lib/imageUtils";
import { toTelHref } from "../../../../lib/utils";
import { useLanguage } from "../../../../lib/i18n/LanguageContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");

const formatImageUrl = (imagePath) => {
  if (!imagePath) return "/home/lost-found.jpg";
  if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) return optimizeCloudinaryUrl(imagePath, 1200);
  return optimizeCloudinaryUrl(`${API_BASE}/${String(imagePath).replace("\\", "/")}`, 1200);
};

const translateSpecies = (species) => {
  if (species === "Dog") return "Pies";
  if (species === "Cat") return "Kot";
  return species;
};

const translateGender = (gender) => {
  if (gender === "Male") return "Samiec";
  if (gender === "Female") return "Suczka";
  return gender;
};

export default function LostFoundDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
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
            setCity(d.address?.city || d.address?.town || d.address?.village || data.location?.city || "");
          } catch {
            setCity(data.location?.city || "");
          }
        } else {
          setCity(data.location?.city || "");
        }
      } catch (err) {
        console.error(err);
        setError("Nie udało się wczytać szczegółów");
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  const images = (entry?.images || []).map(formatImageUrl);
  if (entry && !images.length) images.push("/home/lost-found.jpg");

  useEffect(() => {
    const handler = (e) => {
      if (!fullscreen || !images.length) return;
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") setActiveImg((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActiveImg((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen, images.length]);

  if (loading) {
    return (
      <div className="marketing-ui flex min-h-screen items-center justify-center bg-[#F4F7FB] dark:bg-dark-main">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-r-transparent" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="marketing-ui flex min-h-screen flex-col items-center justify-center bg-[#F4F7FB] px-4 text-center dark:bg-dark-main">
        <p className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
          {error || t("lostFoundPage.notFound", "Nie znaleziono ogłoszenia")}
        </p>
        <Link href="/website/lost-found" className="mt-6 text-sm font-semibold text-[#2563EB]">
          {t("lostFoundPage.back", "Wróć do listy")}
        </Link>
      </div>
    );
  }

  const reporterName =
    reporter?.companyName || `${reporter?.firstName || ""} ${reporter?.lastName || ""}`.trim() || t("lostFoundPage.user", "Użytkownik");
  const typeLabel = entry.type === "Lost" ? t("lostFoundPage.lost", "Zaginione") : t("lostFoundPage.found", "Znalezione");
  const dateLabel = entry.dateLostOrFound
    ? new Date(entry.dateLostOrFound).toLocaleDateString("pl-PL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";

  const specs = [
    { label: t("lostFoundPage.species", "Gatunek"), value: translateSpecies(entry.species) },
    { label: t("lostFoundPage.breed", "Rasa"), value: entry.breed },
    { label: t("lostFoundPage.gender", "Płeć"), value: translateGender(entry.gender) },
    { label: t("lostFoundPage.color", "Kolor"), value: entry.color },
    { label: t("lostFoundPage.location", "Lokalizacja"), value: city || t("lostFoundPage.unknownLocation", "Nieznana lokalizacja") },
    { label: t("lostFoundPage.date", "Data"), value: dateLabel },
  ].filter((item) => item.value && item.value !== "Unknown");

  return (
    <div className="marketing-ui min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      {fullscreen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[400] bg-[#0F172A]">
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="fixed top-4 right-4 z-[410] flex h-12 w-12 items-center justify-center !bg-[#2563EB] !text-white shadow-lg transition hover:!bg-[#1D4ED8]"
            >
              <X className="h-5 w-5" />
            </button>
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 z-[410] flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/10 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <div className="relative mx-auto h-full max-w-5xl">
              <Image src={images[activeImg]} alt={entry.title} fill className="object-contain" sizes="100vw" priority unoptimized />
            </div>
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                className="absolute right-4 top-1/2 z-[410] flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/10 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>,
          document.body
        )}

      <div className="mx-auto w-full max-w-[1520px] px-4 py-8 sm:px-8 md:py-12">
        <button
          type="button"
          onClick={() => router.push("/website/lost-found")}
          className="mb-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#64748B] transition hover:text-[#2563EB]"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("lostFoundPage.back", "Wróć do listy")}
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative h-[300px] cursor-pointer overflow-hidden bg-[#EEF2FF] sm:h-[460px] dark:bg-dark-raised" onClick={() => setFullscreen(true)}>
              <Image src={images[activeImg]} alt={entry.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 66vw" />
              <span className="absolute left-4 top-4 bg-[#2563EB] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                {typeLabel}
              </span>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImg((i) => (i - 1 + images.length) % images.length);
                    }}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-[#0F172A]/60 text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImg((i) => (i + 1) % images.length);
                    }}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-[#0F172A]/60 text-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`relative h-20 w-28 shrink-0 overflow-hidden ${activeImg === i ? "ring-2 ring-[#2563EB]" : "opacity-70 hover:opacity-100"}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="112px" />
                  </button>
                ))}
              </div>
            )}

            {entry.description && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
                  {t("lostFoundPage.description", "Opis")}
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-[16px] leading-relaxed text-[#64748B] dark:text-gray-400">
                  {entry.description}
                </p>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-[#E2E8F0] bg-white p-6 dark:border-dark-divider dark:bg-dark-card sm:p-8">
              <h1 className="font-display text-[1.85rem] font-bold leading-tight text-[#0F172A] dark:text-white md:text-[2.1rem]">
                {entry.title}
              </h1>

              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-[#E2E8F0] py-6 dark:border-dark-divider">
                {specs.map((spec) => (
                  <div key={spec.label} className={spec.label === t("lostFoundPage.location", "Lokalizacja") ? "col-span-2" : ""}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{spec.label}</p>
                    <p className="mt-1 flex items-center gap-1.5 font-semibold">
                      {spec.label === t("lostFoundPage.location", "Lokalizacja") && <MapPin className="h-4 w-4 text-[#2563EB]" />}
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                {t("lostFoundPage.contact", "Osoba kontaktowa")}
              </h3>

              {reporter && (
                <Link
                  href={`/website/profile?id=${entry.reporterId}`}
                  className="mt-3 flex items-center gap-3 py-2 transition hover:text-[#2563EB]"
                >
                  <div className="relative h-12 w-12 overflow-hidden bg-[#EEF2FF] dark:bg-dark-raised">
                    {reporter.image ? (
                      <Image src={formatImageUrl(reporter.image)} alt={reporterName} fill className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-bold text-[#2563EB]">{reporterName[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{reporterName}</p>
                    <p className="text-sm text-[#64748B]">{t("lostFoundPage.viewProfile", "Zobacz profil")}</p>
                  </div>
                </Link>
              )}

              <div className="mt-5 flex flex-col gap-3">
                {entry.contactPhone && (
                  <a
                    href={toTelHref(entry.contactPhone)}
                    className="flex h-12 items-center justify-center gap-2 bg-[#2563EB] text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
                  >
                    <Phone className="h-4 w-4" />
                    {t("lostFoundPage.call", "Zadzwoń")} {entry.contactPhone}
                  </a>
                )}
                {entry.contactEmail && (
                  <a
                    href={`mailto:${entry.contactEmail}`}
                    className="flex h-12 items-center justify-center gap-2 border border-[#0F172A] text-sm font-bold text-[#0F172A] dark:border-white dark:text-white"
                  >
                    <Mail className="h-4 w-4" />
                    {t("lostFoundPage.email", "Napisz e-mail")}
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
