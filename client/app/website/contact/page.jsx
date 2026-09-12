"use client";

import React, { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import MarketingHero from "../../../components/website/MarketingHero";
import CustomSelect from "../../../components/website/CustomSelect";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-3 text-base outline-none focus:border-[#2563EB] dark:border-dark-divider dark:bg-dark-raised dark:text-white sm:px-4 sm:py-3.5";

export default function ContactPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState("");
  const [subject, setSubject] = useState("general");

  const subjectOptions = [
    { value: "general", label: t("contact.main.form.subjects.general", "Ogólne zapytanie") },
    { value: "adoption", label: t("contact.main.form.subjects.adoption", "Pytanie o adopcję") },
    { value: "partnership", label: t("contact.main.form.subjects.partnership", "Współpraca ze schroniskiem") },
    { value: "technical", label: t("contact.main.form.subjects.technical", "Pomoc techniczna") },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(t("contact.main.form.success.message", "Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe."));
    setSubject("general");
    e.target.reset();
  };

  const info = [
    {
      icon: Mail,
      title: t("dashboard.contact.emailUs", "Napisz do nas"),
      value: "support@rafraf.pl",
      note: t("dashboard.contact.emailResponse", "Staramy się odpowiadać w ciągu 24 godzin."),
    },
    {
      icon: Phone,
      title: t("dashboard.contact.callUs", "Zadzwoń do nas"),
      value: t("dashboard.contact.phone", "+48 123 456 789"),
      note: t("dashboard.contact.phoneHours", "Pon-Pt od 8:00 do 17:00."),
    },
    {
      icon: MapPin,
      title: t("dashboard.contact.officeLocation", "Lokalizacja biura"),
      value: t("dashboard.contact.location", "Warszawa, Polska"),
      note: t("dashboard.contact.locationNote", "Dostępne na spotkania ze schroniskami po umówieniu."),
    },
    {
      icon: Clock,
      title: "Godziny otwarcia",
      value: t("contact.main.info.hours.weekday", "Poniedziałek - Piątek: 9:00 - 18:00"),
      note: `${t("contact.main.info.hours.saturday", "Sobota: 10:00 - 16:00")} · ${t("contact.main.info.hours.sunday", "Niedziela: Zamknięte")}`,
    },
  ];

  return (
    <div className="marketing-ui min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <MarketingHero
        image="/home/cta-family.jpg"
        imageAlt={t("contact.main.title", "Kontakt")}
        compact
        eyebrow={t("contact.main.title", "Kontakt")}
        title={t("dashboard.contact.title", "Skontaktuj się z nami")}
        subtitle={t("dashboard.contact.subtitle")}
      />

      <div className="mx-auto grid w-full max-w-[1520px] grid-cols-1 gap-8 px-4 pb-28 pt-8 sm:px-8 sm:pb-16 md:gap-10 md:py-16 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
            {t("contact.main.info.title", "Informacje kontaktowe")}
          </p>
          <h2 className="font-display text-[1.65rem] font-bold leading-tight md:text-[2.6rem]">
            {t("contact.main.subtitle", "Masz pytania lub potrzebujesz pomocy? Jesteśmy tu, aby pomóc!")}
          </h2>

          <div className="mt-6 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0] dark:divide-dark-divider dark:border-dark-divider md:mt-10">
            {info.map(({ icon: Icon, title, value, note }) => (
              <div key={title} className="flex items-start gap-3 py-4 md:gap-4 md:py-6">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#0F172A] dark:text-white">{title}</h3>
                  <p className="mt-1 break-words text-[#0F172A] dark:text-gray-200">{value}</p>
                  <p className="mt-1 text-sm text-[#64748B]">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 border border-[#E2E8F0] bg-white p-5 dark:border-dark-divider dark:bg-dark-card sm:p-8">
          <h2 className="font-display text-[1.45rem] font-bold leading-tight md:text-[1.85rem]">
            {t("contact.main.form.title", "Wyślij nam wiadomość")}
          </h2>

          {status ? (
            <div className="mt-5 border-l-2 border-[#2563EB] bg-[#EEF2FF] px-4 py-4 dark:bg-white/5">
              <p className="font-display text-xl font-bold text-[#0F172A] dark:text-white">
                {t("contact.main.form.success.title", "Wiadomość wysłana!")}
              </p>
              <p className="mt-2 text-[#64748B] dark:text-gray-400">{status}</p>
              <button
                type="button"
                onClick={() => setStatus("")}
                className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-[#2563EB]"
              >
                {t("contact.main.form.success.button", "Wyślij kolejną wiadomość")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 sm:mt-6 sm:space-y-4">
              <div>
                <label className="text-sm font-semibold">{t("contact.main.form.fields.name", "Imię i nazwisko")}</label>
                <input
                  required
                  type="text"
                  className={fieldClass}
                  placeholder={t("contact.main.form.fields.namePlaceholder", "Jan Kowalski")}
                />
              </div>
              <div>
                <label className="text-sm font-semibold">{t("contact.main.form.fields.email", "Adres e-mail")}</label>
                <input
                  required
                  type="email"
                  className={fieldClass}
                  placeholder={t("contact.main.form.fields.emailPlaceholder", "jan@przyklad.pl")}
                />
              </div>
              <div>
                <label className="text-sm font-semibold">{t("contact.main.form.fields.subject", "Temat")}</label>
                <div className="mt-1.5">
                  <CustomSelect
                    variant="filter"
                    tone="light"
                    value={subject}
                    onChange={setSubject}
                    options={subjectOptions}
                    ariaLabel={t("contact.main.form.fields.subject", "Temat")}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">{t("contact.main.form.fields.message", "Wiadomość")}</label>
                <textarea
                  required
                  rows="4"
                  className={`${fieldClass} resize-none`}
                  placeholder={t("contact.main.form.fields.messagePlaceholder", "W czym możemy pomóc?")}
                />
              </div>
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#1D4ED8]"
              >
                <Send className="h-4 w-4" />
                {t("contact.main.form.submit", "Wyślij wiadomość")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
