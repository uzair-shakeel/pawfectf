"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-dark-panel text-white pt-20 pb-10 transition-colors duration-300 border-t border-gray-100 dark:border-gray-800">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold mb-4">O nas</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/website/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  O nas
                </Link>
              </li>
              <li>
                <Link
                  href="/website/pets"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Adoptuj
                </Link>
              </li>


            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Informacje</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/website/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kontakt
                </Link>
              </li>
              <li>
                <Link
                  href="/website/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>

              <li>
                <Link
                  href="/website/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Polityka prywatności
                </Link>
              </li>
              <li>
                <Link
                  href="/website/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Regulamin
                </Link>
              </li>
            </ul>
          </div>

          <div></div>

          <div>
            <h3 className="font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subskrybuj nasz newsletter i otrzymuj najnowsze aktualności.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Wprowadź swój adres e-mail"
                className="bg-gray-800 border-gray-700 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500"
              />
              <button className="bg-white text-gray-900 dark:text-gray-200 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap">
                Subskrybuj
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center transition-colors duration-300">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="inline-block">
              <div className="relative w-48 h-14">
                <Image
                  src="/whitelogo.png"
                  alt="Rafraf Logo"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-gray-400 text-sm mt-2">
              All rights reserved © {new Date().getFullYear()} Rafraf.
              Wszelkie prawa zastrzeżone.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
