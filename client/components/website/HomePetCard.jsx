"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { optimizeCloudinaryUrl } from "../../lib/imageUtils";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const FALLBACK = "/home/hero-dog.jpg";

const normalizeImage = (raw) => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  return raw?.url || raw?.src || "";
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

function CardImageSlider({ photos, name, badge, sizes = "(max-width: 768px) 100vw, 25vw", className = "h-72" }) {
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const hasSlider = count > 1;

  const go = (dir, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + dir + count) % count);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <CardImage src={photos[index] || photos[0]} alt={`${name} ${index + 1}`} sizes={sizes} />

      {badge && (
        <span className="absolute left-3 top-3 z-10 bg-[#2563EB] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          {badge}
        </span>
      )}

      {hasSlider && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => go(-1, e)}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-[#0F172A]/65 text-white opacity-0 transition group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => go(1, e)}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-[#0F172A]/65 text-white opacity-0 transition group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/55"
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-2.5 right-2.5 z-10 bg-[#0F172A]/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {index + 1}/{count}
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePetCard({ pet, viewMode = "grid" }) {
  const href = pet?.href || `/website/pets/${pet._id || pet.id}`;
  const name = pet?.name || pet?.breed || pet?.species || "Zwierzak";
  const badge = pet?.customLabel || pet?.badge || (pet?.isUrgent ? "Pilne" : null);
  const meta = [
    pet?.breed,
    ageLabel(pet?.ageMonths),
    pet?.gender === "Male"
      ? "Samiec"
      : pet?.gender === "Female"
        ? "Suczka"
        : pet?.gender,
  ]
    .filter(Boolean)
    .join(" · ");

  const photos = useMemo(() => {
    const list = Array.isArray(pet?.images) ? pet.images : [];
    const urls = list.map(normalizeImage).filter(Boolean).map(petPhoto);
    if (urls.length) return urls;
    const fallback = petPhoto(
      normalizeImage(pet?.categorizedImages?.[0]) || ""
    );
    return [fallback || FALLBACK];
  }, [pet]);

  const location = [pet?.location?.city, pet?.location?.state]
    .filter(Boolean)
    .join(", ");

  if (viewMode === "list") {
    return (
      <Link
        href={href}
        className="group flex overflow-hidden bg-white dark:bg-dark-card"
      >
        <div className="relative h-36 w-36 shrink-0 overflow-hidden sm:h-44 sm:w-56">
          <CardImageSlider
            photos={photos}
            name={name}
            badge={badge}
            sizes="224px"
            className="h-full w-full"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
          <h3 className="font-display text-2xl font-bold leading-tight text-[#0F172A] dark:text-white">
            {name}
          </h3>
          {meta && (
            <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">
              {meta}
            </p>
          )}
          {pet?.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#64748B] dark:text-white/50">
              {pet.description}
            </p>
          )}
          {location && (
            <p className="mt-2 flex items-center gap-1 text-sm text-[#64748B] dark:text-gray-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col bg-white dark:bg-dark-card"
    >
      <CardImageSlider photos={photos} name={name} badge={badge} />
      <div className="px-4 py-4">
        <h3 className="font-display text-[1.65rem] font-bold leading-tight text-[#0F172A] dark:text-white">
          {name}
        </h3>
        {meta && (
          <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">
            {meta}
          </p>
        )}
        {pet?.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#64748B] dark:text-white/50">
            {pet.description}
          </p>
        )}
        {location && (
          <p className="mt-2 flex items-center gap-1 text-sm text-[#64748B] dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
