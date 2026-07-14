"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CarCard from "./CarCard";
import { getFeaturedPets } from "../../services/petService";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function FeaturedCars() {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFeaturedPets();
        console.log("Fetched featured cars:", data);
        if (Array.isArray(data)) {
          setCars(data);
        } else if (data?.cars && Array.isArray(data.cars)) {
          setCars(data.cars);
        } else {
          throw new Error("Fetched data is not an array");
        }
      } catch (error) {
        console.error("Error fetching featured cars:", error);
        setError(error.message || "Failed to fetch featured cars");
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  if (!loading && (error || cars.length === 0)) {
    return null;
  }

  return (
    <section className="py-12 bg-white dark:bg-dark-main transition-colors duration-300">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary transition-colors duration-300 tracking-tight">
            Wyróżnione Oferty
          </h2>
          <button className="px-6 py-2.5 bg-white dark:bg-dark-raised border border-gray-200 dark:border-dark-divider rounded-full text-md font-bold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-elevation-1 hover:shadow-md transition-all duration-300 flex items-center gap-2">
            Więcej <span className="text-lg">→</span>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {cars.length > 0 && (
          <div className="relative">
            <Swiper
              modules={[Navigation, A11y]}
              navigation={{
                prevEl: ".featured-cars-swiper-prev",
                nextEl: ".featured-cars-swiper-next",
              }}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 16 },
                768: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
                1280: { slidesPerView: 3, spaceBetween: 24 },
              }}
              grabCursor={true}
              touchRatio={1}
              touchAngle={45}
              threshold={10}
              allowTouchMove={true}
              simulateTouch={true}
              className="py-4"
            >
              {cars.map((car) => (
                <SwiperSlide key={car._id}>
                  <CarCard car={car} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation buttons */}
            <button className="featured-cars-swiper-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-dark-card backdrop-blur-sm shadow-xl rounded-full p-4 hover:scale-110 active:scale-95 transition-all duration-300 -ml-5 border border-white/20 dark:border-dark-divider text-gray-800 dark:text-dark-text-primary group">
              <FaChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button className="featured-cars-swiper-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-dark-card backdrop-blur-sm shadow-xl rounded-full p-4 hover:scale-110 active:scale-95 transition-all duration-300 -mr-5 border border-white/20 dark:border-dark-divider text-gray-800 dark:text-dark-text-primary group">
              <FaChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
