"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../../lib/i18n/LanguageContext";

const CATEGORIES = [
  {
    id: 1,
    titleKey: "Luksusowe",
    image: "/luxury.jpg",
    descriptionKey: "Doświadcz najwyższego komfortu i stylu",
  },
  {
    id: 2,
    titleKey: "Sportowe",
    image: "/sports.jpg",
    descriptionKey: "Poczuj dreszcz emocji",
  },
  {
    id: 3,
    titleKey: "Kompakty",
    image: "/classic.jpg",
    descriptionKey: "Ponadczasowa elegancja na kołach",
  },
];

const LOGOS = [
  { src: "/BMW.png", alt: "BMW" },
  { src: "/Mercedes.png", alt: "Mercedes" },
  { src: "/porsche.webp", alt: "Porsche" },
  { src: "/tesla.png", alt: "Tesla" },
  { src: "/ford.png", alt: "Ford" },
  { src: "/honda.png", alt: "Honda" },
  { src: "/toyota.png", alt: "Toyota" },
  { src: "/lexus.png", alt: "Lexus" },
  { src: "/acura.png", alt: "Acura" },
  { src: "/chevrolet.png", alt: "Chevrolet" },
];

export function FeaturedCategories() {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const textElement = textRef.current?.querySelector(".scroll-text");
    if (textElement) {
      gsap.to(textElement, {
        x: "-50%",
        duration: 30,
        ease: "none",
        repeat: -1,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section className="py-16 bg-black" ref={containerRef}>
      {/* Featured Categories Grid */}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
        Kategorie
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/website/cars`}
              className="group relative aspect-[4/3] overflow-hidden"
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={t(
                  `homepage.featuredCategories.categories.${category.titleKey}`
                )}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 transition-opacity duration-700 group-hover:opacity-60" />

              {/* Border Frame */}
              <div className="absolute inset-4 border-2 border-white/50 transition-all duration-700 group-hover:inset-6" />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                <div className="transform translate-y-8 transition-transform duration-700 group-hover:translate-y-0">
                  <h3 className="text-2xl font-bold mb-2">
                    {category.titleKey}
                  </h3>
                  <p className="text-white/80 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                    {category.descriptionKey}
                  </p>
                </div>

                <div className="transform translate-y-8 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="inline-block border-b-2 border-white pb-1">
                    {t("homepage.featuredCategories.exploreMore")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
