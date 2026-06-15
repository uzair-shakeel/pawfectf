"use client";
import { useState } from "react";
import { useMakesModels } from "../../hooks/useMakesModels";

const SearchFilter = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    type: "",
  });

  const { getMakes, getModelsForMake, loading } = useMakesModels();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };

    // Reset model when make changes
    if (name === 'make') {
      updatedFilters.model = '';
    }

    setFilters(updatedFilters);
  };

  const handleSearch = () => {
    if (onSearch) onSearch(filters);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-5 shadow-md rounded-lg flex flex-col gap-4 items-start">
      {/* <h1 className=" text-2xl font-semibold text-blue-600">
        Find your next car
      </h1> */}
      <div className="w-full max-w-5xl mx-auto bg-white rounded-lg flex flex-wrap gap-4 items-center">
        {/* Make */}
        <select
          name="make"
          value={filters.make}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-full sm:w-auto flex-1"
          disabled={loading}
        >
          <option value="">Select Make</option>
          {getMakes().map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>

        {/* Model */}
        <select
          name="model"
          value={filters.model}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-full sm:w-auto flex-1"
          disabled={loading || !filters.make}
        >
          <option value="">Select Model</option>
          {filters.make && getModelsForMake(filters.make).map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        {/* Year From */}
        <input
          type="number"
          name="yearFrom"
          placeholder="Year From"
          value={filters.yearFrom}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-24"
        />

        {/* Year To */}
        <input
          type="number"
          name="yearTo"
          placeholder="Year To"
          value={filters.yearTo}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-24"
        />

        <span className="text-gray-500">or</span>

        {/* Type */}
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-full sm:w-auto flex-1"
        >
          <option value="">Typ nadwozia</option>
          <option value="Bus I Van">Bus I Van</option>
          <option value="Coupe">Coupe</option>
          <option value="Crossover">Crossover</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Kabriolet">Kabriolet</option>
          <option value="Kamper">Kamper</option>
          <option value="Klasyk">Klasyk</option>
          <option value="Kombi">Kombi</option>
          <option value="Kompakt">Kompakt</option>
          <option value="Limuzyna">Limuzyna</option>
          <option value="Pickup">Pickup</option>
          <option value="Sedan">Sedan</option>
          <option value="Sportowe">Sportowe</option>
          <option value="SUV">SUV</option>
          <option value="Terenowe">Terenowe</option>
        </select>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-blue-500 w-full text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
