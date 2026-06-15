"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useMakesModels } from "../../hooks/useMakesModels";

const MAKES = [
  {
    id: 1,
    nameKey: "toyota",
    logo: "/toyota.png",
    background:
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=2071&auto=format&fit=crop",
    descriptionKey: "toyotaDesc",
  },
  {
    id: 2,
    nameKey: "bmw",
    logo: "/BMW.png",
    background:
      "https://images.unsplash.com/photo-1607853554439-0069ec0f29b6?q=80&w=2427&auto=format&fit=crop",
    descriptionKey: "bmwDesc",
  },
  {
    id: 3,
    nameKey: "mercedes",
    logo: "/Mercedes.png",
    background:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
    descriptionKey: "mercedesDesc",
  },
  {
    id: 4,
    nameKey: "audi",
    logo: "https://www.carlogos.org/car-logos/audi-logo-2016.png",
    background:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop",
    descriptionKey: "audiDesc",
  },
  {
    id: 5,
    nameKey: "porsche",
    logo: "/porsche.png",
    background:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop",
    descriptionKey: "porscheDesc",
  },
  {
    id: 6,
    nameKey: "tesla",
    logo: "/tesla.png",
    background:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
    descriptionKey: "teslaDesc",
  },
  {
    id: 7,
    nameKey: "ford",
    logo: "/ford.png",
    background:
      "https://images.unsplash.com/photo-1551830820-330a71b99659?q=80&w=2070&auto=format&fit=crop",
    descriptionKey: "fordDesc",
  },
  {
    id: 8,
    nameKey: "honda",
    logo: "/honda.png",
    background:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop",
    descriptionKey: "hondaDesc",
  },
];

export function BrowseByMake() {
  const { t } = useLanguage();
  const { getMakes, loading } = useMakesModels();
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPinned, setIsPinned] = useState(false);

  // Get popular makes from the JSON data and merge with existing display data
  const getPopularMakes = () => {
    if (loading) return MAKES;
    
    const allMakes = getMakes();
    const popularMakeNames = ['Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Tesla', 'Ford', 'Honda'];
    
    return MAKES.map((makeData, index) => {
      const makeName = popularMakeNames[index];
      if (allMakes.includes(makeName)) {
        return {
          ...makeData,
          actualMake: makeName
        };
      }
      return makeData;
    });
  };

  const displayMakes = getPopularMakes();

  useEffect(() => {
    // Skip effect during SSR
    if (typeof window === "undefined") return;

    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    // Calculate the scroll distance needed for the full horizontal scroll
    const calculateScrollDistance = () => {
      if (!container) return 0;
      return container.scrollWidth - window.innerWidth;
    };

    // Set up the scroll height to accommodate the horizontal scroll
    const setScrollHeight = () => {
      if (!section) return;
      // Add an extra viewport height to ensure we can trigger the first make
      section.style.height = `${window.innerHeight * (displayMakes.length + 0.5)}px`;
    };

    let currentIndex = 0;
    let isScrolling = false;
    let lastScrollTime = 0;

    // Handle scroll event with snapping
    const handleScroll = () => {
      if (!section || !container || isScrolling) return;

      const now = Date.now();
      if (now - lastScrollTime < 200) return; // Debounce rapid scroll events

      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const viewportHeight = window.innerHeight;

      // Start showing content when the section is at the bottom of the viewport
      if (sectionTop <= viewportHeight) {
        setIsPinned(true);

        // If we're just entering the section, show the first make
        if (sectionTop > 0 && currentIndex === 0) {
          container.style.transform = `translateX(0px)`;
          setScrollProgress(0);
          return;
        }

        // Calculate which make should be shown based on scroll position
        // Adjust the calculation to account for the section entering the viewport
        const scrolledIntoSection = viewportHeight - sectionTop;
        const makeIndex = Math.min(
          Math.max(0, Math.floor(scrolledIntoSection / viewportHeight)),
          displayMakes.length - 1
        );

        if (makeIndex !== currentIndex) {
          isScrolling = true;
          currentIndex = makeIndex;

          // Update progress for progress bar
          const progress = currentIndex / (displayMakes.length - 1);
          setScrollProgress(progress);

          // Apply horizontal scroll to show the current make
          const scrollDistance = calculateScrollDistance();
          const targetX = (scrollDistance / (displayMakes.length - 1)) * currentIndex;

          container.style.transform = `translateX(-${targetX}px)`;

          // Prevent additional scrolling for a short period
          setTimeout(() => {
            isScrolling = false;
            lastScrollTime = Date.now();
          }, 500);
        }
      } else {
        setIsPinned(false);
        currentIndex = 0;
      }
    };

    // Initialize
    setScrollHeight();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", setScrollHeight);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", setScrollHeight);
    };
  }, [displayMakes.length]);

  return (
    <section ref={sectionRef} className="relative">
      <div
        className={`sticky top-0 max-w-screen h-screen overflow-hidden ${
          isPinned ? "z-10" : ""
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-20">
          <div
            className="h-full bg-blue-600 transition-all duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Title overlay */}
        <div className="absolute top-8 left-8 z-20">
          <h2 className="text-4xl font-bold text-white dark:text-white drop-shadow-lg transition-colors duration-300">
          Producenci
          </h2>
        </div>

        {/* Horizontal scrollable content */}
        <div
          ref={containerRef}
          className="flex transition-transform duration-300 will-change-transform h-screen"
          style={{
            transform: "translateX(0)",
          }}
        >
          {displayMakes.map((make) => (
            <div
              key={make.id}
              className="relative w-screen h-screen flex-none overflow-hidden"
            >
              {/* Background Image */}
              <Image
                src={make.background}
                alt={t(`homepage.browseByMake.makes.${make.nameKey}`)}
                fill
                className="object-cover"
                priority
              />

              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 p-8 rounded-xl backdrop-blur-sm max-w-2xl mx-4">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative w-24 h-12">
                      <Image
                        src={make.logo}
                        alt={t(`homepage.browseByMake.makes.${make.nameKey}`)}
                        fill
                        className="object-contain"
                        style={{ filter: "brightness(0) invert(1)" }}
                      />
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                      {t(`homepage.browseByMake.makes.${make.nameKey}`)}
                    </h3>
                  </div>
                  <p className="text-white/90 text-lg mb-8">
                    {t(`homepage.browseByMake.makes.${make.descriptionKey}`)}
                  </p>
                  <Link
                    href={`/website/cars?make=${make.actualMake || t(
                      `homepage.browseByMake.makes.${make.nameKey}`
                    )}`}
                    className="inline-block !bg-white !text-black px-6 py-3 rounded-lg font-medium hover:!bg-gray-100 transition-colors"
                  >
                    {t("homepage.browseByMake.viewAll")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
