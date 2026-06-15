import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { Suspense } from "react";
import { GoogleMapsProvider } from "../lib/GoogleMapsContext";
import Providers from "../components/Providers";
import CookieConsent from "../components/website/CookieConsent";
import ErrorBoundary from "../components/ErrorBoundary";
import ScrollToTop from "../components/ScrollToTop";


export const metadata = {
  title: "Pawfect - Pet Adoption & Shelter Marketplace",
  description:
    "Find, adopt, and list pets on Pawfect - the ultimate pet adoption marketplace.",
};

export default function RootLayout({ children }) {
  // Check if we're in a static build environment
  const isStaticBuild = process.env.NEXT_PHASE === "phase-production-build";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body>
        <ErrorBoundary>

          <Providers>
            <GoogleMapsProvider>
              <ScrollToTop />
              {children}
            </GoogleMapsProvider>
          </Providers>
          <CookieConsent />
        </ErrorBoundary>
      </body>
    </html>
  );
}
