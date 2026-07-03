"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Thanks! Your message has been sent. We will get back to you shortly.");
    e.target.reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-main">
      <main className="flex-grow max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Left: Contact Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">Get in Touch</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
              Whether you're looking to adopt, want to list your shelter, or just have a question about how Rofrof works, we're here to help.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Email Us</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">support@Rofrof.pl</p>
                  <p className="text-gray-500 text-sm mt-1">We aim to reply within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Call Us</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">+48 123 456 789</p>
                  <p className="text-gray-500 text-sm mt-1">Mon-Fri from 8am to 5pm.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Office Location</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Warsaw, Poland</p>
                  <p className="text-gray-500 text-sm mt-1">Available for partner shelter meetings by appointment.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-gray-50 dark:bg-dark-card p-8 rounded-3xl border border-gray-200 dark:border-dark-divider">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send a Message</h2>

            {status ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                {status}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-white dark:bg-dark-raised focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-white dark:bg-dark-raised focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-white dark:bg-dark-raised focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>General Inquiry</option>
                    <option>Adoption Question</option>
                    <option>Shelter Partnership</option>
                    <option>Technical Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea required rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-white dark:bg-dark-raised focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="How can we help?"></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" /> Send Message
                </button>
              </form>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
