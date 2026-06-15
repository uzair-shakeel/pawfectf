"use client";

import { useLanguage } from "../lib/i18n/LanguageContext";
import Image from "next/image";
import { useState } from "react";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex justify-between bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md cursor-pointer transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isHovered ? "80px" : "38px",
        height: "38px",
      }}
    >
      {/* US Flag */}
      <button
        onClick={() => changeLanguage("en")}
        className={`absolute w-8 h-8 rounded-full overflow-hidden transition-all duration-300 ease-in-out border-2 ${
          language === "en" ? "border-blue-500 z-20 " : "border-white/50 z-10"
        }`}
        style={{
          left:
            language === "en"
              ? isHovered
                ? "4px"
                : "4px"
              : isHovered
              ? "44px"
              : "4px",
          top: "4px",
          opacity: language === "en" || isHovered ? 1 : 0,
          transform: language === "en" || isHovered ? "scale(1)" : "scale(0.8)",
          boxShadow:
            language === "en"
              ? "0 0 8px rgba(59, 130, 246, 0.5)"
              : "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Image
          src="/us-flag.svg"
          alt="English"
          width={32}
          height={32}
          className="object-cover"
        />
      </button>

      {/* Poland Flag */}
      <button
        onClick={() => changeLanguage("pl")}
        className={`absolute w-8 h-8 rounded-full overflow-hidden transition-all duration-300 ease-in-out border-2 ${
          language === "pl" ? "border-blue-200 z-20" : "border-white/50 z-10"
        }`}
        style={{
          left:
            language === "pl"
              ? isHovered
                ? "4px"
                : "4px"
              : isHovered
              ? "44px"
              : "4px",
          top: "4px",
          opacity: language === "pl" || isHovered ? 1 : 0,
          transform: language === "pl" || isHovered ? "scale(1)" : "scale(0.8)",
          boxShadow:
            language === "pl"
              ? "0 0 8px rgba(59, 130, 246, 0.5)"
              : "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Image
          src="/poland-flag.svg"
          alt="Polski"
          width={32}
          height={32}
          className="object-cover"
        />
      </button>
    </div>
  );
}
