"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";
import ThemeToggle from "../ThemeToggle";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isSmallDevice, setIsSmallDevice] = useState(false); // New state for screen size
  const router = useRouter();
  const { isSignedIn, logout } = useAuth();

  const navLinks = isSignedIn ? ["FAQs", "Plans"] : ["FAQs", "Plans", "Login"];

  // Detect screen size and scroll
  useEffect(() => {
    const handleResize = () => {
      setIsSmallDevice(window.innerWidth < 768); // md breakpoint is typically 768px
    };

    const handleScroll = () => {
      if (!isSmallDevice) {
        setIsScrolled(window.scrollY > 100); // Only apply scroll logic on larger screens
      }
    };

    // Initial check
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSmallDevice]);

  // IntersectionObserver logic (unchanged)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -20% 0px",
      threshold: 0.4,
    };

    const observerCallback = (entries: any[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    navLinks.forEach((link) => {
      const element = document.getElementById(link.toLowerCase());
      if (element) {
        element.classList.add("section-observed");
        observer.observe(element);
      }
    });

    return () => {
      navLinks.forEach((link) => {
        const element = document.getElementById(link.toLowerCase());
        if (element) {
          element.classList.remove("section-observed");
          observer.unobserve(element);
        }
      });
    };
  }, [navLinks]);

  return (
    <header className="fixed top-5 left-0 right-0 z-50">
      <div
        className={`
          mx-auto 
          shadow-md
          p-1 z-50 relative min-w-0
          transition-all duration-700 ease-in-out
          ${
            isSmallDevice || isScrolled
              ? "max-w-[600px] scale-95 rounded-full bg-white/80 backdrop-blur-sm"
              : "max-w-6xl scale-100 rounded-full bg-white"
          }
        `}
      >
        <div className="py-[10px] px-[15px] flex items-center justify-between gap-4 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-32 h-10">
              <Image
                src="/logo.png"
                alt="Ojest Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-[5px]">
            {navLinks.map((link) => (
              <Link
                key={link}
                href={`#${link.toLowerCase()}`}
                className={`
                  px-5 py-2 font-medium text-sm
                  transition-all duration-300 ease-in-out rounded-[50px]
                  ${
                    activeSection === link.toLowerCase()
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-blue-600"
                  }
                `}
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Theme Toggle and CTA Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle size={20} />
            
            {isSignedIn ? (
              <>
                <button
                  onClick={() => router.push("/dashboard/home")}
                  className={`
                    transition-all duration-300 ease-in-out
                    ${
                      isSmallDevice || isScrolled
                        ? "bg-blue-600 text-white px-4 py-2 rounded-full"
                        : "text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white"
                    }
                  `}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className={`
                    transition-all duration-300 ease-in-out
                    ${
                      isSmallDevice || isScrolled
                        ? "bg-gray-800 text-white px-4 py-2 rounded-full"
                        : "text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`
                  transition-all duration-300 ease-in-out
                  ${
                    isSmallDevice || isScrolled
                      ? "bg-blue-600 text-white p-[10px] rounded-full flex items-center justify-center"
                      : "text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white"
                  }
                `}
              >
                {isSmallDevice || isScrolled ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ) : (
                  "Become a Seller"
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
