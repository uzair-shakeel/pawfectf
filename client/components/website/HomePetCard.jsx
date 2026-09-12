"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { optimizeCloudinaryUrl } from "../../lib/imageUtils";

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

function CardImage({ src, alt, sizes }) {
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
      sizes={sizes}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => {
        if (imgSrc !== FALLBACK) setImgSrc(FALLBACK);
      }}
    />
  );
}

export default function HomePetCard({ pet, viewMode = "grid" }) {
  const href = pet?.href || `/website/pets/${pet._id || pet.id}`;
  const name = pet?.name || pet?.breed || pet?.species || "Zwierzak";
  const badge = pet?.customLabel || pet?.badge;
  const meta = [
    pet?.breed,
    ageLabel(pet?.ageMonths),
    pet?.gender === "Male" ? "Samiec" : pet?.gender === "Female" ? "Suczka" : pet?.gender,
  ]
    .filter(Boolean)
    .join(" · ");
  const photo = petPhoto(firstImage(pet));

  if (viewMode === "list") {
    return (
      <Link href={href} className="group flex overflow-hidden bg-white dark:bg-dark-card">
        <div className="relative h-36 w-36 shrink-0 overflow-hidden sm:h-44 sm:w-56">
          <CardImage src={photo} alt={name} sizes="224px" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
          <h3 className="font-display text-2xl font-bold leading-tight text-[#0F172A] dark:text-white">
            {name}
          </h3>
          {meta && <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">{meta}</p>}
          {pet?.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#64748B] dark:text-white/50">
              {pet.description}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex h-full flex-col bg-white dark:bg-dark-card">
      <div className="relative h-72 overflow-hidden">
        <CardImage src={photo} alt={name} sizes="(max-width: 768px) 100vw, 25vw" />
        {(badge || pet?.isUrgent) && (
          <span className="absolute left-3 top-3 bg-[#2563EB] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            {badge || "Pilne"}
          </span>
        )}
      </div>
      <div className="px-4 py-4">
        <h3 className="font-display text-[1.65rem] font-bold leading-tight text-[#0F172A] dark:text-white">
          {name}
        </h3>
        {meta && <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">{meta}</p>}
        {pet?.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#64748B] dark:text-white/50">
            {pet.description}
          </p>
        )}
      </div>
    </Link>
  );
}
