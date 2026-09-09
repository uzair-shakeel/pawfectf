"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="marketing-ui bg-[#0F172A] text-white pt-16 pb-8">
      <div className="mx-auto w-full max-w-[1520px] px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-44">
                <Image
                  src="/whitelogo.png"
                  alt="Rafraf Logo"
                  fill
                  className="object-contain object-left brightness-0 invert"
                />
              </div>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              {t(
                "homepage.whyAdopt.lead",
                "Adoption changes two lives at once - the pet you take home, and the one that takes its place at the shelter."
              )}
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold">
              {t("footer.about.title", "About Rafraf")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/55">
              <li>
                <Link href="/website/about" className="transition-colors hover:text-white">
                  {t("footer.about.links.aboutUs", "About Us")}
                </Link>
              </li>
              <li>
                <Link href="/website/pets" className="transition-colors hover:text-white">
                  {t("navbar.links.adopt", "Adopt")}
                </Link>
              </li>
              <li>
                <Link href="/website/lost-found" className="transition-colors hover:text-white">
                  {t("navbar.links.lostFound", "Lost & Found")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold">
              {t("footer.other.title", "Other")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/55">
              <li>
                <Link href="/website/contact" className="transition-colors hover:text-white">
                  {t("footer.other.links.contact", "Contact Us")}
                </Link>
              </li>
              <li>
                <Link href="/website/faq" className="transition-colors hover:text-white">
                  {t("footer.other.links.faq", "Help/FAQ")}
                </Link>
              </li>
              <li>
                <Link href="/website/privacy" className="transition-colors hover:text-white">
                  {t("footer.other.links.privacy", "Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link href="/website/terms" className="transition-colors hover:text-white">
                  {t("footer.other.links.terms", "Terms & Conditions")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold">
              {t("footer.newsletter.title", "Newsletter")}
            </h3>
            <p className="mt-5 mb-4 text-sm leading-relaxed text-white/55">
              {t("footer.newsletter.description", "Subscribe to our newsletter and get exclusive updates on new pets.")}
            </p>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder={t("footer.newsletter.placeholder", "Enter your email")}
                className="w-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#2563EB]"
              />
              <button
                type="submit"
                className="bg-[#2563EB] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#1D4ED8] whitespace-nowrap"
              >
                {t("footer.newsletter.button", "Subscribe")}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 pt-8 md:flex-row">
          <p className="text-sm text-white/40">
            {t("footer.copyright", `© ${new Date().getFullYear()} Rafraf. All rights reserved.`)}
          </p>
          <div className="flex gap-4">
            {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, index) => (
              <Link
                key={index}
                href="#"
                className="text-white/40 transition-colors hover:text-[#93C5FD]"
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
