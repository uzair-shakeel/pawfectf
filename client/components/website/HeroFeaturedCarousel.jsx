"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaChevronLeft, FaChevronRight, FaTags } from "react-icons/fa";
import { getFeaturedPets, getAllPets } from "../../services/petService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const ensureFiveImages = (images = []) => {
  const safe = Array.isArray(images) ? images : [];
  const out = [...safe];
  const filler = "/placeholder.svg";
  while (out.length < 5) out.push(out[0] || filler);
  return out.slice(0, 5);
};

const formatCarImage = (imagePath) => {
  if (!imagePath) return "/placeholder.svg";
  if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
    return imagePath;
  }
  // Normalize backslashes from server paths
  const normalized = String(imagePath).replace("\\", "/");
  const base = API_BASE || "";
  return base ? `${base}/${normalized}` : `/${normalized}`;
};

export default function HeroFeaturedCarousel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Try dedicated featured endpoint
        const data = await getFeaturedPets();
        let list = Array.isArray(data) ? data : data?.cars || [];

        // If empty, fallback to fetching all and filtering client-side
        if (!list || list.length === 0) {
          const all = await getAllPets();
          const arr = Array.isArray(all) ? all : all?.cars || [];
          const featured = arr.filter((c) => [true, "true", 1, "1", "yes", "on", "YES", "True"].includes(c?.isFeatured));
          list = featured.length > 0 ? featured : arr;
        }

        const firstFive = (list || []).filter(Boolean).slice(0, 5);
        if (!mounted) return;
        setItems(firstFive);
      } catch (e) {
        try {
          // As a last resort, try all cars even if featured fetch failed
          const all = await getAllPets();
          const arr = Array.isArray(all) ? all : all?.cars || [];
          const featured = arr.filter((c) => [true, "true", 1, "1", "yes", "on", "YES", "True"].includes(c?.isFeatured));
          const firstFive = (featured.length > 0 ? featured : arr).slice(0, 5);
          if (mounted) {
            setItems(firstFive);
            setError(null);
          }
        } catch (e2) {
          if (!mounted) return;
          setError(e2?.message || e?.message || "Failed to load featured cars");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const slides = useMemo(
    () =>
      items.map((car) => ({
        id: car._id,
        title: car.title,
        images: ensureFiveImages(car.images).map((p) => formatCarImage(p)),
        price: car?.financialInfo?.priceNetto,
      })),
    [items]
  );

  if (loading) {
    return (
      <section className="relative max-w-screen-2xl mx-auto w-[98%] my-3 rounded-2xl overflow-hidden">
        <div className="h-[200px] sm:h-[260px] md:h-[320px] bg-gray-100 animate-pulse rounded-2xl" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative max-w-screen-2xl mx-auto w-[98%] my-3">
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
          Failed to load featured cars: {error}
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative max-w-screen-2xl mx-auto w-[98%] my-3">
        <div className="p-4 rounded-xl bg-gray-50 text-gray-700 border border-gray-200">
          No featured cars available yet.
        </div>
      </section>
    );
  }

  return (
    <section className="relative  max-w-screen-2xl mx-auto w-[98%] rounded-2xl overflow-hidden">
      <div className="relative">
        <Swiper
          modules={[Navigation, Autoplay, A11y]}
          autoplay={{ delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          loop={slides.length > 1}
          navigation={{ prevEl: ".hero-featured-prev", nextEl: ".hero-featured-next" }}
          slidesPerView={1}
          className="h-[240px] sm:h-[320px] md:h-[380px] lg:h-[420px]"
        >
          {slides.map((s) => (
            <SwiperSlide key={s.id} className="relative">
              <Link href={`/website/cars/${s.id}`} className="block h-full w-full">
                <div className="grid grid-cols-5 gap-2 h-full bg-black/5">
                  {/* Big image left (col-span-3) */}
                  <div className="relative col-span-3 h-full">
                    <Image
                      src={s.images[0] || "/placeholder.svg"}
                      alt={s.title || "Featured car"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                    {/* Featured badge */}
                    <div className="absolute top-2 right-2">
                      <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                        <FaTags className="w-3 h-3" /> PROMOWANY
                      </div>
                    </div>

                    {/* Bottom left price (if available) */}
                    {typeof s.price === "number" && (
                      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-xs font-bold text-gray-900 dark:text-gray-200">
                          {new Intl.NumberFormat("pl-PL").format(s.price)} zł
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Four thumbnails on the right (2x2 on desktop, 1x2 on mobile) */}
                  <div className="grid col-span-2 grid-cols-1 md:grid-cols-2 grid-rows-2 gap-1 md:gap-2">
                    {s.images.slice(1, 5).map((img, i) => (
                      <div key={i} className={`relative ${i >= 2 ? "hidden md:block" : ""}`}>
                        <Image
                          src={img || "/placeholder.svg"}
                          alt={`Thumb ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 40vw, 20vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Nav arrows */}
        <button className="hero-featured-prev absolute right-12 bottom-3 z-10 bg-white/90 hover:bg-white text-gray-700 shadow rounded-full p-2">
          <FaChevronLeft />
        </button>
        <button className="hero-featured-next absolute right-3 bottom-3 z-10 bg-white/90 hover:bg-white text-gray-700 shadow rounded-full p-2">
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}
