"use client";

import React from "react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-main">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: June 2026</p>
        </div>

        <div className="prose prose-blue max-w-none dark:prose-invert">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Welcome to Rofrof. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. The Data We Collect</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, email address and telephone numbers.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            <li><strong>Profile Data</strong> includes your username and password, adoptions you have inquired about, your interests, preferences, and feedback.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. How We Use Your Data</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to facilitate connections between potential adopters and shelters/private owners, manage your account, and improve our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Data Security</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </div>
      </main>
    </div>
  );
}
