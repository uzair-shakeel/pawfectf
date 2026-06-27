import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { Suspense } from "react";
import Providers from "../components/Providers";
import ErrorBoundary from "../components/ErrorBoundary";
import ScrollToTop from "../components/ScrollToTop";


export const metadata = {
  title: "Pawfect - Pet Adoption & Shelter Marketplace",
  description:
    "Find, adopt, and list pets on Pawfect - the ultimate pet adoption marketplace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        <ErrorBoundary>
          <Providers>
            <ScrollToTop />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
