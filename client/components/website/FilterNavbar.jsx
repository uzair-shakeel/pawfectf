"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSpeciesBreeds } from "../../hooks/useSpeciesBreeds";
import { createPortal } from "react-dom";
import { MdKeyboardArrowDown } from "react-icons/md";

const COLORS = ["Black", "White", "Brown", "Golden", "Gray", "Cream", "Orange", "Tabby", "Calico", "Spotted", "Mixed", "Other"];
const HEALTH_OPTIONS = ["Vaccinated", "Neutered/Spayed", "Microchipped", "Dewormed", "Vet Checked", "Special Needs"];

const EMPTY = {
  location: "", distance: "", species: "", breed: "", size: "",
  ageGroup: "", gender: "", color: "", coatLength: "", healthStatus: "",
  adoptionStatus: "", feeFrom: "", feeTo: "",
};

export default function FilterNavbar({ onApplyFilters }) {
  const { getSpecies, getBreedsForSpecies, loading } = useSpeciesBreeds();
  const [filters, setFilters] = useState(EMPTY);
  const searchParams = useSearchParams();
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => { setIsMounted(true); }, []);

  // Sync from URL params
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    if (name === "species") updated.breed = "";
    setFilters(updated);
    onApplyFilters(updated);
  };

  const handleReset = () => { setFilters(EMPTY); onApplyFilters(EMPTY); };

  // Sticky behavior (mobile only)
  useEffect(() => {
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
  }, []);

  const sel = "px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-gray-200 dark:border-dark-divider rounded-md lg:rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm hover:shadow-md transition-all duration-200 appearance-none w-full";
  const arrow = <div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:pr-3 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>;

  return (
    <>
      {isSticky && <div style={{ height: navbarHeight }} />}
      <div
        ref={filterRef}
        className={`bg-white max-w-[1480px] mx-auto dark:bg-dark-panel z-50 ${isSticky ? "fixed top-0 left-0 right-0 shadow-xl backdrop-blur-sm bg-white/70 dark:bg-dark-panel/95" : "relative"}`}
      >
        <div className={`w-full px-0 lg:px-8 ${isSticky ? "py-2" : "py-6"}`}>
          {!isSticky && (
            <div className="flex items-center justify-between mx-[10px] mb-[10px]">
              <h2 className="font-bold text-gray-900 dark:text-gray-200 text-2xl">Find a Pet</h2>
            </div>
          )}

          <div className="space-y-1">
            {/* Desktop Layout */}
            <div className="hidden md:block space-y-1 lg:w-full">
              {/* Row 1: Species, Breed, Size, Age */}
              <div className="flex items-center justify-between w-full gap-1">
                <div className="relative flex-1">
                  <select name="species" value={filters.species} onChange={handleInputChange} className={sel} disabled={loading}>
                    <option value="">Species</option>
                    {getSpecies().map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>{arrow}
                </div>
                <div className="relative flex-1">
                  <select name="breed" value={filters.breed} onChange={handleInputChange} className={sel} disabled={!filters.species}>
                    <option value="">Breed</option>
                    {getBreedsForSpecies(filters.species).map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>{arrow}
                </div>
                <div className="relative flex-1">
                  <select name="size" value={filters.size} onChange={handleInputChange} className={sel}>
                    <option value="">Size</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Extra Large">Extra Large</option>
                  </select>{arrow}
                </div>
                <div className="relative flex-1">
                  <select name="ageGroup" value={filters.ageGroup} onChange={handleInputChange} className={sel}>
                    <option value="">Age Group</option>
                    <option value="Baby">Baby (0–6m)</option>
                    <option value="Young">Young (6m–2y)</option>
                    <option value="Adult">Adult (2–7y)</option>
                    <option value="Senior">Senior (7y+)</option>
                  </select>{arrow}
                </div>
              </div>

              {/* Row 2: Gender, Color, Adoption Status, Health Status */}
              <div className="flex items-center justify-between w-full gap-1">
                <div className="relative flex-1">
                  <select name="gender" value={filters.gender} onChange={handleInputChange} className={sel}>
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>{arrow}
                </div>
                <div className="relative flex-1">
                  <select name="color" value={filters.color} onChange={handleInputChange} className={sel}>
                    <option value="">Color</option>
                    {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>{arrow}
                </div>
                <div className="relative flex-1">
                  <select name="adoptionStatus" value={filters.adoptionStatus} onChange={handleInputChange} className={sel}>
                    <option value="">Status</option>
                    <option value="Available">Available</option>
                    <option value="Pending">Pending</option>
                  </select>{arrow}
                </div>
                <div className="relative flex-1">
                  <select name="healthStatus" value={filters.healthStatus} onChange={handleInputChange} className={sel}>
                    <option value="">Health Status</option>
                    {HEALTH_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>{arrow}
                </div>
              </div>

              {/* Row 3 (expanded): Coat Length, Fee From, Fee To */}
              {isDesktopExpanded && (
                <div className="flex items-center justify-between w-full gap-1">
                  <div className="relative flex-1">
                    <select name="coatLength" value={filters.coatLength} onChange={handleInputChange} className={sel}>
                      <option value="">Coat Length</option>
                      <option value="Hairless">Hairless</option>
                      <option value="Short">Short</option>
                      <option value="Medium">Medium</option>
                      <option value="Long">Long</option>
                    </select>{arrow}
                  </div>
                  <div className="relative flex-1">
                    <input type="number" name="feeFrom" value={filters.feeFrom} onChange={handleInputChange} placeholder="Fee from (zł)" className={sel} min="0" />
                  </div>
                  <div className="relative flex-1">
                    <input type="number" name="feeTo" value={filters.feeTo} onChange={handleInputChange} placeholder="Fee to (zł)" className={sel} min="0" />
                  </div>
                  <div className="relative flex-1">
                    <input type="text" name="location" value={filters.location} onChange={handleInputChange} placeholder="Location" className={sel} />
                  </div>
                </div>
              )}

              {/* Reset + Expand buttons */}
              <div className="hidden md:flex items-center justify-center w-full gap-1">
                <button onClick={handleReset} className={`${sel} flex-1 justify-center text-gray-600 hover:text-gray-900`}>
                  Reset
                </button>
                <button
                  onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
                  className="flex items-center gap-1 lg:gap-2 px-2 py-1.5 pr-6 text-sm lg:px-4 lg:py-3 lg:pr-10 lg:text-base font-medium border border-blue-500 rounded-md lg:rounded-lg focus:outline-none whitespace-nowrap shadow-sm flex-1 justify-center text-white bg-blue-500"
                >
                  {isDesktopExpanded ? "Less Filters" : "More Filters"}
                  <MdKeyboardArrowDown className={`w-5 h-5 transition-transform ${isDesktopExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className={`flex items-center justify-between w-[calc(100%-18px)] gap-2 mx-[10px] ${isSticky ? "mb-0" : "mb-[10px]"}`}>
                <div className="relative flex-1">
                  <select name="species" value={filters.species} onChange={handleInputChange} className="px-3 h-10 pr-6 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm appearance-none w-full" disabled={loading}>
                    <option value="">Species</option>
                    {getSpecies().map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
                <div className="relative flex-1">
                  <select name="breed" value={filters.breed} onChange={handleInputChange} className="px-3 h-10 pr-6 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm appearance-none w-full" disabled={!filters.species}>
                    <option value="">Breed</option>
                    {getBreedsForSpecies(filters.species).map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
                {!showMoreFilters && (
                  <div className="relative flex-1">
                    <button onClick={() => setShowMoreFilters(true)} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-blue-500 rounded-lg whitespace-nowrap shadow-sm flex items-center justify-start text-white bg-blue-500 leading-[17px] hover:bg-blue-600">
                      <span>Filters</span>
                    </button>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-white" /></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {showMoreFilters && isMounted && createPortal(
        <div className="md:hidden fixed inset-0 z-[2147483647]">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowMoreFilters(false)} />
          <div className="fixed inset-0 bg-white dark:bg-dark-card shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Filters</h3>
              <button onClick={() => setShowMoreFilters(false)} className="text-sm text-gray-600 dark:text-dark-text-secondary border border-gray-200 dark:border-dark-divider rounded-md px-2 py-1">Close</button>
            </div>
            <div className="space-y-3">
              {/* Species + Breed */}
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <select name="species" value={filters.species} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm appearance-none" disabled={loading}>
                    <option value="">Species</option>
                    {getSpecies().map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
                <div className="relative flex-1">
                  <select name="breed" value={filters.breed} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm appearance-none" disabled={!filters.species}>
                    <option value="">Breed</option>
                    {getBreedsForSpecies(filters.species).map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
              </div>
              {/* Age + Gender */}
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <select name="ageGroup" value={filters.ageGroup} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm appearance-none">
                    <option value="">Age</option>
                    <option value="Baby">Baby</option>
                    <option value="Young">Young</option>
                    <option value="Adult">Adult</option>
                    <option value="Senior">Senior</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
                <div className="relative flex-1">
                  <select name="gender" value={filters.gender} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm appearance-none">
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
              </div>
              {/* Size + Color */}
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <select name="size" value={filters.size} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm appearance-none">
                    <option value="">Size</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Extra Large">XL</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
                <div className="relative flex-1">
                  <select name="color" value={filters.color} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm appearance-none">
                    <option value="">Color</option>
                    {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
              </div>
              {/* Coat + Health */}
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <select name="coatLength" value={filters.coatLength} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm appearance-none">
                    <option value="">Coat</option>
                    <option value="Hairless">Hairless</option>
                    <option value="Short">Short</option>
                    <option value="Medium">Medium</option>
                    <option value="Long">Long</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
                <div className="relative flex-1">
                  <select name="healthStatus" value={filters.healthStatus} onChange={handleInputChange} className="w-full px-3 h-10 pr-6 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm appearance-none">
                    <option value="">Health</option>
                    {HEALTH_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><MdKeyboardArrowDown className="w-5 h-5 text-gray-500" /></div>
                </div>
              </div>
              {/* Fee From + Fee To */}
              <div className="flex gap-1">
                <input type="number" name="feeFrom" value={filters.feeFrom} onChange={handleInputChange} placeholder="Fee from (zł)" className="w-full px-3 h-10 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm" min="0" />
                <input type="number" name="feeTo" value={filters.feeTo} onChange={handleInputChange} placeholder="Fee to (zł)" className="w-full px-3 h-10 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm" min="0" />
              </div>
              {/* Location */}
              <input type="text" name="location" value={filters.location} onChange={handleInputChange} placeholder="Location" className="w-full px-3 h-10 text-sm font-medium border border-gray-200 dark:border-dark-divider rounded-lg focus:outline-none bg-white dark:bg-dark-raised dark:text-dark-text-primary shadow-sm" />
              {/* Reset + Apply */}
              <div className="flex gap-2 pt-2">
                <button onClick={handleReset} className="flex-1 px-4 py-3 text-sm font-medium border border-gray-200 rounded-lg text-gray-700">Reset</button>
                <button onClick={() => { onApplyFilters(filters); setShowMoreFilters(false); }} className="flex-1 px-4 py-3 text-sm font-medium bg-blue-500 text-white rounded-lg">Apply</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}