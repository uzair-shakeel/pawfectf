"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Wrench, Users, Warehouse, AlertTriangle, Eye, Plus, X } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";

interface Step04Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step04_Condition({ formData, updateFormData, nextStep, prevStep }: Step04Props) {

    const renderToggleGroup = (field: string, options: string[], icons: any[]) => (
        <div className="grid grid-cols-3 gap-2">
            {options.map((option, idx) => {
                const Icon = icons[idx] || ShieldCheck;
                const isSelected = formData[field] === option;
                return (
                    <button
                        key={option}
                        onClick={() => updateFormData({ [field]: option })}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                            : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        <Icon className={`h-6 w-6 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
                        <span className="text-sm font-medium">{option}</span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="space-y-6">
            <QuestionCard title="Vehicle Condition & History" subtitle="Be honest - transparency builds trust with buyers.">
                <div className="space-y-8">

                    <div className="grid grid-cols-1  gap-8">
                        {/* Accident History */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Accident History *</label>
                            {renderToggleGroup("accidentHistory", ["No Accidents", "Accident Reported", "Unknown"], [ShieldCheck, AlertTriangle, Users])}
                        </div>

                        {/* Service History */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Service History</label>
                            {renderToggleGroup("serviceHistory", ["Full History", "Partial History", "Unknown"], [Wrench, Wrench, Users])}
                        </div>

                        {/* Ownership */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Previous Owners</label>
                            {renderToggleGroup("ownership", ["First Owner", "2+ Owners", "Unknown"], [Users, Users, Users])}
                        </div>

                        {/* Storage */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Where is it kept?</label>
                            {renderToggleGroup("storage", ["Garage", "Outside", "Mixed"], [Warehouse, Warehouse, Warehouse])}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Known Technical Issues or Cosmetic Flaws
                        </label>
                        <textarea
                            value={formData.issues || ""}
                            onChange={(e) => updateFormData({ issues: e.target.value })}
                            placeholder="Describe any mechanical issues or cosmetic imperfections (e.g. AC needs recharge, small scratch on bumper...)"
                            rows={4}
                            className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
                        />
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
                    className="px-8 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                    Next Step <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            <div className="h-8" />
        </div>
    );
}
