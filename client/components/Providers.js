"use client";

import { LanguageProvider } from "../lib/i18n/LanguageContext";
import { AuthProvider } from "../lib/auth/AuthContext";
import { ThemeProvider } from "../lib/theme/ThemeContext";
import { Toaster } from "react-hot-toast";
import { NotificationsProvider } from "../lib/notifications/NotificationsContext";
import dynamic from "next/dynamic";
import { SWRConfig } from "swr";
import { fetcher } from "../lib/fetcher";

// Lazy load CookieConsent since it's not critical for initial render
const CookieConsent = dynamic(() => import("../components/website/CookieConsent"), {
  ssr: false,
  loading: () => null
});

export default function Providers({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000, // Cache for 60 seconds
        errorRetryCount: 2,
        errorRetryInterval: 1000,
      }}
    >
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationsProvider>
              {children}
              
              <CookieConsent />

              <Toaster
              position="top-center"
              containerClassName="pointer-events-none fixed inset-0 z-[9999]"
              toastOptions={{
                // Base style
                className:
                  "pointer-events-auto rounded-xl shadow-lg ring-1 ring-black/10 dark:ring-white/10 bg-white/95 dark:bg-dark-card/95 text-gray-900 dark:text-gray-200 dark:text-gray-100 backdrop-blur px-4 py-3",
                duration: 3500,
                success: {
                  className:
                    "pointer-events-auto rounded-xl shadow-lg ring-1 ring-emerald-200/60 dark:ring-emerald-400/30 bg-emerald-50/90 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100",
                  iconTheme: { primary: "#10b981", secondary: "#ffffff" },
                },
                error: {
                  className:
                    "pointer-events-auto rounded-xl shadow-lg ring-1 ring-rose-200/60 dark:ring-rose-400/30 bg-rose-50/90 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100",
                  iconTheme: { primary: "#f43f5e", secondary: "#ffffff" },
                },
              }}
            />

            {/* Fallback if you're not using Tailwind */}
            <style jsx global>{`
            #_rht_toaster {
              pointer-events: none !important;
              z-index: 9999 !important;
            }
            #_rht_toaster > * {
              pointer-events: auto !important;
            }
          `}</style>
          </NotificationsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
    </SWRConfig>
  );
}
