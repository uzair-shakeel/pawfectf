"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { useRouter } from "next/navigation";
import { useMakesModels } from "../../hooks/useMakesModels";

// Car types
const CAR_TYPES = [
  "Wszystkie",
  "Bus I Van",
  "Coupe",
  "Crossover",
  "Hatchback",
  "Kabriolet",
  "Kamper",
  "Klasyk",
  "Kombi",
  "Kompakt",
  "Limuzyna",
  "Pickup",
  "Sedan",
  "Sportowe",
  "SUV",
  "Terenowe",
];

// Generate years for dropdown
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) =>
  (currentYear - i).toString()
);

export function FilterSearch() {
  const router = useRouter();
  const { getMakes, getModelsForMake, loading } = useMakesModels();
  
  // State
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  // Get models for selected make
  const availableModels = make ? getModelsForMake(make) : [];

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (make) params.set("make", make);
    if (model) params.set("model", model);
    
    // Map "type" to "bodyType" for the receiving page
    if (type && type !== "Wszystkie") params.set("bodyType", type);
    
    // Map years to standard API keys
    if (startYear) params.set("yearFrom", startYear);
    if (endYear) params.set("yearTo", endYear);

    // Navigate
    router.push(`/website/cars?${params.toString()}`);
  };

  const handleMakeChange = (e) => {
    setMake(e.target.value);
    setModel(""); // Reset model when make changes
    // We do NOT reset Type here, allowing "Audi" + "SUV" combinations
  };

  const handleModelChange = (e) => {
    const val = e.target.value;
    setModel(val);
    
    // If a specific model is selected, we usually clear generic type
    // to prevent conflicting logic (UI disables Type dropdown anyway)
    if (val) {
      setType("");
    }
  };

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setType(val);

    // If a Body Type is selected (and not "Wszystkie"), we must clear Model
    // because the UI disables the Model dropdown.
    // However, we KEEP the Make, so users can search "Toyota" + "SUV".
    if (val && val !== "Wszystkie") {
      setModel("");
    }
  };

  const validateEndDate = (newEndYear) => {
    // Only validate if both are numbers
    const start = parseInt(startYear);
    const end = parseInt(newEndYear);

    // If both parsed values are valid numbers and end < start, clear endYear
    if (!isNaN(start) && !isNaN(end) && end < start) {
      setEndYear("");
    }
  };

  // Validate when start year changes — if start > existing end, clear start
  const validateStartDate = (newStartYear) => {
    const start = parseInt(newStartYear);
    const end = parseInt(endYear);

    // If both parsed values are valid numbers and start > end, clear startYear
    if (!isNaN(start) && !isNaN(end) && start > end) {
      setStartYear("");
    }
  };

  return (
    <div className="w-full   max-w-6xl mx-auto">
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className=" rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 space-y-3">
            {/* Make & Model in one row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Make Dropdown */}
              <select
                value={make}
                onChange={handleMakeChange}
                className="w-full h-12 px-3 border  rounded-md bg-white/70 text-black font-medium "
                disabled={loading}
              >
                <option value="">Marka</option>
                {getMakes().map((makeName) => (
                  <option key={makeName} value={makeName}>
                    {makeName}
                  </option>
                ))}
              </select>

              {/* Model Dropdown */}
              <select
                value={model}
                onChange={handleModelChange}
                className="w-full h-12 px-3 border rounded-md bg-white/70 text-black font-medium "
                disabled={loading || !make || (type !== "" && type !== "Wszystkie")}
              >
                <option value="">Model</option>
                {availableModels.map((modelOption) => (
                  <option key={modelOption} value={modelOption}>
                    {modelOption}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Range - 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <select
                value={startYear}
                onChange={(e) => {
                  setStartYear(e.target.value);
                  validateStartDate(e.target.value);
                }}
                className="w-full h-12 px-3 border rounded-md bg-white/70 text-black font-medium "
              >
                <option value="">Rok od</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={endYear}
                onChange={(e) => {
                  setEndYear(e.target.value);
                  validateEndDate(e.target.value);
                }}
                className="w-full h-12 px-3 border rounded-md bg-white/70 text-black font-medium "
              >
                <option value="">Rok do</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <p>lub</p>

            {/* Type Dropdown - Moved to just before search button */}
            <select
              value={type}
              onChange={handleTypeChange}
              className={cn(
                "w-full h-12 px-3 border bg-gray-200 rounded-md font-medium ",
                model ? "bg-gray-200 text-gray-500" : " text-black"
              )}
              disabled={!!model}
            >
              <option value="">Typ</option>
              {CAR_TYPES.map((carType) => (
                <option key={carType} value={carType}>
                  {carType}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Szukaj
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className=" rounded-lg shadow-lg overflow-hidden">
          {/* Using a single grid for consistent heights */}
          <div className="grid grid-cols-1 gap-4 grid-rows-2">
            {/* Top row: Make, Model, Type */}
            <div className="grid grid-cols-3 gap-4 h-[72px]">
              {/* Make Dropdown */}
              <div className="  h-full flex">
                <select
                  value={make}
                  onChange={handleMakeChange}
                  className="w-full h-full px-4 font-semibold border-0 bg-white/70 text-black  focus:ring-0 focus:outline-none appearance-none"
                  style={{ height: "100%" }} // Inline style for Safari
                  disabled={loading}
                >
                  <option value="">Marka</option>
                  {getMakes().map((makeName) => (
                    <option key={makeName} value={makeName}>
                      {makeName}
                    </option>
                  ))}
                </select>
              </div>
              {/* Model Dropdown */}
              <div className="  h-full flex">
                <select
                  value={model}
                  onChange={handleModelChange}
                  className={`w-full h-full px-4 border-0 bg-white/70 font-medium focus:ring-0 focus:outline-none appearance-none ${!make || (type !== "" && type !== "Wszystkie")
                      ? "text-gray-600 font-light"
                      : "text-black"
                    }`}
                  disabled={loading || !make || (type !== "" && type !== "Wszystkie")}
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  <option value="">Model</option>
                  {availableModels.map((modelOption) => (
                    <option key={modelOption} value={modelOption}>
                      {modelOption}
                    </option>
                  ))}
                </select>
              </div>
              {/* Type Dropdown - Moved to top row */}
              <div className="h-full flex">
                <select
                  value={type}
                  onChange={handleTypeChange}
                  className={cn(
                    "w-full h-full px-4 border-0 font-semibold bg-gray-200  focus:ring-0 focus:outline-none appearance-none",
                    model ? "bg-gray-200 text-gray-500" : " text-black"
                  )}
                  disabled={!!model}
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  <option value="">Typ</option>
                  {CAR_TYPES.map((carType) => (
                    <option key={carType} value={carType}>
                      {carType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom row: Start Year, End Year, Search Button, Reset Button */}
            <div className="grid grid-cols-3 gap-4  h-[72px]">
              {/* Start Year Dropdown */}
              <div className=" h-full flex">
                <select
                  value={startYear}
                    onChange={(e) => {
                      setStartYear(e.target.value);
                      validateStartDate(e.target.value);
                    }}
                  className="w-full h-full px-4 font-semibold border-0   bg-white/70 text-black  focus:ring-0 focus:outline-none appearance-none"
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  <option value="">Rok od</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {/* End Year Dropdown */}
              <div className=" h-full flex">
                <select
                  value={endYear}
                  onChange={(e) => {
                    setEndYear(e.target.value);
                    validateEndDate(e.target.value);
                  }}
                  className="w-full h-full px-4 border-0  font-semibold bg-white/70 text-black  focus:ring-0 focus:outline-none appearance-none"
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  <option value="">Rok do</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="flex w-full  h-full">
                <button
                  onClick={handleSearch}
                  className="w-full h-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                  style={{ height: "100%" }} // Inline style for Safari
                >
                  Szukaj
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}