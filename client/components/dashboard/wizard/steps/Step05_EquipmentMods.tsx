"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Wrench, CheckCircle2 } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";

interface Step05Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step05_EquipmentMods({ formData, updateFormData, nextStep, prevStep }: Step05Props) {
    const [isModified, setIsModified] = useState(formData.isModified ?? (formData.modifications?.length > 0));

    const handleSelectOption = (modified: boolean) => {
        setIsModified(modified);
        updateFormData({ isModified: modified });
        if (!modified) {
            updateFormData({ modifications: [] });
        }
    };

    return (
        <div className="space-y-6">
            <QuestionCard
                title="Equipment & Modifications"
                subtitle="Is your car in its original factory condition or has it been modified?"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => handleSelectOption(false)}
                        className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${!isModified && isModified !== undefined
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                    >
                        <div className={`h-6 w-6 rounded-full border-2 absolute top-4 right-4 flex items-center justify-center transition-colors ${!isModified && isModified !== undefined ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                            }`}>
                            {!isModified && isModified !== undefined && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                        <Sparkles className={`h-10 w-10 mb-4 transition-colors ${!isModified && isModified !== undefined ? "text-blue-500" : "text-gray-400 dark:text-gray-500"}`} />
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">Original Condition</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            No cosmetic or performance changes. Just how it left the factory.
                        </p>
                    </button>

                    <button
                        onClick={() => handleSelectOption(true)}
                        className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${isModified
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                    >
                        <div className={`h-6 w-6 rounded-full border-2 absolute top-4 right-4 flex items-center justify-center transition-colors ${isModified ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                            }`}>
                            {isModified && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                        <Wrench className={`h-10 w-10 mb-4 transition-colors ${isModified ? "text-blue-500" : "text-gray-400 dark:text-gray-500"}`} />
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">Modified</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            Includes aftermarket parts, custom tuning, wraps, or special upgrades.
                        </p>
                    </button>
                </div>

                <AnimatePresence>
                    {isModified && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
                                Describe the modifications
                            </label>
                            <textarea
                                value={formData.modificationsText || ""}
                                onChange={(e) => updateFormData({ modificationsText: e.target.value })}
                                placeholder="E.g. Stage 1 engine tune, lowering springs, custom exhaust, carbon fiber spoiler..."
                                rows={5}
                                className="w-full px-4 py-4 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-sm"
                            />
                            <p className="mt-2 text-xs text-gray-400 italic ml-1">
                                * The AI will use this description to highlight your car's unique features.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </QuestionCard>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={prevStep}
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <button
                    onClick={nextStep}
                    disabled={isModified === undefined}
                    className={`px-8 py-2.5 rounded-lg font-bold text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg ${isModified !== undefined
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
