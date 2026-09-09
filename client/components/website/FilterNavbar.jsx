"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSpeciesBreeds } from "../../hooks/useSpeciesBreeds";
import { createPortal } from "react-dom";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import CustomSelect from "./CustomSelect";
import LocationSearch from "./LocationSearch";
import { X } from "lucide-react";

const EMPTY = {
  location: "", distance: "", species: "", breed: "", size: "",
  ageGroup: "", gender: "", color: "", coatLength: "", healthStatus: "",
  adoptionStatus: "", feeFrom: "", feeTo: "",
};

export default function FilterNavbar({ onApplyFilters, variant = "default" }) {
  const { t } = useLanguage();
  const { getSpecies, getBreedsForSpecies, loading } = useSpeciesBreeds();
  const [filters, setFilters] = useState(EMPTY);
  const searchParams = useSearchParams();
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [sheetClosing, setSheetClosing] = useState(false);
  const sheetTimer = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const filterRef = useRef(null);
  const isHero = variant === "hero";
  const tone = isHero ? "dark" : "light";

  useEffect(() => { setIsMounted(true); return () => clearTimeout(sheetTimer.current); }, []);

  const openSheet = () => {
    clearTimeout(sheetTimer.current);
    setSheetClosing(false);
    setShowMoreFilters(true);
  };

  const closeSheet = () => {
    if (!showMoreFilters || sheetClosing) return;
    setSheetClosing(true);
    sheetTimer.current = setTimeout(() => {
      setShowMoreFilters(false);
      setSheetClosing(false);
    }, 320);
  };

  useEffect(() => {
    if (!searchParams) return;
    const g = (k) => searchParams.get(k) || "";
    const next = {
      location: g("location"), distance: g("maxDistance"),
      species: g("species"), breed: g("breed"), size: g("size"),
      ageGroup: g("ageGroup"), gender: g("gender"), color: g("color"),
      coatLength: g("coatLength"), healthStatus: g("healthStatus"),
      adoptionStatus: g("adoptionStatus"), feeFrom: g("feeFrom"), feeTo: g("feeTo"),
    };
    setFilters(prev => JSON.stringify(prev) !== JSON.stringify(next) ? { ...prev, ...next } : prev);
  }, [searchParams]);

  const setFilter = (name, value) => {
    const updated = { ...filters, [name]: value };
    if (name === "species") updated.breed = "";
    setFilters(updated);
    onApplyFilters(updated);
  };

  const handleReset = () => { setFilters(EMPTY); onApplyFilters(EMPTY); };

  useEffect(() => {
    if (!showMoreFilters) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") closeSheet(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [showMoreFilters]);

  useEffect(() => {
    if (isHero) return;
    let originalTop = 0, isInit = false, ticking = false, isStickyState = false;
    const update = () => {
      ticking = false;
      if (window.innerWidth >= 768) { if (isStickyState) { setIsSticky(false); isStickyState = false; } return; }
      if (filterRef.current && !isInit) { originalTop = filterRef.current.offsetTop; setNavbarHeight(filterRef.current.offsetHeight); isInit = true; }
      if (filterRef.current && isInit) {
        const shouldStick = window.pageYOffset > originalTop + 10;
        if (shouldStick !== isStickyState) { setIsSticky(shouldStick); isStickyState = shouldStick; }
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [isHero]);

  const speciesOptions = [
    { value: "", label: t("dashboard.filters.species", "Species") },
    ...getSpecies().map((s) => ({ value: s, label: s })),
  ];
  const breedOptions = [
    { value: "", label: t("dashboard.filters.breed", "Breed") },
    ...getBreedsForSpecies(filters.species).map((b) => ({ value: b, label: b })),
  ];
  const sizeOptions = [
    { value: "", label: t("dashboard.filters.size", "Size") },
    { value: "Small", label: t("dashboard.addPet.small", "Small") },
    { value: "Medium", label: t("dashboard.addPet.medium", "Medium") },
    { value: "Large", label: t("dashboard.addPet.large", "Large") },
    { value: "Extra Large", label: t("dashboard.addPet.extraLarge", "Extra Large") },
  ];
  const ageOptions = [
    { value: "", label: t("dashboard.filters.ageGroup", "Age Group") },
    { value: "Baby", label: t("dashboard.filters.baby", "Baby (0–6m)") },
    { value: "Young", label: t("dashboard.filters.young", "Young (6m–2y)") },
    { value: "Adult", label: t("dashboard.filters.adult", "Adult (2–7y)") },
    { value: "Senior", label: t("dashboard.filters.senior", "Senior (7y+)") },
  ];
  const genderOptions = [
    { value: "", label: t("dashboard.filters.gender", "Gender") },
    { value: "Male", label: t("dashboard.addPet.male", "Male") },
    { value: "Female", label: t("dashboard.addPet.female", "Female") },
  ];
  const radiusOptions = [
    { value: "", label: t("dashboard.filters.radius", "Radius") },
    { value: "30", label: "30 km" },
    { value: "50", label: "50 km" },
    { value: "100", label: "100 km" },
  ];

  const field = (name, options, disabled = false, fieldTone = tone) => (
    <CustomSelect
      variant="filter"
      tone={fieldTone}
      value={filters[name]}
      onChange={(value) => setFilter(name, value)}
      options={options}
      disabled={disabled}
      ariaLabel={options[0]?.label}
    />
  );

  return (
    <>
      {isSticky && <div style={{ height: navbarHeight }} />}
      <div
        ref={filterRef}
        className={isHero ? "relative w-full" : `mx-auto w-full max-w-[1520px] px-4 sm:px-8 ${isSticky ? "fixed inset-x-0 top-[60px] z-30 md:top-20" : "relative z-10"}`}
      >
        <div className={isHero ? "" : `bg-white dark:bg-dark-panel ${isSticky ? "px-4 py-3 shadow-lg sm:px-8" : "px-4 py-6 sm:px-8"}`}>
          {!isSticky && (
            <div className="mb-5">
              <h2 className={`font-display text-2xl font-bold md:text-3xl ${isHero ? "text-white" : "text-[#0F172A] dark:text-gray-200"}`}>{t("dashboard.filters.findPet", "Find a Pet")}</h2>
            </div>
          )}

          <div className="space-y-3">
            <div className="hidden md:block space-y-3">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {field("species", speciesOptions, loading)}
                {field("breed", breedOptions, !filters.species)}
                {field("size", sizeOptions)}
                {field("ageGroup", ageOptions)}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {field("gender", genderOptions)}
                <LocationSearch
                  variant="filter"
                  tone={tone}
                  value={filters.location}
                  onChange={(value) => setFilter("location", value)}
                  placeholder={t("dashboard.filters.searchByLocation", "Search by location...")}
                />
                {field("distance", radiusOptions)}
              </div>
            </div>

            <div className="md:hidden">
              <div className="flex w-full items-center gap-2">
                <div className="relative min-w-0 flex-1">{field("species", speciesOptions, loading)}</div>
                <div className="relative min-w-0 flex-1">{field("breed", breedOptions, !filters.species)}</div>
                {!showMoreFilters && (
                  <button
                    type="button"
                    onClick={openSheet}
                    className="h-[50px] shrink-0 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white"
                  >
                    {t("dashboard.filters.title", "Filters")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMoreFilters && isMounted && createPortal(
        <div className="marketing-ui flt-sheet fixed inset-0 z-[220] flex flex-col md:hidden">
          <button
            type="button"
            className={`flt-sheet-backdrop absolute inset-0 bg-[#0F172A]/50 ${sheetClosing ? "is-closing" : ""}`}
            aria-label={t("dashboard.filters.close", "Close")}
            onClick={closeSheet}
          />
          <div className={`flt-sheet-panel relative mt-auto flex max-h-[92svh] min-h-[78svh] w-full flex-col rounded-t-[24px] bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-card dark:text-white ${sheetClosing ? "is-closing" : ""}`}>
            <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4 dark:border-dark-divider">
              <h3 className="font-display text-[1.65rem] font-bold leading-none">
                {t("dashboard.filters.title", "Filters")}
              </h3>
              <button
                type="button"
                onClick={closeSheet}
                className="flex h-10 w-10 items-center justify-center text-[#0F172A] dark:text-white"
                aria-label={t("dashboard.filters.close", "Close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="min-w-0">
                  <span className="flt-field-label">
                    {t("dashboard.filters.species", "Species")}
                  </span>
                  {field("species", [{ value: "", label: t("homepage.hero.allPets", "All") }, ...speciesOptions.slice(1)], loading, "light")}
                </label>
                <label className="min-w-0">
                  <span className="flt-field-label">
                    {t("dashboard.filters.breed", "Breed")}
                  </span>
                  {field("breed", [{ value: "", label: t("homepage.hero.allPets", "All") }, ...breedOptions.slice(1)], !filters.species, "light")}
                </label>
                <label className="min-w-0">
                  <span className="flt-field-label">
                    {t("dashboard.filters.ageGroup", "Age Group")}
                  </span>
                  {field("ageGroup", [{ value: "", label: t("homepage.hero.allPets", "All") }, ...ageOptions.slice(1)], false, "light")}
                </label>
                <label className="min-w-0">
                  <span className="flt-field-label">
                    {t("dashboard.filters.gender", "Gender")}
                  </span>
                  {field("gender", [{ value: "", label: t("homepage.hero.allPets", "All") }, ...genderOptions.slice(1)], false, "light")}
                </label>
              </div>

              <label className="mt-3 block">
                <span className="flt-field-label">
                  {t("dashboard.filters.size", "Size")}
                </span>
                {field("size", [{ value: "", label: t("homepage.hero.allPets", "All") }, ...sizeOptions.slice(1)], false, "light")}
              </label>

              <label className="mt-3 block">
                <span className="flt-field-label">
                  {t("dashboard.filters.location", "Location")}
                </span>
                <LocationSearch
                  variant="filter"
                  tone="light"
                  value={filters.location}
                  onChange={(value) => setFilter("location", value)}
                  placeholder={t("dashboard.filters.searchByLocation", "Search by location...")}
                />
              </label>

              <label className="mt-3 block">
                <span className="flt-field-label">
                  {t("dashboard.filters.radius", "Radius")}
                </span>
                {field("distance", [{ value: "", label: t("homepage.hero.allPets", "All") }, ...radiusOptions.slice(1)], false, "light")}
              </label>
            </div>

            <div className="shrink-0 border-t border-[#E2E8F0] bg-[#F4F7FB] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-dark-divider dark:bg-dark-card">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#0F172A] text-sm font-bold uppercase tracking-[0.12em] text-[#0F172A] dark:border-white/40 dark:text-white"
                >
                  {t("dashboard.filters.reset", "Reset")}
                </button>
                <button
                  type="button"
                  onClick={() => { onApplyFilters(filters); closeSheet(); }}
                  className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#2563EB] text-sm font-bold uppercase tracking-[0.12em] text-white"
                >
                  {t("dashboard.filters.apply", "Apply")}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
