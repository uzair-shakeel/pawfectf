"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-main">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Terms & Conditions</h1>
          <p className="text-gray-500">Last updated: June 2026</p>
        </div>

        <div className="prose prose-blue max-w-none dark:prose-invert">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            By accessing and using Rafraf, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Rafraf provides an online platform that connects potential pet adopters with animal shelters, rescues, and private individuals looking to rehome pets. Rafraf does not own, breed, or sell animals. We are solely a facilitator of communication.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. User Responsibilities</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Users agree to provide accurate information when creating an account, listing a pet, or applying for adoption. Sellers and shelters are responsible for ensuring all health and behavioral information provided about an animal is accurate to the best of their knowledge. Adopters are responsible for understanding the commitment of pet ownership before adopting.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Adoption Process & Fees</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Rafraf does not process adoption fees directly. All financial transactions, adoption agreements, and health guarantees are strictly between the adopter and the listing shelter or private owner. Rafraf is not liable for any disputes, health issues, or behavioral problems that arise post-adoption.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Prohibited Conduct</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Users may not use Rafraf to sell animals for commercial breeding (puppy mills), illegal activities, or fighting. Any user found violating these terms will be permanently banned from the platform and reported to appropriate animal welfare authorities.
          </p>
        </div>
      </main>
    </div>
  );
}
