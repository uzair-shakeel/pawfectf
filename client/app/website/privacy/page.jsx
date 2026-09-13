"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

function objectValues(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? Object.values(value) : [];
}

function arrayValues(value) {
  return Array.isArray(value) ? value : [];
}

function LegalBlock({ title, children }) {
  return (
    <section className="border-t border-[#E2E8F0] py-8 dark:border-dark-divider md:py-10">
      <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">{title}</h2>
      <div className="mt-4 space-y-3 text-[16px] leading-relaxed text-[#64748B] dark:text-gray-400">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const { t } = useLanguage();
  const collectItems = objectValues(t("privacy.sections.informationWeCollect.items"));
  const howCollect = arrayValues(t("privacy.sections.howWeCollect.items", { returnObjects: true }));
  const howUse = arrayValues(t("privacy.sections.howWeUse.items", { returnObjects: true }));
  const cookieTypes = objectValues(t("privacy.sections.cookies.types"));

  return (
    <div className="marketing-ui min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <div className="mx-auto w-full max-w-[860px] px-4 py-10 sm:px-8 md:py-14">
        <h1 className="font-display text-[2rem] font-bold leading-tight text-[#0F172A] dark:text-white md:text-[2.4rem]">
          {t("privacy.hero.title", "Twoje dane — zawsze bezpieczne, zawsze prywatne.")}
        </h1>
        <p className="mt-3 text-sm text-[#64748B] dark:text-gray-400">
          {t("terms.lastUpdated", "Ostatnia aktualizacja")}: wrzesień 2026
        </p>
        <LegalBlock title={t("privacy.sections.introduction.title")}>
          <p>{t("privacy.sections.introduction.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("privacy.sections.informationWeCollect.title")}>
          <p>{t("privacy.sections.informationWeCollect.intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            {collectItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </LegalBlock>

        <LegalBlock title={t("privacy.sections.howWeCollect.title")}>
          <p>{t("privacy.sections.howWeCollect.intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            {howCollect.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </LegalBlock>

        <LegalBlock title={t("privacy.sections.howWeUse.title")}>
          <p>{t("privacy.sections.howWeUse.intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            {howUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </LegalBlock>

        <LegalBlock title={t("privacy.sections.cookies.title")}>
          <p>{t("privacy.sections.cookies.content")}</p>
          <p>{t("privacy.sections.cookies.intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            {cookieTypes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{t("privacy.sections.cookies.control")}</p>
        </LegalBlock>

        <div className="flex flex-col gap-3 border-t border-[#E2E8F0] pt-8 dark:border-dark-divider sm:flex-row">
          <Link
            href="/website/terms"
            className="inline-flex items-center justify-center bg-[#2563EB] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-[#1D4ED8]"
          >
            {t("privacy.viewTerms", "Zobacz warunki korzystania")}
          </Link>
          <Link
            href="/website/contact"
            className="inline-flex items-center justify-center border border-[#0F172A] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-[#0F172A] dark:border-white dark:text-white"
          >
            {t("privacy.contactUs", "Skontaktuj się z nami")}
          </Link>
        </div>
      </div>
    </div>
  );
}
