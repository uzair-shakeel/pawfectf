"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { optimizeCloudinaryUrl } from "../../lib/imageUtils";
import { usePetImageTransition } from "../../lib/petImageTransition/PetImageTransitionContext";

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

function CardImage({ src, alt, sizes, priority = false }) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      onError={() => {
        if (imgSrc !== FALLBACK) setImgSrc(FALLBACK);
      }}
    />
  );
}

function CardImageSlider({
  photos,
  name,
  badge,
  sizes = "(max-width: 768px) 100vw, 25vw",
  className = "h-72",
  imageIndex,
  onIndexChange,
}) {
  const count = photos.length;
  const hasSlider = count > 1;
  const index = Math.min(Math.max(0, imageIndex || 0), Math.max(0, count - 1));

  const go = (dir, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onIndexChange || !count) return;
    onIndexChange((index + dir + count) % count);
  };

  return (
    <div
      data-pet-tile
      data-pet-tile-index={String(index)}
      className={`relative overflow-hidden [&_[data-pet-morph-source]]:opacity-0 ${className}`}
    >
      <CardImage
        src={photos[index] || photos[0]}
        alt={`${name} ${index + 1}`}
        sizes={sizes}
        priority
      />

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
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-black/45 text-white opacity-0 transition group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => go(1, e)}
            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-black/45 text-white opacity-0 transition group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="absolute bottom-2 right-2 z-20 bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>
  );
}

export default function HomePetCard({ pet, viewMode = "grid" }) {
  const router = useRouter();
  const { startTransition } = usePetImageTransition();
  const imageWrapRef = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const petId = pet?._id || pet?.id;
  const href = pet?.href || `/website/pets/${petId}`;
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

  const handleNavigate = useCallback(
    (event) => {
      if (event?.defaultPrevented) return;
      if (event && "button" in event && event.button !== 0) return;
      if (event?.metaKey || event?.ctrlKey || event?.shiftKey || event?.altKey) {
        return;
      }
      if (!petId || !href) return;

      event?.preventDefault?.();

      const canMorph = href.includes("/website/pets/");
      if (canMorph && imageWrapRef.current) {
        startTransition({
          petId: String(petId),
          href,
          imageSrc: photos[slideIndex] || photos[0] || FALLBACK,
          sourceEl: imageWrapRef.current,
          clientX: event?.clientX,
          clientY: event?.clientY,
          imageCount: photos.length,
        });
      }

      router.push(href, { scroll: false });
    },
    [href, petId, photos, router, slideIndex, startTransition]
  );

  const cardBody = (
    <>
      <h3
        className={`font-display font-bold leading-tight text-[#0F172A] dark:text-white ${
          viewMode === "list" ? "text-2xl" : "text-[1.65rem]"
        }`}
      >
        {name}
      </h3>
      {meta && (
        <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">{meta}</p>
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
    </>
  );

  if (viewMode === "list") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleNavigate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleNavigate(e);
        }}
        className="group flex cursor-pointer overflow-hidden bg-white dark:bg-dark-card"
      >
      <div ref={imageWrapRef} data-pet-card-id={petId || undefined} className="relative h-36 w-36 shrink-0 overflow-hidden sm:h-44 sm:w-56">
          <CardImageSlider
            photos={photos}
            name={name}
            badge={badge}
            sizes="224px"
            className="h-full w-full"
            imageIndex={slideIndex}
            onIndexChange={setSlideIndex}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
          {cardBody}
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleNavigate(e);
      }}
      className="group flex h-full cursor-pointer flex-col bg-white dark:bg-dark-card"
    >
      <div ref={imageWrapRef} data-pet-card-id={petId || undefined}>
        <CardImageSlider
          photos={photos}
          name={name}
          badge={badge}
          imageIndex={slideIndex}
          onIndexChange={setSlideIndex}
        />
      </div>
      <div className="px-4 py-4">{cardBody}</div>
    </div>
  );
}
