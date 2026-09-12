"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { getAllLostFound } from "../../../services/lostFoundService";
import HomePetCard from "../../../components/website/HomePetCard";
import MarketingHero from "../../../components/website/MarketingHero";
import CustomSelect from "../../../components/website/CustomSelect";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const speciesLabel = (species) => {
  if (species === "Dog" || species === "Pies") return "Pies";
  if (species === "Cat" || species === "Kot") return "Kot";
  return species;
};

export default function LostFoundPage() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await getAllLostFound();
        setEntries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load lost and found entries", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    if (filter !== "All" && entry.type !== filter) return false;
    if (speciesFilter !== "All" && entry.species !== speciesFilter) return false;
    if (locationFilter && !entry.location?.city?.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    return true;
  });

  const uniqueSpecies = ["All", ...new Set(entries.map((entry) => entry.species).filter(Boolean))];
  const typeTabs = [
    { value: "All", label: t("lostFoundPage.all", "Wszystkie") },
    { value: "Lost", label: t("lostFoundPage.lost", "Zaginione") },
    { value: "Found", label: t("lostFoundPage.found", "Znalezione") },
  ];

  const pillClass = (active) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "bg-[#2563EB] text-white"
        : "bg-white text-[#64748B] hover:bg-[#EEF2FF] dark:bg-dark-card dark:text-dark-text-secondary dark:hover:bg-dark-raised"
    }`;

  return (
    <div className="marketing-ui min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <MarketingHero
        image="/home/lost-found.jpg"
        imageAlt={t("homepage.lostFound.imageAlt", "Pies biegnący do swojego właściciela")}
        eyebrow={t("lostFoundPage.eyebrow", "Zaginione i znalezione")}
        title={t("homepage.lostFound.heading", "Gdy zwierzak ginie, liczy się każda godzina")}
        subtitle={t("homepage.lostFound.subtitle")}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/lost-found/new"
            className="inline-flex items-center justify-center gap-2 !bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] !text-[#0F172A]"
          >
            {t("homepage.lostFound.reportBtn", "Zgłoś zwierzaka")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </MarketingHero>

      <div className="mx-auto w-full max-w-[1520px] px-4 py-10 sm:px-8 md:py-14">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {typeTabs.map((tab) => (
              <button key={tab.value} type="button" onClick={() => setFilter(tab.value)} className={pillClass(filter === tab.value)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="w-full sm:w-56">
              <CustomSelect
                variant="filter"
                tone="light"
                value={speciesFilter}
                onChange={setSpeciesFilter}
                ariaLabel={t("dashboard.lostFound.allSpecies", "Wszystkie gatunki")}
                options={uniqueSpecies.map((species) => ({
                  value: species,
                  label: species === "All" ? t("dashboard.lostFound.allSpecies", "Wszystkie gatunki") : speciesLabel(species),
                }))}
              />
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder={t("dashboard.lostFound.searchCity", "Szukaj miasta...")}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-[15px] font-medium text-[#0F172A] outline-none placeholder:font-medium placeholder:text-[#94A3B8] focus:border-[#2563EB] dark:border-dark-divider dark:bg-[#303030] dark:text-[#E2E7E3]"
              />
            </div>
          </div>
        </div>

        {!loading && (
          <p className="mb-5 text-sm font-semibold text-[#64748B]">
            {filteredEntries.length} {t("lostFoundPage.results", "ogłoszeń")}
          </p>
        )}

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
        ) : filteredEntries.length === 0 ? (
          <div className="border border-[#E2E8F0] bg-white px-6 py-16 text-center dark:border-dark-divider dark:bg-dark-card">
            <h3 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
              {t("lostFoundPage.noEntries", "Nie znaleziono ogłoszeń")}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-[#64748B] dark:text-gray-400">
              {t("lostFoundPage.noEntriesDesc", "Obecnie nie ma raportów w tym widoku.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-[#E2E8F0] dark:bg-dark-divider md:grid-cols-2 xl:grid-cols-4">
            {filteredEntries.map((entry) => (
              <HomePetCard
                key={entry._id}
                pet={{
                  _id: entry._id,
                  name: entry.title,
                  species: entry.species,
                  gender: entry.gender,
                  images: entry.images,
                  description: entry.location?.city,
                  href: `/website/lost-found/${entry._id}`,
                  customLabel: entry.type === "Lost" ? t("lostFoundPage.lost", "Zaginione") : t("lostFoundPage.found", "Znalezione"),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
