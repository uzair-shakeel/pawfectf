"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Gauge, Banknote, FileText, Globe } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";

interface Step03Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step03_RequiredBasics({ formData, updateFormData, nextStep, prevStep }: Step03Props) {

    const canProceed =
        formData.mileage &&
        formData.price &&
        formData.registrationStatus &&
        formData.saleDocument;

    return (
        <div className="space-y-6">
            <QuestionCard
                title="Key Details"
                subtitle="These are the most important details for buyers."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Mileage */}
                    <div className="col-span-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mileage (km) *
                        </label>
                        <div className="relative">
                            <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                value={formData.mileage ? formData.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/,/g, "");
                                    if (/^\d*$/.test(val)) {
                                        updateFormData({ mileage: val });
                                    }
                                }}
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Asking Price *
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    value={formData.price ? formData.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, "");
                                        if (/^\d*$/.test(val)) {
                                            updateFormData({ price: val });
                                        }
                                    }}
                                    placeholder="0"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <select
                                value={formData.currency || "PLN"}
                                onChange={(e) => updateFormData({ currency: e.target.value })}
                                className="w-24 px-3 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                            >
                                <option value="PLN">PLN</option>
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>

                    {/* If Transmission/Drivetrain missing from Step 2, ask here */}
                    {!formData.transmission && (
                        <div className="col-span-1 space-y-2 animate-in fade-in slide-in-from-top-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transmission</label>
                            <select
                                value={formData.transmission || ""}
                                onChange={(e) => updateFormData({ transmission: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select...</option>
                                <option value="Manual">Manual</option>
                                <option value="Automatic">Automatic</option>
                                <option value="CVT">CVT/e-CVT</option>
                                <option value="Semi-Automatic">Semi-Automatic</option>
                            </select>
                        </div>
                    )}

                    {!formData.drivetrain && (
                        <div className="col-span-1 space-y-2 animate-in fade-in slide-in-from-top-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Drivetrain</label>
                            <select
                                value={formData.drivetrain || ""}
                                onChange={(e) => updateFormData({ drivetrain: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select...</option>
                                <option value="FWD">Front Wheel Drive (FWD)</option>
                                <option value="RWD">Rear Wheel Drive (RWD)</option>
                                <option value="AWD">All Wheel Drive (AWD/4x4)</option>
                            </select>
                        </div>
                    )}

                    {/* Registration Status */}
                    <div className="col-span-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Registration Status *
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <select
                                value={formData.registrationStatus || ""}
                                onChange={(e) => updateFormData({ registrationStatus: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="">Select status...</option>
                                <option value="Registered in PL">Registered in Poland</option>
                                <option value="Import pending">Import pending</option>
                                <option value="Not registered">Not registered</option>
                                <option value="Registered abroad">Registered abroad</option>
                            </select>
                        </div>
                    </div>

                    {/* Sale Documents */}
                    <div className="col-span-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sale Document Type *
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <select
                                value={formData.saleDocument || ""}
                                onChange={(e) => updateFormData({ saleDocument: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="">Select document type...</option>
                                <option value="VAT 23%">Full VAT Invoice (23%)</option>
                                <option value="VAT Margin">VAT Margin Invoice</option>
                                <option value="Private Sale Agreement">Private Sale Agreement</option>
                            </select>
                        </div>
                    </div>

                </div>
            </QuestionCard>

            {/* Navigation - Static */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={prevStep}
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <button
                    onClick={nextStep}
                    disabled={!canProceed}
                    className={`px-8 py-2.5 rounded-lg font-bold text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg ${canProceed
                        ? "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
                        : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50"
                        }`}
                >
                    Next Step <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            <div className="h-8" />
        </div>
    );
}
