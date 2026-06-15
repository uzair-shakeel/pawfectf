"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, FileCheck, FileSearch, HelpCircle } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";

interface Step10Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step10_History({ formData, updateFormData, nextStep, prevStep }: Step10Props) {
    const status = formData.historyReportStatus;

    return (
        <div className="space-y-6">
            <QuestionCard title="Vehicle History Report" subtitle="Do you have a vehicle history report (e.g. Carfax/AutoDNA)?">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => updateFormData({ historyReportStatus: "attached" })}
                        className={`p-6 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${status === "attached"
                            ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300 ring-1 ring-green-500"
                            : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        <FileCheck className={`h-8 w-8 ${status === "attached" ? "text-green-500" : "text-gray-400"}`} />
                        <h3 className="font-semibold">I have a report</h3>
                        <p className="text-xs text-gray-500">I can upload it or provide details.</p>
                    </button>

                    <button
                        onClick={() => updateFormData({ historyReportStatus: "buyer_option" })}
                        className={`p-6 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${status === "buyer_option"
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                            : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        <FileSearch className={`h-8 w-8 ${status === "buyer_option" ? "text-blue-500" : "text-gray-400"}`} />
                        <h3 className="font-semibold">Buyer can check</h3>
                        <p className="text-xs text-gray-500">I encourage buyers to check history themselves.</p>
                    </button>

                    <button
                        onClick={() => updateFormData({ historyReportStatus: "not_checked" })}
                        className={`p-6 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${status === "not_checked"
                            ? "bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300"
                            : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        <HelpCircle className={`h-8 w-8 ${status === "not_checked" ? "text-gray-600 dark:text-gray-400" : "text-gray-400"}`} />
                        <h3 className="font-semibold">I don't know</h3>
                        <p className="text-xs text-gray-500">I haven't checked the history personally.</p>
                    </button>
                </div>

                {status === "attached" && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Report (PDF/Image)</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-white dark:bg-dark-bg">
                            <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                        </div>
                    </div>
                )}

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
