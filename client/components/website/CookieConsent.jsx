"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  BsEmojiLaughing,
  BsEmojiSunglasses,
  BsEmojiFrown,
} from "react-icons/bs";
import { FaCookieBite } from "react-icons/fa";
import { Cookie } from "lucide-react";

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [cookieEaten, setCookieEaten] = useState(false);
  const [cookieMessage, setCookieMessage] = useState("");
  const [cookieFace, setCookieFace] = useState(null);

  useEffect(() => {
    // Check if user has already made a choice
    const consentGiven = localStorage.getItem("cookieConsent");

    if (consentGiven === null) {
      // Wait a moment before showing the cookie banner
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setCookieEaten(true);
    setCookieMessage("Yum! You accepted our cookies. They were delicious!");
    setCookieFace(<BsEmojiSunglasses className="text-3xl text-yellow-500" />);

    setTimeout(() => {
      setShowConsent(false);
    }, 4000);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setCookieEaten(true);
    setCookieMessage(
      "You declined our cookies... the cookie monster is sad now 😢"
    );
    setCookieFace(<BsEmojiFrown className="text-3xl text-blue-500" />);

    setTimeout(() => {
      setShowConsent(false);
    }, 4000);
  };

  const funCookieMessages = [
    "Our cookies don't have calories!",
    "Cookie Monster says: Share cookies with website!",
    "These cookies won't make you gain weight, promise!",
    "Cookies that track, not the ones that snack!",
    "Accept our digital cookies (taste better than they sound)",
    "These cookies are GDPR-licious!",
    "No milk required for these cookies!",
  ];

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            {cookieEaten ? (
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="mb-4 flex justify-center"
                >
                  {cookieFace}
                </motion.div>
                <p className="text-gray-800 font-medium">{cookieMessage}</p>
              </div>
            ) : (
              <>
                <div className="relative p-6 pb-0">
                  <div className="absolute -top-10 -right-10 text-blue-100 text-[120px] opacity-10 transform rotate-12">
                    <FaCookieBite />
                  </div>

                  <div className="flex items-center mb-4">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        repeatType: "loop",
                      }}
                      className="mr-3 text-3xl text-amber-500"
                    >
                      <Cookie />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                      Czas Ciasteczek!
                    </h3>
                  </div>

                  <p className="text-gray-700 mb-2">
                    {
                      funCookieMessages[
                      Math.floor(Math.random() * funCookieMessages.length)
                      ]
                    }
                  </p>

                  <p className="text-gray-600 text-sm mb-4">
                    Do tych ciasteczek nie potrzebne jest mleko!
                    Używamy ciasteczek aby wzmocnić twoje doświadczenia podczas przeglądania, analizować ruch i dostarczać spersonalizowane treści. Klikając "Akceptuj Wszystkie", pozwalasz nam na swoje ciasteczka

                  </p>
                </div>

                <div className="flex flex-col sm:flex-row p-4 gap-2 bg-gray-50">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={acceptCookies}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <BsEmojiLaughing /> Akceptuj Wszystkie

                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={declineCookies}
                    className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Odrzuć <BsEmojiFrown />
                  </motion.button>
                </div>

                <div className="px-4 pb-4">
                  <button
                    onClick={() => window.open("/website/terms", "_blank")}
                    className="text-blue-600 text-sm font-medium hover:underline mr-4"
                  >
                    Warunki i Zasady
                  </button>
                  <button
                    onClick={() => window.open("/website/privacy", "_blank")}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Polityka Prywatności
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
