"use client";

import React, { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

export default function FAQPage() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(0);

  const faqs = [
    {
      question: t("dashboard.faq.questions.adoptionProcess.q", "How does the adoption process work?"),
      answer: t("dashboard.faq.questions.adoptionProcess.a", "The process starts with finding a pet you love on our platform. You can use our messaging system to contact the shelter or private owner directly to ask questions, schedule a meet-and-greet, and discuss adoption requirements. Each shelter or owner has their own specific adoption application and screening process.")
    },
    {
      question: t("dashboard.faq.questions.adoptionFee.q", "What is included in the adoption fee?"),
      answer: t("dashboard.faq.questions.adoptionFee.a", "Adoption fees vary by shelter and owner. Typically, fees cover the cost of care the animal received, including vaccinations, spaying/neutering, microchipping, and veterinary checkups. You can see the specific fee and health status listed on each pet's profile.")
    },
    {
      question: t("dashboard.faq.questions.health.q", "Are the pets healthy and vaccinated?"),
      answer: t("dashboard.faq.questions.health.a", "We encourage all listers to provide full medical histories. You can see badges on pet profiles for 'Vaccinated', 'Neutered/Spayed', 'Microchipped', and 'Vet Checked'. Always ask the current owner or shelter for official veterinary records during the adoption process.")
    },
    {
      question: t("dashboard.faq.questions.listing.q", "Can I list my own pet for adoption?"),
      answer: t("dashboard.faq.questions.listing.a", "Yes. While we partner with many shelters, individuals who need to rehome their pets can also create a private owner account to list their animals, ensuring they find a loving new home.")
    },
    {
      question: t("dashboard.faq.questions.transport.q", "Do you offer transportation for pets?"),
      answer: t("dashboard.faq.questions.transport.a", "Rafraf is a listing platform to connect you with pets. Transportation is typically arranged directly between the adopter and the shelter or current owner. Some rescues may offer transport services for an additional fee.")
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-main">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">{t("dashboard.faq.title", "Frequently Asked Questions")}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t("dashboard.faq.subtitle", "Everything you need to know about adopting a pet through Rafraf.")}</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 dark:border-dark-divider rounded-2xl overflow-hidden bg-gray-50 dark:bg-dark-card transition-all">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <span className="text-lg">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-blue-500 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>

              <div className={`px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed transition-all ${open === i ? "block" : "hidden"}`}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-8 md:p-12 text-center border border-blue-100 dark:border-blue-800/50">
          <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("dashboard.faq.stillHaveQuestions", "Still have questions?")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t("dashboard.faq.supportText", "Our support team is here to help you find your perfect companion.")}</p>
          <Link href="/website/contact" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            {t("dashboard.faq.contactSupport", "Contact Support")}
          </Link>
        </div>
      </main>
    </div>
  );
}
