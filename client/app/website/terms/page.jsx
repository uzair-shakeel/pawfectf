"use client";

import React from "react";
import Link from "next/link";
import MarketingHero from "../../../components/website/MarketingHero";
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

export default function TermsPage() {
  const { t } = useLanguage();
  const definitions = objectValues(t("terms.sections.definitions.items"));
  const listingRules = arrayValues(t("terms.sections.listingRules.items", { returnObjects: true }));
  const prohibited = arrayValues(t("terms.sections.prohibitedActivities.items", { returnObjects: true }));

  return (
    <div className="marketing-ui min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <MarketingHero
        compact
        eyebrow="Regulamin"
        title={t("terms.hero.title", "Jasne warunki. Bezpieczne adopcje.")}
        subtitle={`${t("terms.lastUpdated", "Ostatnia aktualizacja")}: wrzesień 2026`}
      />

      <div className="mx-auto w-full max-w-[860px] px-4 py-10 sm:px-8 md:py-14">
        <LegalBlock title={t("terms.sections.introduction.title")}>
          <p>{t("terms.sections.introduction.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.definitions.title")}>
          <ul className="list-disc space-y-2 pl-5">
            {definitions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.accountRegistration.title")}>
          <p>{t("terms.sections.accountRegistration.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.listingRules.title")}>
          <p>{t("terms.sections.listingRules.intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            {listingRules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.prohibitedActivities.title")}>
          <p>{t("terms.sections.prohibitedActivities.intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            {prohibited.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.feesAndPayments.title")}>
          <p>{t("terms.sections.feesAndPayments.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.intellectualProperty.title")}>
          <p>{t("terms.sections.intellectualProperty.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.privacy.title")}>
          <p>{t("terms.sections.privacy.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.limitationOfLiability.title")}>
          <p>{t("terms.sections.limitationOfLiability.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.disputeResolution.title")}>
          <p>{t("terms.sections.disputeResolution.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.termination.title")}>
          <p>{t("terms.sections.termination.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.changes.title")}>
          <p>{t("terms.sections.changes.content")}</p>
        </LegalBlock>

        <LegalBlock title={t("terms.sections.contact.title")}>
          <p>{t("terms.sections.contact.intro")}</p>
          <p>{t("terms.sections.contact.email")}</p>
          <p>{t("terms.sections.contact.address")}</p>
        </LegalBlock>

        <div className="flex flex-col gap-3 border-t border-[#E2E8F0] pt-8 dark:border-dark-divider sm:flex-row">
          <Link
            href="/website/privacy"
            className="inline-flex items-center justify-center bg-[#2563EB] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-[#1D4ED8]"
          >
            Polityka prywatności
          </Link>
          <Link
            href="/website/contact"
            className="inline-flex items-center justify-center border border-[#0F172A] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-[#0F172A] dark:border-white dark:text-white"
          >
            {t("terms.haveQuestions", "Masz pytania? Skontaktuj się z nami")}
          </Link>
        </div>
      </div>
    </div>
  );
}
