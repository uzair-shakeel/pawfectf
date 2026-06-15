'use client'
import React from "react";
import SearchFilter from "./SearchFilter";

const Hero = () => {
  const handleSearch = (filters) => {
    console.log("Searching with filters:", filters);
  };
  return (
    <div className="flex w-full min-h-screen h-auto bg-blue-500 dark:bg-dark-panel/90 p-4 bg-[url('/website/hero.webp')] dark:bg-[url('/website/hero.webp')] bg-cover bg-center transition-colors duration-300">

      <div className="relative w-full mx-auto flex flex-col items-center pt-20">
        <h1 className="sm:text-6xl text-4xl font-bold text-white dark:text-white text-center transition-colors duration-300">Find Your Next Car</h1>
        <p className="mt-10 max-w-4xl text-lg text-white dark:text-gray-200 text-center transition-colors duration-300">Whether you're dreaming of a relaxing beach vacation, an adventurous mountain trek,
          or a vibrant city escape, we make it easy for you to find and book the perfect trip.</p>
        <div className="sm:p-20 w-full mx-auto items-center flex">
          <SearchFilter onSearch={handleSearch} />
          {/* <SearchFilter onSearch={handleSearch} /> */}
        </div>
      </div>
    </div>
  );
};

export default Hero;
