import { Nunito, Figtree } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import ErrorBoundary from "../components/ErrorBoundary";
import ScrollToTop from "../components/ScrollToTop";

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata = {
  title: "RafRaf - Psia Adopcja & Pomoc Zwierzakom",
  description:
    "Znajdź, adoptuj, wystaw zwierzaki na Rafraf - Najlepsza platforma do adopcji i pomocy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" suppressHydrationWarning className={`${nunito.variable} ${figtree.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={figtree.className}>
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
