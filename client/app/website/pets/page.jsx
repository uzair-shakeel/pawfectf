"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import Image from "next/image";
import HomePetCard from "../../../components/website/HomePetCard";
import Pagination from "../../../components/website/Pagination";
import FilterNavbar from "../../../components/website/FilterNavbar";
import { searchPets } from "../../../services/petService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import { mergeWithDemoPets } from "../../../lib/demoPets";
import { LayoutGrid, List, X, PawPrint, Search } from "lucide-react";

// URL params that are surfaced as removable chips above the results grid.
const CHIP_PARAMS = [
  "species", "breed", "size", "ageGroup", "gender", "color",
  "coatLength", "healthStatus", "adoptionStatus", "location",
  "feeFrom", "feeTo", "maxDistance",
];

function PetCardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-dark-card">
      <div className="h-72 bg-[#EEF2FF] dark:bg-dark-raised" />
      <div className="space-y-2 px-4 py-4">
        <div className="h-6 w-2/3 bg-[#EEF2FF] dark:bg-dark-raised" />
        <div className="h-4 w-1/2 bg-[#EEF2FF] dark:bg-dark-raised" />
      </div>
    </div>
  );
}

const PetsContent = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState("grid");
  const [allPets, setAllPets] = useState([]);
  const [pets, setPets] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("best-match");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Resize: force grid on mobile
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 768) setViewMode("grid"); };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Build API filters from URL
  const getFiltersFromUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    const get = (k) => params.get(k);
    const api = {};
    if (get("species")) api.species = get("species");
    if (get("breed")) api.breed = get("breed");
    if (get("size")) api.size = get("size");
    if (get("ageGroup")) api.ageGroup = get("ageGroup");
    if (get("gender")) api.gender = get("gender");
    if (get("color")) api.color = get("color");
    if (get("coatLength")) api.coatLength = get("coatLength");
    if (get("healthStatus")) api.healthStatus = get("healthStatus");
    if (get("adoptionStatus")) api.adoptionStatus = get("adoptionStatus");
    if (get("feeFrom")) api.minFee = Number(get("feeFrom"));
    if (get("feeTo")) api.maxFee = Number(get("feeTo"));
    if (get("location")) api.location = get("location");
    if (get("maxDistance")) api.maxDistance = Number(get("maxDistance"));
    const pageParam = get("page");
    if (pageParam) setCurrentPage(Number(pageParam));
    return api;
  }, [searchParams]);

  // Fetch pets
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const filters = getFiltersFromUrl();
        filters.limit = 1000;
        filters.page = 1;
        const payload = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== "" && !Number.isNaN(v)));
        const response = await searchPets(payload);
        let fetched = Array.isArray(response) ? response : (response?.pets ?? response?.cars ?? []);
        fetched = mergeWithDemoPets(fetched);

        // Client-side filtering (fallback in case backend doesn't filter properly)
        if (filters.species) fetched = fetched.filter(p => p.species?.toLowerCase() === filters.species.toLowerCase());
        if (filters.breed) fetched = fetched.filter(p => p.breed?.toLowerCase() === filters.breed.toLowerCase());
        if (filters.size) fetched = fetched.filter(p => p.size?.toLowerCase() === filters.size.toLowerCase());
        if (filters.coatLength) fetched = fetched.filter(p => p.coatLength?.toLowerCase() === filters.coatLength.toLowerCase());
        if (filters.healthStatus) fetched = fetched.filter(p => Array.isArray(p.healthStatus) ? p.healthStatus.some(h => h.toLowerCase() === filters.healthStatus.toLowerCase()) : p.healthStatus?.toLowerCase() === filters.healthStatus.toLowerCase());
        if (filters.adoptionStatus) fetched = fetched.filter(p => p.adoptionStatus?.toLowerCase() === filters.adoptionStatus.toLowerCase());
        if (filters.ageGroup) {
          fetched = fetched.filter(p => {
            const age = p.ageMonths || 0;
            switch (filters.ageGroup) {
              case "Baby": return age <= 6;
              case "Young": return age > 6 && age <= 24;
              case "Adult": return age > 24 && age <= 84;
              case "Senior": return age > 84;
              default: return true;
            }
          });
        }
        if (filters.minFee) fetched = fetched.filter(p => (p.adoptionFee || 0) >= filters.minFee);
        if (filters.maxFee) fetched = fetched.filter(p => (p.adoptionFee || 0) <= filters.maxFee);
        if (filters.color) fetched = fetched.filter(p => p.color?.toLowerCase() === filters.color.toLowerCase());
        if (filters.gender) fetched = fetched.filter(p => p.gender === filters.gender);

        setAllPets(fetched);
        setTotalItems(fetched.length);
      } catch (err) {
        console.error("Fetch error:", err);
        const demo = mergeWithDemoPets([]);
        setAllPets(demo);
        setPets(demo);
        setTotalItems(demo.length);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getFiltersFromUrl]);

  // Sort + paginate
  useEffect(() => {
    let data = [...allPets];
    if (sortBy !== "best-match") {
      data.sort((a, b) => {
        const feeA = a.adoptionFee || 0, feeB = b.adoptionFee || 0;
        const ageA = a.ageMonths || 0, ageB = b.ageMonths || 0;
        const dateA = new Date(a.createdAt || 0), dateB = new Date(b.createdAt || 0);
        switch (sortBy) {
          case "lowest-fee": return feeA - feeB;
          case "highest-fee": return feeB - feeA;
          case "youngest": return ageA - ageB;
          case "oldest": return ageB - ageA;
          case "newest-listed": return dateB - dateA;
          case "oldest-listed": return dateA - dateB;
          default: return 0;
        }
      });
    }
    const start = (currentPage - 1) * itemsPerPage;
    setPets(data.slice(start, start + itemsPerPage));
  }, [allPets, sortBy, currentPage, itemsPerPage]);

  const handleSort = (val) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams();
    const map = {
      species: newFilters.species, breed: newFilters.breed, size: newFilters.size,
      ageGroup: newFilters.ageGroup, gender: newFilters.gender, color: newFilters.color,
      coatLength: newFilters.coatLength, healthStatus: newFilters.healthStatus,
      adoptionStatus: newFilters.adoptionStatus, feeFrom: newFilters.feeFrom,
      feeTo: newFilters.feeTo, location: newFilters.location, maxDistance: newFilters.distance || newFilters.maxDistance,
    };
    Object.entries(map).forEach(([k, v]) => { if (v !== undefined && v !== "" && v !== null) params.set(k, v); });
    params.set("page", "1");
    setCurrentPage(1);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Active filters shown as removable chips
  const activeChips = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return CHIP_PARAMS
      .filter((key) => params.get(key))
      .map((key) => ({ key, value: params.get(key) }));
  }, [searchParams]);

  const removeChip = (key) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    params.set("page", "1");
    setCurrentPage(1);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const sortOptions = [
    { val: "best-match", label: t("dashboard.pets.sort.bestMatch", "Best Match") },
    { val: "youngest", label: t("dashboard.pets.sort.youngest", "Youngest") },
    { val: "oldest", label: t("dashboard.pets.sort.oldest", "Oldest") },
    { val: "newest-listed", label: t("dashboard.pets.sort.newestListed", "Newest Listed") },
    { val: "oldest-listed", label: t("dashboard.pets.sort.oldestListed", "Oldest Listed") },
  ];

  const sortBtnClass = (val) =>
    `shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${sortBy === val
      ? "bg-[#2563EB] text-white"
      : "bg-white text-[#64748B] hover:bg-[#EEF2FF] dark:bg-dark-card dark:text-dark-text-secondary dark:hover:bg-dark-raised"
    }`;

  return (
    <div className="marketing-ui min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <section className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/home/pets-banner.jpg"
            alt={t("dashboard.pets.bannerAlt", "Rescue dogs and cats waiting for adoption")}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] animate-kenburns"
          />
          <div className="absolute inset-0 bg-[#0F172A]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/45 to-[#0F172A]/25" />
        </div>

        <div className="relative z-30 mx-auto w-full max-w-[1520px] px-4 pb-6 pt-8 sm:px-8 md:pb-8 md:pt-20">
          <FilterNavbar onApplyFilters={handleApplyFilters} variant="hero" />
        </div>
      </section>

      <div className="mx-auto flex h-full max-w-[1520px] flex-row dark:bg-dark-main sm:px-8 sm:py-8">
        <main className="h-full w-full px-5 py-4 sm:px-0 sm:py-0">
          {/* -------------------------------------------------- Active filters */}
          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => removeChip(chip.key)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1.5 pl-3.5 pr-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                >
                  {chip.value}
                  <X className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm font-semibold text-gray-500 underline-offset-4 transition-colors hover:text-gray-900 hover:underline dark:text-dark-text-muted dark:hover:text-white"
              >
                {t("dashboard.filters.clearAll", "Clear all")}
              </button>
            </div>
          )}

          {/* ---------------------------------------------------- Controls bar */}
          <div className="relative z-20 flex flex-col gap-3 pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="order-2 min-w-0 flex-1 lg:order-1">
              <ul className="flex flex-wrap items-center gap-2.5">
                {sortOptions.map(({ val, label }) => (
                  <li key={val} className="flex-none">
                    <button type="button" onClick={() => handleSort(val)} className={sortBtnClass(val)}>{label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 flex items-center justify-between gap-3 lg:order-2 lg:justify-end">
              {!isLoading && !error && (
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-muted">
                  {totalItems} {t("dashboard.pets.results", "results")}
                </span>
              )}

              <div className="hidden gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-dark-divider dark:bg-dark-card lg:flex">
                {[
                  { mode: "grid", Icon: LayoutGrid },
                  { mode: "list", Icon: List },
                ].map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    aria-label={mode}
                    aria-pressed={viewMode === mode}
                    className={`flex items-center justify-center rounded-lg px-3.5 py-2.5 transition-all duration-200 ${viewMode === mode
                      ? "bg-[#2563EB] text-white"
                      : "text-gray-500 hover:bg-[#EEF2FF] hover:text-gray-900 dark:hover:bg-dark-raised"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <PetCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="mx-2 rounded-3xl border border-red-100 bg-red-50 py-14 text-center dark:border-red-500/20 dark:bg-red-500/5">
              <p className="font-semibold text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 bg-[#2563EB] px-6 py-3 font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#1D4ED8]"
              >
                {t("dashboard.pets.tryAgain", "Try Again")}
              </button>
            </div>
          ) : pets.length > 0 ? (
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
              : "flex flex-col space-y-4"
            }>
              {pets.map((pet, i) => <HomePetCard key={`${i}-${pet._id}`} pet={pet} viewMode={viewMode} />)}
            </div>
          ) : (
            <div className="flex min-h-[380px] flex-col items-center justify-center px-2 py-16 text-center sm:min-h-[460px] sm:py-20">
              <div className="relative mb-8">
                <span className="flex h-[88px] w-[88px] items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-white/10">
                  <PawPrint className="h-10 w-10" strokeWidth={1.4} />
                </span>
                <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center bg-[#2563EB] text-white">
                  <Search className="h-4 w-4" strokeWidth={2.2} />
                </span>
              </div>
              <h3 className="font-display max-w-sm text-[2rem] font-bold leading-[1.15] text-[#0F172A] dark:text-white md:text-[2.6rem]">
                {t("dashboard.pets.noPetsFound", "No pets found")}
              </h3>
              <p className="mt-3 max-w-[280px] text-[15px] leading-relaxed text-[#64748B] dark:text-white/55 sm:max-w-sm">
                {t("dashboard.pets.adjustFilters", "Try adjusting your filters to find more pets.")}
              </p>
              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-8 inline-flex h-12 items-center justify-center bg-[#2563EB] px-7 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#1D4ED8]"
                >
                  {t("dashboard.pets.emptyClear", "Clear filters")}
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && totalItems > 0 && (
            <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} className="mt-8 border-t border-gray-200" />
          )}
        </main>
      </div>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" />
    </div>
  }>
    <PetsContent />
  </Suspense>
);

export default Page;
