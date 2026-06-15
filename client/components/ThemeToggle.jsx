"use client";

import React from "react";
import { useTheme } from "../lib/theme/ThemeContext";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const ThemeToggle = ({ className = "", size = 24, showText = false }) => {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="w-6 h-6 animate-pulse bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`${className} flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <MdDarkMode size={size} className="text-gray-700 dark:text-gray-300" />
      ) : (
        <MdLightMode size={size} className="text-yellow-500" />
      )}
      {showText && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === "light" ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
