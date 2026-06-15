"use client";

import { createContext, useContext, useState, useEffect } from "react";
import enTranslations from "../../app/i18n/locales/en/translation.json";
import plTranslations from "../../app/i18n/locales/pl/translation.json";
import enBlogTranslations from "../../app/i18n/locales/en/blog.json";
import plBlogTranslations from "../../app/i18n/locales/pl/blog.json";

// Define translations
const translations = {
  en: {
    translation: enTranslations,
    blog: enBlogTranslations,
  },
  pl: {
    translation: plTranslations,
    blog: plBlogTranslations,
  },
};

// Create the context
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default to Polish (falls back to saved/browser preference if present)
  const [language, setLanguage] = useState("pl");
  // Track if we're on client side for localStorage access
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Try to load language preference from localStorage on client side
  useEffect(() => {
    if (isClient) {
      const savedLanguage = localStorage.getItem("language");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split("-")[0];
        if (browserLang === "pl") {
          setLanguage("pl");
        }
      }
    }
  }, [isClient]);

  // Function to change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    if (isClient) {
      localStorage.setItem("language", lang);
    }
  };

  // Get translation for a key with nested support and namespace
  const t = (key, options = {}) => {
    try {
      const [namespace, ...keyParts] = key.split(":");
      const translationKey = keyParts.length ? keyParts.join(":") : namespace;
      const translationNamespace = keyParts.length ? namespace : "translation";

      const result = translationKey
        .split(".")
        .reduce(
          (obj, i) => obj[i],
          translations[language][translationNamespace]
        );

      if (options.returnObjects && Array.isArray(result)) {
        return result;
      }

      return result || key;
    } catch (e) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        isClient,
        currentLanguage: language,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
