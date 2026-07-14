"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import CarCard from "./CarCard";
import { getAllPets } from "../../services/petService";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function CarsNearMe() {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("grid");

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPets();
        console.log("Fetched cars:", data);
        // Ensure data is an array
        if (Array.isArray(data)) {
          setCars(data);
        } else if (data?.cars && Array.isArray(data.cars)) {
          setCars(data.cars); // Handle case where backend returns { cars: [...] }
        } else {
          throw new Error("Fetched data is not an array");
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
        setError(error.message || "Failed to fetch cars");
        setCars([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []); // No dependencies since we don't need getToken

  return (
    <section className="py-12 bg-gray-50 dark:bg-dark-main transition-colors duration-300">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary transition-colors duration-300 tracking-tight">
            Ostatnio Dodane
          </h2>
          <div className="flex items-center gap-3">
            {/* Compact Chevron Navigation */}
            <div className="flex gap-2">
              <button
                className="cars-swiper-prev h-8 w-8 md:h-9 md:w-9 rounded-full bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-white dark:hover:bg-dark-card text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                aria-label="Previous"
              >
                <IoIosArrowBack className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                className="cars-swiper-next h-8 w-8 md:h-9 md:w-9 rounded-full bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-white dark:hover:bg-dark-card text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                aria-label="Next"
              >
                <IoIosArrowForward className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <button className="hidden sm:flex px-6 py-2.5 bg-white dark:bg-dark-raised border border-gray-200 dark:border-dark-divider rounded-full text-md font-bold text-gray-900 dark:text-gray-200 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-elevation-1 hover:shadow-md transition-all duration-300 items-center gap-2">
              Więcej <span className="text-lg">→</span>
            </button>
          </div>
        </div>
        {loading && (
          <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
            {t("homepage.carsNearMe.loading")}
          </p>
        )}
        {error && (
          <p className="text-red-500 dark:text-red-400 transition-colors duration-300">
            {error}
          </p>
        )}
        {!loading && !error && cars.length === 0 && (
          <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
            {t("homepage.carsNearMe.noCars")}
          </p>
        )}
        {/* Swiper container */}
        {cars.length > 0 && (
          <div className="relative">
            <Swiper
              modules={[Navigation, A11y]}
              navigation={{
                prevEl: ".cars-swiper-prev",
                nextEl: ".cars-swiper-next",
              }}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                  spaceBetween: 16,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1280: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
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
                  <CarCard viewMode="grid" car={car} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}
