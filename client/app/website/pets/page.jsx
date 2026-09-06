"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import FilterSidebar from "../../../components/website/FilterSidebar";
import FilterNavbar from "../../../components/website/FilterNavbar";
import HomePetCard from "../../../components/website/HomePetCard";
import Pagination from "../../../components/website/Pagination";
import { searchPets } from "../../../services/petService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import CustomSelect from "../../../components/website/CustomSelect";
import { LayoutGrid, List, SlidersHorizontal, X, PawPrint, ChevronRight, Search, MapPin } from "lucide-react";

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
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("best-match");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [bannerSpecies, setBannerSpecies] = useState("");
  const [bannerLocation, setBannerLocation] = useState("");

  // Resize: force grid on mobile
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 768) setViewMode("grid"); };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock scroll on mobile filter open
  useEffect(() => {
    document.body.style.overflow = showMobileFilter ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showMobileFilter]);

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
        setError(t("dashboard.pets.error", "Something went wrong. Please try again."));
        setAllPets([]); setPets([]); setTotalItems(0);
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
    setShowMobileFilter(false);
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
    `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${sortBy === val
      ? "bg-[#2563EB] text-white"
      : "bg-white text-[#64748B] hover:bg-[#EEF2FF] dark:bg-dark-card dark:text-dark-text-secondary dark:hover:bg-dark-raised"
    }`;

  useEffect(() => {
    setBannerSpecies(searchParams.get("species") || "");
    setBannerLocation(searchParams.get("location") || "");
  }, [searchParams]);

  const handleBannerSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (bannerSpecies) params.set("species", bannerSpecies);
    else params.delete("species");
    if (bannerLocation.trim()) params.set("location", bannerLocation.trim());
    else params.delete("location");
    params.set("page", "1");
    setCurrentPage(1);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const quickCategories = [
    { label: t("dashboard.pets.quickDogs", "Dogs"), href: "/website/pets?species=Pies", img: "/home/hero-dog.jpg" },
    { label: t("dashboard.pets.quickCats", "Cats"), href: "/website/pets?species=Kot", img: "/home/hero-cat.jpg" },
    { label: t("dashboard.pets.quickSmall", "Small dogs"), href: "/website/pets?species=Pies&size=Small", img: "/home/cat-small-dogs.jpg" },
    { label: t("dashboard.pets.quickLarge", "Big dogs"), href: "/website/pets?species=Pies&size=Large", img: "/home/cat-big-dogs.jpg" },
    { label: t("dashboard.pets.quickYoung", "Puppies & kittens"), href: "/website/pets?ageGroup=Baby", img: "/home/cat-kittens.jpg" },
    { label: t("dashboard.pets.quickSeniors", "Seniors"), href: "/website/pets?ageGroup=Senior", img: "/home/cat-senior.jpg" },
  ];

  return (
    <div className="marketing-ui min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <section className="relative min-h-[500px] md:min-h-[620px]">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/home/pets-banner.jpg"
            alt={t("dashboard.pets.bannerAlt", "Rescue dogs and cats waiting for adoption")}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] animate-kenburns"
          />
          <div className="absolute inset-0 bg-[#0F172A]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F4F7FB] via-transparent to-[#0F172A]/25 dark:from-dark-main" />
        </div>

        <div className="relative z-30 mx-auto flex min-h-[500px] w-full max-w-[1520px] flex-col justify-end px-5 pb-16 pt-20 sm:px-8 md:min-h-[620px] md:pb-24">
          <nav className="mb-5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
            <Link href="/" className="transition-colors hover:text-white">
              {t("dashboard.pets.breadcrumbHome", "Home")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{t("dashboard.filters.findPet", "Find a Pet")}</span>
          </nav>

          <h1 className="font-display max-w-3xl text-[2.6rem] font-medium leading-[1.08] text-white md:text-[4.4rem]">
            {t("dashboard.pets.bannerTitle", "Find your new best friend")}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">
            {t("dashboard.pets.bannerSubtitle", "Browse pets from verified shelters and private owners near you.")}
          </p>

          <form onSubmit={handleBannerSearch} className="mkt-search mt-8 max-w-3xl">
            <CustomSelect
              value={bannerSpecies}
              onChange={setBannerSpecies}
              options={[
                { value: "", label: t("dashboard.pets.searchSpecies", "All species") },
                { value: "Pies", label: t("dashboard.pets.quickDogs", "Dogs") },
                { value: "Kot", label: t("dashboard.pets.quickCats", "Cats") },
              ]}
              label={t("dashboard.pets.searchSpecies", "All species")}
              icon={PawPrint}
              ariaLabel={t("dashboard.pets.searchSpecies", "All species")}
            />
            <label className="mkt-field">
              <MapPin className="mr-3 h-5 w-5 shrink-0 text-[#2563EB]" />
              <span className="min-w-0 flex-1">
                <span className="mkt-field-label">{t("dashboard.pets.searchLocation", "City or region")}</span>
                <input
                  type="text"
                  value={bannerLocation}
                  onChange={(e) => setBannerLocation(e.target.value)}
                  placeholder={t("dashboard.pets.searchLocation", "City or region")}
                  className="mkt-field-value"
                />
              </span>
            </label>
            <button
              type="submit"
              className="inline-flex min-h-[58px] items-center justify-center gap-2 bg-[#2563EB] px-8 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#1D4ED8]"
            >
              <Search className="h-4 w-4" />
              {t("dashboard.pets.searchBtn", "Search")}
            </button>
          </form>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
            {isLoading
              ? t("dashboard.pets.loading", "Loading pets...")
              : `${totalItems} ${t("dashboard.pets.available", "pets available")}`}
          </p>
        </div>
      </section>

      <section className="relative z-0 mx-auto w-full max-w-[1520px] px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {quickCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative block h-28 overflow-hidden md:h-40"
            >
              <Image
                src={cat.img}
                alt={cat.label}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/20 to-transparent" />
              <span className="absolute inset-x-2 bottom-3 text-center font-display text-sm text-white md:text-lg">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="w-full pt-6">
        <FilterNavbar onApplyFilters={handleApplyFilters} />
      </div>

      <div className="mx-auto flex h-full max-w-[1520px] flex-row dark:bg-dark-main sm:py-8 lg:space-x-4">
        <aside className="sticky top-0 hidden h-fit w-[380px] self-start">
          <FilterSidebar onApplyFilters={handleApplyFilters} />
        </aside>

        <main className="h-full w-full px-0 sm:px-4">
          {/* -------------------------------------------------- Active filters */}
          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 px-[10px] sm:px-2">
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
          <div className="relative z-20 flex flex-col gap-3 px-[10px] py-1 pb-6 sm:px-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="order-2 min-w-0 flex-1 lg:order-1">
              <ul className="flex flex-wrap items-center gap-2 px-0.5 py-1">
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

              <button
                onClick={() => setShowMobileFilter(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-dark-divider dark:bg-dark-card dark:text-dark-text-primary lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t("dashboard.filters.title", "Filters")}
              </button>

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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col space-y-4"
            }>
              {pets.map((pet, i) => <HomePetCard key={`${i}-${pet._id}`} pet={pet} viewMode={viewMode} />)}
            </div>
          ) : (
            <div className="mx-2 rounded-3xl border border-gray-100 bg-white py-16 text-center shadow-sm dark:border-dark-divider dark:bg-dark-card">
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF] text-blue-600 shadow-sm dark:bg-dark-raised">
                <PawPrint className="h-7 w-7" />
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-200">
                {t("dashboard.pets.noPetsFound", "No pets found")}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-md text-gray-500 dark:text-dark-text-muted">
                {t("dashboard.pets.adjustFilters", "Try adjusting your filters to find more pets.")}
              </p>
              {activeChips.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="mt-6 bg-[#2563EB] px-6 py-3 font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  {t("dashboard.filters.clearAll", "Clear all")}
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && totalItems > 0 && (
            <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }} showItemsPerPage className="mt-8 border-t border-gray-200" />
          )}

          {showMobileFilter && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-dark-main">
              <FilterSidebar onApplyFilters={handleApplyFilters} setShowMobileFilter={setShowMobileFilter} isVisible={showMobileFilter} />
            </div>
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
