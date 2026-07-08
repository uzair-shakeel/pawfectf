"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import FilterSidebar from "../../../components/website/FilterSidebar";
import FilterNavbar from "../../../components/website/FilterNavbar";
import PetCard from "../../../components/website/PetCard";
import Pagination from "../../../components/website/Pagination";
import { searchPets } from "../../../services/petService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

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
  const sortListRef = useRef(null);
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

  // Drag scroll on sort list
  useEffect(() => {
    const el = sortListRef.current;
    if (!el) return;
    let isDown = false, startX = 0, startScrollLeft = 0;
    const down = (e) => { isDown = true; el.classList.add("dragging"); startX = (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft; startScrollLeft = el.scrollLeft; };
    const move = (e) => { if (!isDown) return; const x = (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft; el.scrollLeft = startScrollLeft - (x - startX); };
    const up = () => { isDown = false; el.classList.remove("dragging"); };
    el.addEventListener("mousedown", down, { passive: true }); el.addEventListener("mousemove", move, { passive: true }); el.addEventListener("mouseleave", up, { passive: true }); el.addEventListener("mouseup", up, { passive: true });
    el.addEventListener("touchstart", down, { passive: true }); el.addEventListener("touchmove", move, { passive: true }); el.addEventListener("touchend", up, { passive: true });
    return () => { el.removeEventListener("mousedown", down); el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", up); el.removeEventListener("mouseup", up); el.removeEventListener("touchstart", down); el.removeEventListener("touchmove", move); el.removeEventListener("touchend", up); };
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
        setError("Something went wrong. Please try again.");
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

  const handleSort = (val) => { setSortBy(val); setCurrentPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); };

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

  const sortBtnClass = (val) =>
    `text-[14px] leading-[17px] font-medium text-center px-0 transition-none shrink-0 border-b-2 bg-transparent focus:outline-none appearance-none ${sortBy === val
      ? "text-gray-900 dark:text-gray-200 border-gray-900 dark:border-dark-text-primary"
      : "text-gray-500 dark:text-dark-text-muted border-transparent hover:text-gray-700 dark:hover:text-dark-text-primary"
    }`;

  return (
    <div className="min-h-screen bg-white dark:bg-dark-main">
      <div className="w-full">
        <FilterNavbar onApplyFilters={handleApplyFilters} />
      </div>

      <div className="max-w-screen-2xl dark:bg-dark-main mx-auto sm:py-12 flex flex-row lg:space-x-4 h-full">
        <aside className="w-[380px] hidden sticky top-0 self-start h-fit">
          <FilterSidebar onApplyFilters={handleApplyFilters} />
        </aside>

        <main className="h-full w-full px-0 sm:px-4">
          {/* Controls */}
          <div className="bg-white dark:bg-dark-main flex flex-col lg:flex-row justify-between items-center py-1 pb-2 px-[10px] sm:px-2 gap-2 lg:gap-4">
            {/* View toggle */}
            <div className="hidden lg:flex justify-center lg:justify-end w-full lg:w-auto order-1 lg:order-2">
              <div className="bg-white rounded-lg p-1 shadow-sm border flex gap-1">
                {["grid", "list"].map((mode) => (
                  <button key={mode} type="button" onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 lg:px-4 lg:py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${viewMode === mode ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                    {mode === "grid"
                      ? <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      : <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                    }
                  </button>
                ))}
              </div>
            </div>

            {/* Sort options */}
            <div className="order-2 lg:order-1 w-full -mt-[28px] lg:mt-4 lg:w-auto">
              <ul ref={sortListRef} className="filter-sorts flex flex-nowrap items-center overflow-x-scroll scrollbar-hide whitespace-nowrap -mx-2 px-2 pr-4 gap-2 lg:gap-4 cursor-grab select-none active:cursor-grabbing">
                {[
                  { val: "best-match", label: "Best Match" },
                  // Fee sorting removed per user request
                  // { val: "lowest-fee", label: "Lowest Fee" },
                  // { val: "highest-fee", label: "Highest Fee" },
                  { val: "youngest", label: "Youngest" },
                  { val: "oldest", label: "Oldest" },
                  { val: "newest-listed", label: "Newest Listed" },
                  { val: "oldest-listed", label: "Oldest Listed" },
                ].map(({ val, label }) => (
                  <li key={val} className="sort-option pr-3 flex-none">
                    <button onClick={() => handleSort(val)} className={sortBtnClass(val)}>{label}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pet Grid/List */}
          <div className={viewMode === "grid" ? "grid gap-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 -mt-[5px] lg:mt-4" : "flex flex-col space-y-4 -mt-[5px] lg:mt-4"}>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status" />
                <p className="mt-2 text-gray-600">Loading pets...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Try Again</button>
              </div>
            ) : pets.length > 0 ? (
              pets.map((pet, i) => <PetCard key={`${i}-${pet._id}`} pet={pet} viewMode={viewMode} />)
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">No pets found</h3>
                <p className="mt-2 text-sm text-gray-500">Try adjusting your filters to find more pets.</p>
              </div>
            )}
          </div>

          {!isLoading && !error && totalItems > 0 && (
            <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }} showItemsPerPage className="border-t border-gray-200" />
          )}

          {showMobileFilter && (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
              <FilterSidebar onApplyFilters={handleApplyFilters} setShowMobileFilter={setShowMobileFilter} isVisible={showMobileFilter} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PetsContent />
  </Suspense>
);

export default Page;
