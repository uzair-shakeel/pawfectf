"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { getPetsByUserId, deletePet } from "../../../services/petService";
import PetCard from "../../../components/website/PetCard";
import Link from 'next/link';
import { useLanguage } from "../../../lib/i18n/LanguageContext";

export default function DashboardPetsPage() {
  const { t } = useLanguage();
  const { user, getToken, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState([]);

  const loadPets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getPetsByUserId(userId, getToken);
      setPets(response);
    } catch (error) {
      console.error("Error loading pets:", error);
      setPets([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, getToken]);

  const handleDelete = async (petId) => {
    if (!window.confirm(t("dashboard:myPets.confirmDelete", "Are you sure you want to delete this pet listing?"))) return;
    try {
      await deletePet(petId, getToken);
      loadPets();
    } catch (error) {
      alert("Failed to delete pet: " + (error?.message || error));
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadPets();
  }, [userId, loadPets]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-dark-main">
        <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium">{t("dashboard:myPets.loading", "Loading...")}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto dark:bg-dark-main">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 md:gap-0 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t("dashboard:myPets.title", "My Pets")}</h1>
          <p className="text-gray-500 mt-2 font-medium">{t("dashboard:myPets.subtitle", "Manage your adoption listings.")}</p>
        </div>
        <Link
          href="/dashboard/cars/add"
          className="bg-blue-600 text-white px-4 sm:px-8 py-2 sm:py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex items-center gap-2 hover:-translate-y-1"
        >
          <span className="text-xl">+</span>
          {t("dashboard:myPets.addPet", "Add Pet")}
        </Link>
      </div>

      {pets && pets.length > 0 && pets.some((p) => p.status !== "Approved") && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 p-4 text-yellow-800 dark:text-yellow-200 flex items-start gap-3 shadow-sm"
        >
          <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h4 className="font-bold">{t("dashboard:myPets.pendingApproval", "Pending Approval")}</h4>
            <p className="text-md mt-1 opacity-90">{t("dashboard:myPets.pendingDesc", "Some of your listings are being reviewed. They will be visible to adopters once approved by an administrator.")}</p>
          </div>
        </motion.div>
      )}

      {pets.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 dark:bg-dark-card rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-divider">
          <div className="w-24 h-24 bg-white dark:bg-dark-raised rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-dark-divider">
            <svg className="h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("dashboard:myPets.noPets", "No pets listed yet")}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {t("dashboard:myPets.noPetsDesc", "You don't have any active listings. Create your first listing to help a pet find a home.")}
          </p>
          <Link
            href="/dashboard/cars/add"
            className="inline-flex items-center px-8 py-4 text-md font-bold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
          >
            {t("dashboard:myPets.createFirst", "Create First Listing")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {pets.map((pet) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={pet._id}
              className="group bg-white dark:bg-dark-panel rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-divider hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="mb-4 rounded-xl overflow-hidden shadow-inner flex-grow relative pointer-events-none">
                <PetCard pet={pet} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-dark-divider mt-auto">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("dashboard:myPets.status", "Status")}</span>
                  {pet.status === "Approved" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span> {t("dashboard:myPets.active", "Active")}
                    </span>
                  ) : pet.status === "Pending" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2 animate-pulse"></span> {t("dashboard:myPets.underReview", "Under Review")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span> {t("dashboard:myPets.rejected", "Rejected")}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(pet._id)}
                  className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm uppercase tracking-wider transition-all"
                >
                  {t("dashboard:myPets.delete", "Delete")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
