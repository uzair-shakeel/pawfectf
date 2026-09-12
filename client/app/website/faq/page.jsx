"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import MarketingHero from "../../../components/website/MarketingHero";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const FALLBACK_FAQS = [
  {
    question: "Jak wystawić zwierzę do adopcji?",
    answer: "Utwórz konto lub zaloguj się, a następnie dodaj ogłoszenie ze zdjęciami i szczegółami zwierzęcia.",
  },
  {
    question: "Czy wystawienie ogłoszenia jest płatne?",
    answer: "Podstawowe ogłoszenia adopcyjne są darmowe.",
  },
];

export default function FAQPage() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(0);
  const questions = t("faq.questions", { returnObjects: true });
  const faqs = Array.isArray(questions) ? questions : FALLBACK_FAQS;

  return (
    <div className="marketing-ui min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <MarketingHero
        compact
        eyebrow="FAQ"
        title={t("faq.hero.title", "Często zadawane pytania")}
        subtitle={t("faq.hero.subtitle", "Znajdź odpowiedzi na popularne pytania dotyczące naszej platformy adopcyjnej.")}
      />

      <div className="mx-auto w-full max-w-[920px] px-4 py-12 sm:px-8 md:py-16">
        <div className="border-y border-[#E2E8F0] dark:border-dark-divider">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question} className={i > 0 ? "border-t border-[#E2E8F0] dark:border-dark-divider" : ""}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-start justify-between gap-6 py-6 text-left md:py-7"
                >
                  <span className="flex min-w-0 items-start gap-4">
                    <span className="font-display shrink-0 text-lg font-bold text-[#2563EB] md:text-xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg font-bold leading-snug text-[#0F172A] dark:text-white md:text-[1.35rem]">
                      {faq.question}
                    </span>
                  </span>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 shrink-0 text-[#2563EB] transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-start gap-4 pb-7">
                      <span className="font-display invisible shrink-0 text-lg font-bold md:text-xl" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p
                        className={`text-[16px] leading-relaxed text-[#64748B] transition-opacity duration-300 ease-out dark:text-gray-400 ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="border-b border-white/10 bg-[#0F172A] text-white">
        <div className="mx-auto max-w-[920px] px-4 py-14 text-center sm:px-8 md:py-16">
          <h2 className="font-display text-[2rem] font-bold md:text-[2.6rem]">
            {t("faq.moreQuestions.title", "Więcej pytań?")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">
            {t("faq.moreQuestions.description", "Jeśli nie możesz znaleźć odpowiedzi na swoje pytanie, skontaktuj się z naszym zespołem wsparcia.")}
          </p>
          <Link
            href="/website/contact"
            className="mt-8 inline-flex items-center justify-center !bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] !text-[#0F172A]"
          >
            {t("faq.moreQuestions.contactButton", "Skontaktuj się z Pomocą")}
          </Link>
        </div>
      </section>
    </div>
  );
}
