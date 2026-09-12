"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme/ThemeContext";

const ThemeToggle = ({ className = "", showText = false, size = "md" }) => {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";
  const isSm = size === "sm";
  const box = isSm ? "h-9 w-16" : "h-10 w-[4.5rem]";
  const icon = isSm ? "h-3.5 w-3.5" : "h-4 w-4";

  if (!mounted) {
    return (
      <div className={`${className} ${box} border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-[#303030]`} />
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      className={`${className} inline-flex items-center gap-2`}
      aria-label={isDark ? "Włącz tryb jasny" : "Włącz tryb ciemny"}
      title={isDark ? "Tryb jasny" : "Tryb ciemny"}
    >
      {showText && (
        <span className="text-sm font-medium text-[#64748B] dark:text-gray-400">
          {isDark ? "Ciemny" : "Jasny"}
        </span>
      )}
      <span className={`relative grid ${box} shrink-0 grid-cols-2 border border-[#E2E8F0] bg-white dark:border-[#494952] dark:bg-[#303030]`}>
        <span
          className={`absolute inset-y-0 left-0 w-1/2 bg-[#2563EB] transition-transform duration-200 ease-out ${
            isDark ? "translate-x-full" : "translate-x-0"
          }`}
        />
        <span className={`relative z-10 flex items-center justify-center ${isDark ? "text-[#94A3B8]" : "text-white"}`}>
          <Sun className={`block ${icon}`} strokeWidth={2} />
        </span>
        <span className={`relative z-10 flex items-center justify-center ${isDark ? "text-white" : "text-[#94A3B8]"}`}>
          <Moon className={`block ${icon}`} strokeWidth={2} />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
