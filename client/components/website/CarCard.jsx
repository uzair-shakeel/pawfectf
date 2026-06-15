"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useGoogleMaps } from "../../lib/GoogleMapsContext";
import { getPublicUserInfo } from "../../services/userService";
import { optimizeCloudinaryUrl } from "../../lib/imageUtils";
import {
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  MapPin,
  User,
  ShieldCheck,
  Zap
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export default function CarCard({ car, viewMode = 'grid' }) {
  const router = useRouter();
  const { getGeocodingData } = useGoogleMaps();
  const [locationDetails, setLocationDetails] = useState({
    city: "",
    state: "",
  });

  const [seller, setSeller] = useState(null);

  // Translation helper functions
  const translateFuelType = (fuel) => {
    const translations = {
      'Petrol': 'Benzyna',
      'Diesel': 'Diesel',
      'Hybrid': 'Hybryda',
      'Electric': 'Elektryk',
      'LPG': 'LPG',
      'Wodór': 'Wodór'
    };
    return translations[fuel] || fuel;
  };

  const toTitleCase = (text) =>
    text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');


  const translateTransmission = (transmission) => {
    const translations = {
      'Automatic': 'Automat',
      'Manual': 'Manual'
    };
    return translations[transmission] || transmission;
  };

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "/website/seller.jpg";
    let finalUrl;
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
      finalUrl = imagePath;
    } else {
      finalUrl = `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
    }
    return optimizeCloudinaryUrl(finalUrl, 400); // avatar size
  };

  const formatCarImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500";
    let finalUrl;
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
      finalUrl = imagePath;
    } else {
      finalUrl = `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
    }
    return optimizeCloudinaryUrl(finalUrl, 800);
  };

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!car.location?.coordinates) return;

      const [longitude, latitude] = car.location.coordinates;
      const details = await getGeocodingData(latitude, longitude);
      setLocationDetails(details);
    };

    if (car.location?.coordinates) {
      fetchLocationDetails();
    }
  }, [car, getGeocodingData]);

  useEffect(() => {
    let mounted = true;
    const loadSeller = async () => {
      try {
        if (!car?.createdBy) return;
        const info = await getPublicUserInfo(car.createdBy);
        if (mounted) setSeller(info);
      } catch (e) {
        if (mounted)
          setSeller({ firstName: "Unknown", lastName: "Seller", sellerType: car?.financialInfo?.sellerType || "private", image: null });
      }
    };
    loadSeller();
    return () => {
      mounted = false;
    };
  }, [car?.createdBy, car?.financialInfo?.sellerType]);

  const firstImage = car?.images && car?.images?.length > 0 ? formatCarImage(car.images[0]) : "https://via.placeholder.com/500";

  const getSellerName = () => {
    if (!seller) return "Seller";
    const type = seller?.sellerType || car?.financialInfo?.sellerType;
    if (type === "company") return seller?.companyName || `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim() || "Company";
    const full = `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim();
    return full || seller?.companyName || "Sprzedawca prywatny";
  };

  const getSellerType = () => {
    if (!seller) return "Seller";
    const type = seller?.sellerType || car?.financialInfo?.sellerType;
    if (type === "company") return "Firma";
    return "Sprzedawca prywatny";
  };

  const getSellerImage = () => {
    if (!seller?.image) return "/website/seller.jpg";
    return formatImageUrl(seller.image);
  };

  const handleCardClick = () => {
    router.push(`/website/cars/${car._id}`);
  };

  if (viewMode === 'grid') {
    return (
      <div
        className="group cursor-pointer focus:outline-none"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCardClick();
          }
        }}
      >
        <div className="mx-2 bg-transparent rounded-2xl overflow-hidden relative transition-all duration-300">
          {/* Hover overlay shade */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300 z-10 pointer-events-none rounded-2xl" />
          <div className="relative h-[260px] md:h-48 lg:h-[220px] overflow-hidden rounded-2xl">
            {car?.isFeatured && (car?.images?.length ?? 0) >= 3 ? (
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                <div className="relative col-span-2 row-span-1">
                  <Image
                    src={formatCarImage(car.images[0])}
                    alt={`${car.year} ${car.make} ${car.model} - 1`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="relative col-start-1 col-end-2 row-start-2 row-end-3">
                  <Image
                    src={formatCarImage(car.images[1])}
                    alt={`${car.year} ${car.make} ${car.model} - 2`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="relative col-start-2 col-end-3 row-start-2 row-end-3">
                  {(car?.images?.length ?? 0) >= 4 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 h-full">
                      <Image
                        src={formatCarImage(car.images[2])}
                        alt={`${car.year} ${car.make} ${car.model} - 3`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <Image
                        src={formatCarImage(car.images[3])}
                        alt={`${car.year} ${car.make} ${car.model} - 4`}
                        fill
                        className="object-cover hidden md:block"
                        loading="lazy"
                        sizes="25vw"
                      />
                    </div>
                  ) : (
                    <Image
                      src={formatCarImage(car.images[2])}
                      alt={`${car.year} ${car.make} ${car.model} - 3`}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                </div>
              </div>
            ) : (
              <Image
                src={firstImage}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover transition-transform duration-500"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}

            {/* Price overlay */}
            <div className="absolute bottom-3 left-3 bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/10">
              <div className="text-sm font-semibold  text-white">
                {car.financialInfo?.priceNetto
                  ? `${car.financialInfo.priceNetto.toLocaleString('pl-PL')} zł`
                  : 'Cena do negocjacji'}
              </div>
            </div>

            {/* Simple Featured Shade & Logo */}
            {car?.isFeatured && (
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/30 to-transparent pointer-events-none z-20 flex items-start justify-end p-3 rounded-tr-2xl">
                <Image
                  src="/logooo.png"
                  alt="Premium"
                  width={32}
                  height={32}
                  className="object-contain brightness-0 invert opacity-70"
                />
              </div>
            )}



          </div>

          <div className="py-4 px-1 bg-transparent">
            <div className="mb-1">

              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[21px] font-bold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary leading-tight group-hover:text-blue-600 transition-colors">
                  {toTitleCase(`${car.year} ${car.make} ${car.model}`)}
                </h3>
              </div>

            </div>

            <div className="space-y-1.5">
              <p className="text-[15px] text-gray-600 dark:text-dark-text-secondary line-clamp-2 leading-snug">
                {[
                  car.mileage ? `${car.mileage.toLocaleString('pl-PL')} km` : null,
                  translateTransmission(car.transmission),
                  car.engine ? `${car.engine} cm3` : null,
                  translateFuelType(car.fuel)
                ].filter(Boolean).join(', ')}. Stan techniczny i wizualny oceniany jako wzorowy.
              </p>

              <div className="text-[15px] text-gray-600 dark:text-dark-text-secondary line-clamp-2 leading-snug">
                {locationDetails.city || 'POLSKA'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div
      className="group cursor-pointer focus:outline-none"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="mx-2 bg-transparent rounded-2xl overflow-hidden transition-all duration-500 flex flex-row h-[140px] xs:h-[160px] sm:h-[200px] md:h-[260px] relative">
        {/* Hover overlay shade */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 dark:hover:bg-dark-raised/20 transition-all duration-300 z-10 pointer-events-none rounded-2xl" />
        {/* Image Section */}
        <div className="relative w-[120px] xs:w-[150px] sm:w-[200px] md:w-[400px] h-full flex-shrink-0 overflow-hidden rounded-2xl">
          {car?.isFeatured && (car?.images?.length ?? 0) >= 3 ? (
            <div className="flex h-full w-full gap-0.5">
              <div className="relative w-2/3 h-full">
                <Image
                  src={formatCarImage(car.images[0])}
                  alt={`${car.year} ${car.make} ${car.model} - 1`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 30vw, 20vw"
                />
              </div>
              <div className="w-1/3 flex flex-col gap-0.5 h-full">
                <div className="relative h-1/2">
                  <Image
                    src={formatCarImage(car.images[1])}
                    alt={`${car.year} ${car.make} ${car.model} - 2`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 15vw, 10vw"
                  />
                </div>
                <div className="relative h-1/2">
                  <Image
                    src={formatCarImage(car.images[2])}
                    alt={`${car.year} ${car.make} ${car.model} - 3`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 15vw, 10vw"
                  />
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={firstImage}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              className="object-cover transition-transform duration-700"
              loading="lazy"
              sizes="(max-width: 768px) 40vw, 30vw"
            />
          )}

          {/* Gradient Overlay for badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {/* Simple Featured Shade & Logo (List View) */}
          {car?.isFeatured && (
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-bl from-black/50 to-transparent pointer-events-none z-20 flex items-start justify-end p-2 sm:p-4">
              <Image
                src="/logooo.png"
                alt="Premium"
                width={32}
                height={32}
                className="object-contain brightness-0 invert opacity-70"
              />
            </div>
          )}



        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 xs:p-4 md:p-8 flex flex-col justify-center bg-transparent min-w-0">
          <div className="flex flex-col gap-1 md:gap-3">
            <h3 className="text-sm xs:text-base sm:text-lg md:text-3xl font-bold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary group-hover:text-blue-600 transition-colors leading-tight truncate">
              {car.year} {car.make} {car.model}
            </h3>

            <p className="text-[10px] xs:text-xs md:text-[17px] text-gray-600 dark:text-dark-text-secondary line-clamp-2 md:line-clamp-none leading-snug">
              {[
                car.mileage ? `${car.mileage.toLocaleString('pl-PL')} km` : null,
                translateTransmission(car.transmission),
                car.engine ? `${car.engine} cm3` : null,
                translateFuelType(car.fuel)
              ].filter(Boolean).join(', ')}. Stan techniczny i wizualny oceniany jako wzorowy.
            </p>

            <div className="flex flex-row justify-between items-center mt-1 md:mt-4">
              <div className="text-[10px] md:text-[16px] text-gray-400 dark:text-dark-text-muted font-bold uppercase tracking-tight">
                {locationDetails.city || 'POLSKA'}
              </div>

              <div className="text-sm xs:text-base sm:text-xl md:text-4xl font-black text-gray-900 dark:text-gray-200 dark:text-dark-text-primary tracking-tighter">
                {car.financialInfo?.priceNetto
                  ? `${car.financialInfo.priceNetto.toLocaleString('pl-PL')} zł`
                  : 'Cena do negocjacji'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
