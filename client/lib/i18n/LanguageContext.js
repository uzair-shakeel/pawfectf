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
    dashboard: enTranslations.dashboard,
  },
  pl: {
    translation: plTranslations,
    blog: plBlogTranslations,
    dashboard: plTranslations.dashboard,
  },
};

// Create the context
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("pl");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLanguage("pl");
    try {
      localStorage.setItem("language", "pl");
    } catch {
      // ignore storage errors
    }
  }, []);

  // Function to change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    if (isClient) {
      localStorage.setItem("language", lang);
    }
  };

  // Get translation for a key with nested support and namespace
  const t = (key, fallbackOrOptions = {}) => {
    try {
      const options = typeof fallbackOrOptions === 'string' 
        ? { defaultValue: fallbackOrOptions } 
        : fallbackOrOptions;
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

      return result || options.defaultValue || key;
    } catch (e) {
      console.warn(`Translation key not found: ${key}`);
      return typeof fallbackOrOptions === 'string' ? fallbackOrOptions : fallbackOrOptions?.defaultValue || key;
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
