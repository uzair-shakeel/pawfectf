"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(t("dashboard.contact.successMessage", "Thanks! Your message has been sent. We will get back to you shortly."));
    e.target.reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-main">
      <main className="flex-grow max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Left: Contact Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">{t("dashboard.contact.title", "Get in Touch")}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
              {t("dashboard.contact.subtitle", "Whether you're looking to adopt, want to list your shelter, or just have a question about how Rafraf works, we're here to help.")}
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("dashboard.contact.emailUs", "Email Us")}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{t("dashboard.contact.email", "support@Rafraf.pl")}</p>
                  <p className="text-gray-500 text-md mt-1">{t("dashboard.contact.emailResponse", "We aim to reply within 24 hours.")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("dashboard.contact.callUs", "Call Us")}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{t("dashboard.contact.phone", "+48 123 456 789")}</p>
                  <p className="text-gray-500 text-md mt-1">{t("dashboard.contact.phoneHours", "Mon-Fri from 8am to 5pm.")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("dashboard.contact.officeLocation", "Office Location")}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{t("dashboard.contact.location", "Warsaw, Poland")}</p>
                  <p className="text-gray-500 text-md mt-1">{t("dashboard.contact.locationNote", "Available for partner shelter meetings by appointment.")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-gray-50 dark:bg-dark-card p-8 rounded-3xl border border-gray-200 dark:border-dark-divider">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t("dashboard.contact.sendMessage", "Send a Message")}</h2>

            {status ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                {status}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">{t("dashboard.contact.name", "Name")}</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-white dark:bg-dark-raised focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">{t("dashboard.contact.email", "Email")}</label>
                  <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-white dark:bg-dark-raised focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">{t("dashboard.contact.subject", "Subject")}</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-white dark:bg-dark-raised focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>{t("dashboard.contact.subjects.general", "General Inquiry")}</option>
                    <option>{t("dashboard.contact.subjects.adoption", "Adoption Question")}</option>
                    <option>{t("dashboard.contact.subjects.partnership", "Shelter Partnership")}</option>
                    <option>{t("dashboard.contact.subjects.technical", "Technical Support")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">{t("dashboard.contact.message", "Message")}</label>
                  <textarea required rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-white dark:bg-dark-raised focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="How can we help?"></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" /> {t("dashboard.contact.sendButton", "Send Message")}
                </button>
              </form>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
