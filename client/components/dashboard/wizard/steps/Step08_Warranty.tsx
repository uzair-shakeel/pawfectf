"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, ShieldAlert, Calendar, Gauge } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";

interface Step08Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step08_Warranty({ formData, updateFormData, nextStep, prevStep }: Step08Props) {
    const hasWarranty = formData.warranty?.hasWarranty;

    return (
        <div className="space-y-6">
            <QuestionCard title="Warranty Information" subtitle="A valid warranty significantly increases buyer confidence.">
                <div className="space-y-6">
                    {/* Has Warranty Toggle */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => updateFormData({ warranty: { ...formData.warranty, hasWarranty: false } })}
                            className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${hasWarranty === false
                                ? "bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500 shadow-inner"
                                : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                        >
                            <ShieldAlert className={`h-8 w-8 ${hasWarranty === false ? "text-gray-600 dark:text-gray-400" : "text-gray-400"}`} />
                            <span className="font-semibold text-gray-900 dark:text-white">No Warranty</span>
                        </button>

                        <button
                            onClick={() => updateFormData({ warranty: { ...formData.warranty, hasWarranty: true } })}
                            className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${hasWarranty === true
                                ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300 ring-1 ring-green-500 shadow-md"
                                : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                                }`}
                        >
                            <ShieldCheck className={`h-8 w-8 ${hasWarranty === true ? "text-green-500" : "text-gray-400"}`} />
                            <span className="font-semibold text-gray-900 dark:text-white">Valid Warranty</span>
                        </button>
                    </div>

                    {/* Warranty Details Form */}
                    <AnimatePresence>
                        {hasWarranty && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Warranty Type</label>
                                        <select
                                            value={formData.warranty?.type || "Factory"}
                                            onChange={(e) => updateFormData({
                                                warranty: { ...formData.warranty, type: e.target.value }
                                            })}
                                            className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                        >
                                            <option value="Factory">Manufacturer (Factory)</option>
                                            <option value="Extended">Extended (3rd Party/Dealer)</option>
                                            <option value="CPO">Certified Pre-Owned</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valid Until (Date)</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                type="date"
                                                value={formData.warranty?.validUntil || ""}
                                                onChange={(e) => updateFormData({
                                                    warranty: { ...formData.warranty, validUntil: e.target.value }
                                                })}
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mileage Limit (km)</label>
                                        <div className="relative">
                                            <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                type="number"
                                                placeholder="e.g. 150000 (Leave empty if unlimited)"
                                                value={formData.warranty?.mileageLimit || ""}
                                                onChange={(e) => updateFormData({
                                                    warranty: { ...formData.warranty, mileageLimit: e.target.value }
                                                })}
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 ml-1">Leave empty if unlimited kilometers.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                    className="px-8 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                    Next Step <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            <div className="h-8" />
        </div>
    );
}
