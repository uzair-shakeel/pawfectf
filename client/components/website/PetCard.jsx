"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { getPublicUserInfo } from "../../services/userService";
import { optimizeCloudinaryUrl } from "../../lib/imageUtils";
import { usePetImageTransition } from "../../lib/petImageTransition/PetImageTransitionContext";
import { MapPin, ShieldCheck } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const formatAge = (ageMonths) => {
  if (!ageMonths && ageMonths !== 0) return null;
  if (ageMonths <= 6) return "Szczeniak";
  if (ageMonths <= 24) return "Młody";
  if (ageMonths <= 84) return "Dorosły";
  return "Starszy";
};

export default function PetCard({ pet, viewMode = "grid" }) {
  const router = useRouter();
  const { startTransition } = usePetImageTransition();
  const imageWrapRef = useRef(null);
  const [locationDetails, setLocationDetails] = useState({ city: "", state: "" });
  const [owner, setOwner] = useState(null);

  const href = pet?.href || `/website/pets/${pet._id}`;

  const formatPetImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500";
    const url = /^(https?:)?\/\//.test(imagePath)
      ? imagePath
      : `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
    return optimizeCloudinaryUrl(url, 800);
  };

  useEffect(() => {
    if (pet?.location?.city) {
      setLocationDetails({ city: pet.location.city, state: pet.location.state || "" });
    }
  }, [pet]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!pet?.createdBy) return;
        const info = await getPublicUserInfo(pet.createdBy);
        if (mounted) setOwner(info);
      } catch {
        if (mounted) setOwner({ firstName: "Shelter", sellerType: "private", image: null });
      }
    };
    load();
    return () => { mounted = false; };
  }, [pet?.createdBy]);

  const firstImage = pet?.images?.length > 0
    ? formatPetImage(pet.images[0])
    : "https://via.placeholder.com/500";

  const displayName = pet?.name || `${pet?.breed || pet?.species || "Pet"}`;

  const translateGender = (gender) => {
    if (gender === "Male") return "Samiec";
    if (gender === "Female") return "Suczka";
    return gender;
  };

  const translateSize = (size) => {
    if (size === "Small") return "Mały";
    if (size === "Medium") return "Średni";
    if (size === "Large") return "Duży";
    if (size === "Extra Large") return "Bardzo duży";
    return size;
  };

  const subtitle = [
    pet?.name,
    pet?.breed,
    formatAge(pet?.ageMonths),
    translateGender(pet?.gender),
    translateSize(pet?.size),
  ].filter(Boolean).join(" · ");

  const handleNavigate = useCallback(
    (event) => {
      if (event?.defaultPrevented) return;
      if (event && "button" in event && event.button !== 0) return;
      if (event?.metaKey || event?.ctrlKey || event?.shiftKey || event?.altKey) return;

      const started = startTransition({
        petId: pet._id,
        href,
        imageSrc: firstImage,
        sourceEl: imageWrapRef.current,
        clientX: event?.clientX,
        clientY: event?.clientY,
      });

      if (started && event?.preventDefault) event.preventDefault();
      router.push(href);
    },
    [firstImage, href, pet?._id, router, startTransition]
  );

  if (viewMode === "grid") {
    return (
      <div
        className="group cursor-pointer focus:outline-none"
        onClick={handleNavigate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleNavigate(e); }}
      >
        <div className="mx-2 bg-transparent rounded-2xl overflow-hidden relative transition-all duration-300">
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300 z-10 pointer-events-none rounded-2xl" />
          <div
            ref={imageWrapRef}
            className="relative h-[280px] md:h-52 lg:h-[240px] overflow-hidden rounded-2xl [&_[data-pet-morph-source]]:opacity-0"
          >
            {pet?.isFeatured && (pet?.images?.length ?? 0) >= 3 ? (
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                <div data-pet-tile data-pet-tile-index="0" className="relative col-span-2 row-span-1">
                  <Image src={formatPetImage(pet.images[0])} alt={`${displayName} - 1`} fill className="object-cover" loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
                <div data-pet-tile data-pet-tile-index="1" className="relative col-start-1 col-end-2 row-start-2 row-end-3">
                  <Image src={formatPetImage(pet.images[1])} alt={`${displayName} - 2`} fill className="object-cover" loading="lazy" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <div data-pet-tile data-pet-tile-index="2" className="relative col-start-2 col-end-3 row-start-2 row-end-3">
                  <Image src={formatPetImage(pet.images[2])} alt={`${displayName} - 3`} fill className="object-cover" loading="lazy" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
              </div>
            ) : (
              <div data-pet-tile data-pet-tile-index="0" className="absolute inset-0">
                <Image src={firstImage} alt={displayName} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-4 px-3.5 pointer-events-none">
              <h3 className="text-[19px] sm:text-[20px] font-semibold text-white leading-snug drop-shadow-md">
                {subtitle}
              </h3>
              <div className="mt-1.5 flex items-center gap-1 text-[13px] text-white/80">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{locationDetails.city || "Lokalizacja nieokreślona"}</span>
              </div>
            </div>

            {pet?.isFeatured && (
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/30 to-transparent pointer-events-none z-20 flex items-start justify-end p-3 rounded-tr-2xl">
                <Image src="/logooo.png" alt="Featured" width={32} height={32} className="object-contain brightness-0 invert opacity-70" />
              </div>
            )}

            {pet?.healthStatus?.length > 0 && (
              <div className="absolute top-3 left-3 z-20 flex gap-1 flex-wrap max-w-[60%]">
                {pet.healthStatus.slice(0, 2).map((s) => (
                  <span key={s} className="text-[10px] font-bold bg-green-500/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer focus:outline-none"
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleNavigate(e); } }}
    >
      <div className="mx-2 bg-transparent rounded-2xl overflow-hidden transition-all duration-500 flex flex-row h-[140px] xs:h-[160px] sm:h-[200px] md:h-[260px] relative">
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 dark:hover:bg-dark-raised/20 transition-all duration-300 z-10 pointer-events-none rounded-2xl" />
        <div
          ref={imageWrapRef}
          className="relative w-[120px] xs:w-[150px] sm:w-[200px] md:w-[400px] h-full flex-shrink-0 overflow-hidden rounded-2xl [&_[data-pet-morph-source]]:opacity-0"
        >
          <div data-pet-tile data-pet-tile-index="0" className="absolute inset-0">
            <Image src={firstImage} alt={displayName} fill className="object-cover transition-transform duration-700" loading="lazy" sizes="(max-width: 768px) 40vw, 30vw" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          {pet?.isFeatured && (
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-bl from-black/50 to-transparent pointer-events-none z-20 flex items-start justify-end p-2 sm:p-4">
              <Image src="/logooo.png" alt="Featured" width={32} height={32} className="object-contain brightness-0 invert opacity-70" />
            </div>
          )}
        </div>

        <div className="flex-1 p-3 xs:p-4 md:p-8 flex flex-col justify-center bg-transparent min-w-0">
          <div className="flex flex-col gap-1 md:gap-3">
            <h3 className="text-md xs:text-base sm:text-lg md:text-3xl font-bold text-gray-900 dark:text-gray-200 group-hover:text-blue-600 transition-colors leading-tight truncate">
              {displayName}
            </h3>
            <p className="text-[10px] xs:text-sm md:text-[17px] text-gray-600 dark:text-dark-text-secondary line-clamp-2 leading-snug">
              {subtitle || "Looking for a loving home"}
              {pet?.healthStatus?.length > 0 && ` · ${pet.healthStatus.slice(0, 2).join(", ")}`}
            </p>
            <div className="flex flex-row justify-between items-center mt-1 md:mt-4">
              <div className="text-[10px] md:text-[16px] text-gray-400 dark:text-dark-text-muted font-bold uppercase tracking-tight flex items-center gap-1">
                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                {locationDetails.city || "Location TBD"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
