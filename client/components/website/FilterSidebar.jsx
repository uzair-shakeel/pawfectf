"use client";
import { X } from "lucide-react";
import { useState } from "react";
import { useSpeciesBreeds } from "../../hooks/useSpeciesBreeds";

const COLORS = [
  "Black", "White", "Brown", "Golden", "Gray", "Cream", "Orange",
  "Tabby", "Calico", "Spotted", "Striped", "Mixed", "Other"
];

const HEALTH_OPTIONS = [
  "Vaccinated", "Neutered/Spayed", "Microchipped", "Dewormed",
  "Vet Checked", "Special Needs"
];

const EMPTY_FILTERS = {
  location: "",
  maxDistance: "",
  species: "",
  breed: "",
  size: "",
  ageGroup: "",
  gender: "",
  color: "",
  coatLength: "",
  healthStatus: "",
  adoptionStatus: "",
  feeFrom: "",
  feeTo: "",
};

export default function FilterSidebar({ onApplyFilters, setShowMobileFilter, isVisible = true }) {
  const [openIndex, setOpenIndex] = useState(null);
  const { getSpecies, getBreedsForSpecies, loading } = useSpeciesBreeds();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const toggle = (index) => {
    const wasOpen = openIndex === index;
    setOpenIndex(wasOpen ? null : index);
    if (!wasOpen && setShowMobileFilter) {
      setTimeout(() => {
        if (window.innerWidth < 768) {
          const el = document.querySelector(`.collapse-title[data-index="${index}"]`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 50);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    if (name === "species") updated.breed = "";
    setFilters(updated);
    if (!setShowMobileFilter) onApplyFilters(buildQuery(updated));
  };

  const buildQuery = (f) => {
    const q = {};
    if (f.species) q.species = f.species;
    if (f.breed) q.breed = f.breed;
    if (f.size) q.size = f.size;
    if (f.ageGroup) q.ageGroup = f.ageGroup;
    if (f.gender) q.gender = f.gender;
    if (f.color) q.color = f.color;
    if (f.coatLength) q.coatLength = f.coatLength;
    if (f.healthStatus) q.healthStatus = f.healthStatus;
    if (f.adoptionStatus) q.adoptionStatus = f.adoptionStatus;
    if (f.feeFrom) q.feeFrom = f.feeFrom;
    if (f.feeTo) q.feeTo = f.feeTo;
    if (f.location) {
      q.latitude = "50.0647";
      q.longitude = "19.945";
      q.maxDistance = f.maxDistance;
    }
    return q;
  };

  const handleApplyFilters = () => {
    onApplyFilters(buildQuery(filters));
    if (setShowMobileFilter) setShowMobileFilter(false);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    onApplyFilters({});
    if (setShowMobileFilter) setShowMobileFilter(false);
  };

  const selectClass = "w-full p-4 min-h-[50px] rounded-md bg-white dark:bg-dark-raised border border-gray-300 dark:border-dark-divider text-md dark:text-dark-text-primary appearance-none";

  const Section = ({ index, label, children }) => (
    <div className={`collapse collapse-arrow px-2 rounded-none ${openIndex === index ? "collapse-open" : ""}`}>
      <div className="collapse-title text-xl py-5 md:text-lg font-medium cursor-pointer" onClick={() => toggle(index)} data-index={String(index)}>
        {label}
      </div>
      <div className="collapse-content space-y-2" data-index={String(index)}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full lg:sticky dark:bg-dark-panel lg:top-4 lg:max-w-xs h-full">
      <div className="border rounded-md bg-white dark:bg-dark-card border-gray-200 dark:border-dark-divider text-gray-900 dark:text-gray-200 flex flex-col h-[100vh] md:h-auto">
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200 dark:border-dark-divider sticky top-0 bg-white dark:bg-dark-card z-10">
          <div className="flex gap-6 items-center">
            <h2 className="text-2xl font-semibold">Filters</h2>
            <button onClick={handleReset} className="text-lg text-blue-600 font-medium">Reset</button>
          </div>
          {setShowMobileFilter && (
            <button onClick={() => setShowMobileFilter(false)} className="text-md md:hidden">
              <X size={30} />
            </button>
          )}
        </div>

        <div
          className="divide-y overflow-auto flex-1 touch-pan-y overscroll-contain"
          style={{ height: setShowMobileFilter ? "calc(100vh - 140px)" : "calc(100vh - 132px)" }}
          onClick={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Location */}
          <Section index={0} label="Location">
            <input type="text" name="location" value={filters.location} onChange={handleInputChange} placeholder="Enter location" className={selectClass} />
            <select name="maxDistance" value={filters.maxDistance} onChange={handleInputChange} className={selectClass}>
              <option value="">Select distance</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
          </Section>

          {/* Species */}
          <Section index={1} label="Species">
            <select name="species" value={filters.species} onChange={handleInputChange} className={selectClass} disabled={loading}>
              <option value="">All Species</option>
              {getSpecies().map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Section>

          {/* Breed */}
          <Section index={2} label="Breed">
            <select name="breed" value={filters.breed} onChange={handleInputChange} className={selectClass} disabled={!filters.species}>
              <option value="">All Breeds</option>
              {getBreedsForSpecies(filters.species).map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Section>

          {/* Age Group */}
          <Section index={3} label="Age">
            <select name="ageGroup" value={filters.ageGroup} onChange={handleInputChange} className={selectClass}>
              <option value="">Any Age</option>
              <option value="Baby">Baby (0–6 months)</option>
              <option value="Young">Young (6m–2 years)</option>
              <option value="Adult">Adult (2–7 years)</option>
              <option value="Senior">Senior (7+ years)</option>
            </select>
          </Section>

          {/* Gender */}
          <Section index={4} label="Gender">
            <select name="gender" value={filters.gender} onChange={handleInputChange} className={selectClass}>
              <option value="">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Section>

          {/* Size */}
          <Section index={5} label="Size">
            <select name="size" value={filters.size} onChange={handleInputChange} className={selectClass}>
              <option value="">Any Size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Extra Large">Extra Large</option>
            </select>
          </Section>

          {/* Coat Length */}
          <Section index={6} label="Coat Length">
            <select name="coatLength" value={filters.coatLength} onChange={handleInputChange} className={selectClass}>
              <option value="">Any</option>
              <option value="Hairless">Hairless</option>
              <option value="Short">Short</option>
              <option value="Medium">Medium</option>
              <option value="Long">Long</option>
            </select>
          </Section>

          {/* Health Status */}
          <Section index={7} label="Health Status">
            <select name="healthStatus" value={filters.healthStatus} onChange={handleInputChange} className={selectClass}>
              <option value="">Any</option>
              {HEALTH_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </Section>
        </div>

        {setShowMobileFilter && (
          <div className="px-4 py-4 border-t sticky md:hidden bottom-0 bg-white z-10">
            <button onClick={handleApplyFilters} className="text-md bg-blue-600 text-white px-4 py-3 rounded-md w-full font-medium">
              Apply Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
