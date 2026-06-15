"use client";

import Link from "next/link";
import { useRef, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, LogIn, MousePointerClick } from "lucide-react";

// Premium Countries of Origin browser
export function BrowseCategories() {
  const scrollerRef = useRef(null);
  const [index, setIndex] = useState(0);

  // Curated list of major car-producing countries
  const countries = useMemo(
    () => [
      {
        id: "de",
        name: "Niemcy",
        flag: "https://flagcdn.com/w80/de.png",
        bg: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "germany" },
        tagline: "Engineering Excellence",
      },
      {
        id: "jp",
        name: "Japonia",
        flag: "https://flagcdn.com/w80/jp.png",
        bg: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "japan" },
        tagline: "Reliability First",
      },
      {
        id: "us",
        name: "USA",
        flag: "https://flagcdn.com/w80/us.png",
        bg: "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517940310602-18534a36f706?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "united-states" },
        tagline: "Power & Presence",
      },
      {
        id: "gb",
        name: "Wielka Brytania",
        flag: "https://flagcdn.com/w80/gb.png",
        bg: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517940310602-18534a36f706?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "united-kingdom" },
        tagline: "Luxury Heritage",
      },
      {
        id: "it",
        name: "Włochy",
        flag: "https://flagcdn.com/w80/it.png",
        bg: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "italy" },
        tagline: "Design & Passion",
      },
      {
        id: "fr",
        name: "Francja",
        flag: "https://flagcdn.com/w80/fr.png",
        bg: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "france" },
        tagline: "Comfort Refined",
      },
      {
        id: "kr",
        name: "Korea Południowa",
        flag: "https://flagcdn.com/w80/kr.png",
        bg: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1605559424843-9e4c3efc2c65?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "south-korea" },
        tagline: "Tech-forward Value",
      },
      {
        id: "se",
        name: "Szwecja",
        flag: "https://flagcdn.com/w80/se.png",
        bg: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "sweden" },
        tagline: "Safety & Minimalism",
      },
      {
        id: "cn",
        name: "Chiny",
        flag: "https://flagcdn.com/w80/cn.png",
        bg: "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "china" },
        tagline: "New Energy Leaders",
      },
      {
        id: "pl",
        name: "Polska",
        flag: "https://flagcdn.com/w80/pl.png",
        bg: "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1600&auto=format&fit=crop",
        carImgs: [
          "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop",
        ],
        query: { origin: "poland" },
        tagline: "Central Europe Picks",
      },
    ],
    []
  );

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const viewport = el.clientWidth || 320;
    const delta = (dir === "left" ? -1 : 1) * Math.round(viewport * 0.9);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="py-14 bg-white dark:bg-dark-card transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-200 dark:text-white">
              Przeglądaj auta po krajach Producentów
            </h2>
            <p className="text-dark-text-secondary mt-1">
              Odkryj samochody według dziedzictwa i kultury.
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              aria-label="Scroll left"
              onClick={() => scroll("left")}
              className="h-10 w-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => scroll("right")}
              className="h-10 w-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal snap on mobile, elegant grid on desktop */}
        <div className="md:hidden relative">
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
          >
            {countries.map((c) => (
              <CountryCard key={c.id} country={c} className="snap-start min-w-[85%]" />
            ))}
          </div>
          {/* Mobile chevrons overlay */}
          {/* <button
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white/70 dark:bg-dark-card/60 backdrop-blur text-gray-700 dark:text-gray-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white/70 dark:bg-dark-card/60 backdrop-blur text-gray-700 dark:text-gray-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button> */}
        </div>

        <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-5">
          {countries.map((c, i) => (
            <CountryCard
              key={c.id}
              country={c}
              className={`${i % 5 === 0 ? "col-span-2 row-span-2" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CountryCard({ country, className = "" }) {
  const { id, name, flag, bg, carImgs = [], query, tagline } = country;
  const sources = (Array.isArray(carImgs) ? carImgs : []).concat(bg ? [bg] : []);
  const [imgIdx, setImgIdx] = useState(0);
  const hero = sources[imgIdx] || bg;
  return (
    <Link
      href={{ pathname: "/website/cars", query }}
      className={`relative  group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="aspect-[16/10] w-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        {/* Background image (optional). If missing, gradient remains */}
        <img
          src={hero}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Try next source, otherwise hide image element
            const next = imgIdx + 1;
            if (next < sources.length) {
              setImgIdx(next);
            } else {
              e.currentTarget.style.display = "none";
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        {/* Top-left flag chip */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-dark-card backdrop-blur text-sm shadow">
          <img src={flag} alt="" width={18} height={12} className="rounded-sm" />
          <span className="font-medium text-gray-800">{name}</span>
        </div>

        {/* Title + tagline + CTA */}
        <div className="absolute bottom-0  right-0 p-4">
          {/* <div className="text-white">
            <div className="text-xl md:text-2xl font-bold drop-shadow-sm">{name}</div>
            {tagline && <div className="text-sm opacity-90">{tagline}</div>}
          </div> */}

          <div className="mt-3 hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 text-gray-900 dark:text-gray-200 font-medium shadow translate-x-[200px] group-hover:translate-x-[-12px] transition-transform">
            <span className="hidden ">Explore</span>
            <MousePointerClick className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
