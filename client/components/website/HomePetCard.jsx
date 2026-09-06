"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const petPhoto = (src) => {
  if (!src) return "/home/hero-dog.jpg";
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
  return `${API_BASE}/${String(src).replace("\\", "/")}`;
};

const ageLabel = (ageMonths) => {
  if (ageMonths == null && ageMonths !== 0) return null;
  if (ageMonths <= 6) return "Szczeniak";
  if (ageMonths <= 24) return "Młody";
  if (ageMonths <= 84) return "Dorosły";
  return "Starszy";
};

export default function HomePetCard({ pet, viewMode = "grid" }) {
  const href = `/website/pets/${pet._id || pet.id}`;
  const name = pet?.name || pet?.breed || pet?.species || "Zwierzak";
  const meta = [
    pet?.breed,
    ageLabel(pet?.ageMonths),
    pet?.gender === "Male" ? "Samiec" : pet?.gender === "Female" ? "Suczka" : pet?.gender,
  ]
    .filter(Boolean)
    .join(" · ");
  const city = pet?.location?.city;

  if (viewMode === "list") {
    return (
      <Link href={href} className="group flex overflow-hidden bg-white dark:bg-dark-card">
        <div className="relative h-36 w-36 shrink-0 overflow-hidden sm:h-44 sm:w-56">
          <Image
            src={petPhoto(pet?.images?.[0])}
            alt={name}
            fill
            loading="lazy"
            sizes="224px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
          <h3 className="font-display text-2xl font-medium leading-tight text-[#0F172A] dark:text-white">
            {name}
          </h3>
          {meta && <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">{meta}</p>}
          {city && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
              <MapPin className="h-3.5 w-3.5" />
              {city}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block bg-white dark:bg-dark-card">
      <div className="relative h-72 overflow-hidden">
        <Image
          src={petPhoto(pet?.images?.[0])}
          alt={name}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {pet?.isUrgent && (
          <span className="absolute left-3 top-3 bg-[#2563EB] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            Pilne
          </span>
        )}
      </div>
      <div className="px-4 py-4">
        <h3 className="font-display text-[1.65rem] font-medium leading-tight text-[#0F172A] dark:text-white">
          {name}
        </h3>
        {meta && <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">{meta}</p>}
        {city && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            <MapPin className="h-3.5 w-3.5" />
            {city}
          </p>
        )}
      </div>
    </Link>
  );
}
