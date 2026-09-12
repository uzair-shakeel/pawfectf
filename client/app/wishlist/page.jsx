"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, X } from "lucide-react";
import Navbar from "../../components/website/Navbar";
import { Footer } from "../../components/website/Footer";
import HomePetCard from "../../components/website/HomePetCard";
import MarketingHero from "../../components/website/MarketingHero";
import { getAllPets } from "../../services/petService";
import { getWishlist, passPet } from "../../services/userService";
import { useAuth } from "../../lib/auth/AuthContext";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function WishlistPage() {
  const { t } = useLanguage();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        if (isSignedIn) {
          const dbWishlist = await getWishlist(getToken);
          setWishlist(dbWishlist);
          const likedIds = dbWishlist.map((pet) => pet._id);
          localStorage.setItem("rafraf_liked_pets", JSON.stringify(likedIds));
        } else {
          const likedIds = JSON.parse(localStorage.getItem("rafraf_liked_pets") || "[]");
          if (likedIds.length === 0) {
            setWishlist([]);
            return;
          }
          const allPets = await getAllPets();
          setWishlist(allPets.filter((pet) => likedIds.includes(pet._id)));
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isSignedIn]);

  const removeFromWishlist = async (petId) => {
    const likedIds = JSON.parse(localStorage.getItem("rafraf_liked_pets") || "[]");
    localStorage.setItem("rafraf_liked_pets", JSON.stringify(likedIds.filter((id) => id !== petId)));

    if (isSignedIn) {
      try {
        await passPet(petId, getToken);
      } catch (err) {
        console.error("Failed to remove from DB wishlist:", err);
      }
    }

    setWishlist((prev) => prev.filter((pet) => pet._id !== petId));
  };

  return (
    <div className="marketing-ui flex min-h-screen flex-col bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <Navbar />

      <main className="flex-grow">
        <MarketingHero
          image="/home/pets-banner.jpg"
          imageAlt={t("wishlist.title", "Twoja lista życzeń")}
          compact
          eyebrow={t("wishlist.eyebrow", "Zapisane")}
          title={t("wishlist.title", "Twoja lista życzeń")}
          subtitle={t("wishlist.count", "{n} zapisanych").replace("{n}", String(wishlist.length))}
        />

        <div className="mx-auto w-full max-w-[1520px] px-4 py-10 sm:px-8 md:py-14">
          {loading ? (
            <div className="grid grid-cols-1 gap-px bg-[#E2E8F0] dark:bg-dark-divider md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-dark-card">
                  <div className="h-72 bg-[#EEF2FF] dark:bg-dark-raised" />
                  <div className="space-y-2 px-4 py-4">
                    <div className="h-6 w-2/3 bg-[#EEF2FF] dark:bg-dark-raised" />
                    <div className="h-4 w-1/2 bg-[#EEF2FF] dark:bg-dark-raised" />
                  </div>
                </div>
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            <div className="border border-[#E2E8F0] bg-white px-6 py-20 text-center dark:border-dark-divider dark:bg-dark-card">
              <Heart className="mx-auto h-10 w-10 text-[#2563EB]" />
              <h2 className="font-display mt-6 text-3xl font-bold text-[#0F172A] dark:text-white">
                {t("wishlist.emptyTitle", "Lista jest pusta")}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-[#64748B] dark:text-gray-400">
                {t("wishlist.emptyText")}
              </p>
              <Link
                href="/website/pets"
                className="mt-8 inline-flex items-center justify-center gap-2 bg-[#2563EB] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-[#1D4ED8]"
              >
                {t("wishlist.browse", "Przeglądaj zwierzaki")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-px bg-[#E2E8F0] dark:bg-dark-divider md:grid-cols-2 xl:grid-cols-4">
              {wishlist.map((pet) => (
                <div key={pet._id} className="group relative bg-white dark:bg-dark-card">
                  <HomePetCard pet={pet} />
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(pet._id)}
                    aria-label={t("wishlist.remove", "Usuń z zapisanych")}
                    className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center bg-[#0F172A]/70 text-white transition hover:bg-red-500 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {wishlist.length > 0 && (
          <section className="bg-[#0F172A] text-white">
            <div className="mx-auto flex max-w-[1520px] flex-col items-start justify-between gap-6 px-4 py-14 sm:px-8 md:flex-row md:items-center md:py-16">
              <div>
                <h2 className="font-display text-[2rem] font-bold md:text-[2.6rem]">{t("wishlist.ctaTitle", "Szukasz dalej?")}</h2>
                <p className="mt-2 max-w-xl text-white/70">{t("wishlist.ctaText")}</p>
              </div>
              <Link
                href="/website/pets"
                className="inline-flex items-center justify-center gap-2 !bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] !text-[#0F172A]"
              >
                {t("wishlist.ctaBtn", "Zobacz ogłoszenia")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
