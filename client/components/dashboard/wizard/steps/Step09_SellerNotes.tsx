"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, MessageSquare, Star, Zap } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";

interface Step09Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step09_SellerNotes({ formData, updateFormData, nextStep, prevStep }: Step09Props) {

    return (
        <div className="space-y-6">
            <QuestionCard title="Final Context" subtitle="Add any extra details about your car and choose your visibility. We'll use these to complete your listing.">

                {/* Seller Notes / Instructions for AI */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        <h3 className="font-bold text-gray-900 dark:text-white">Additional Seller Notes</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Mention things like: service history details, recent repairs, non-smoker, garaged, or specific selling points you want to highlight.
                    </p>
                    <textarea
                        value={formData.description || ""}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        placeholder="e.g. Car was regularly serviced at BMW authorized dealer. New brake pads installed 2 months ago. Non-smoker owner, always garaged..."
                        rows={6}
                        className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-gray-700 dark:text-gray-300"
                    />
                </div>

                {/* Featured / Boost Toggle */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div
                        className={`group relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${formData.isFeatured
                            ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-500 shadow-lg shadow-blue-500/10"
                            : "bg-white dark:bg-dark-bg border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm"
                            }`}
                        onClick={() => updateFormData({ isFeatured: !formData.isFeatured })}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl transition-colors ${formData.isFeatured
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                }`}>
                                <Star className={`h-6 w-6 ${formData.isFeatured ? "fill-white" : ""}`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">Feature your listing</h4>
                                    <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.isFeatured ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isFeatured ? "left-7" : "left-1"}`} />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Boost your car to the top of search results and homepage. Featured cars get <span className="text-blue-600 dark:text-blue-400 font-bold">3x more engagement</span> from serious buyers.
                                </p>
                            </div>
                        </div>

                        {/* Decorative Badge */}
                        <div className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Zap className="h-3 w-3 fill-white" /> Popular
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
                    className="px-8 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                    Preview Listing <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            <div className="h-8" />
        </div>
    );
}
