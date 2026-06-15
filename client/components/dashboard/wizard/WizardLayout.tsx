"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { ReactNode } from "react";

interface WizardLayoutProps {
    currentStep: number;
    totalSteps: number;
    children: ReactNode;
    aiMessage?: string;
    aiThinking?: boolean;
}

const stepTitles = [
    "Upload Photos",
    "VIN Decode",
    "Required Basics",
    "Condition",
    "Equipment & Mods",
    "Warranty",
    "History",
    "Seller Notes",
    "AI Preview",
    "Publish"
];

export default function WizardLayout({
    currentStep,
    totalSteps,
    children,
    aiMessage,
    aiThinking = false
}: WizardLayoutProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header - Static (Not Sticky) */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center">
                                <img src="/logooo.png" alt="Ojest AI" className="h-8 w-8 object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">
                                    AI Car Listing Assistant
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    Step {currentStep} of {totalSteps}: <span className="text-blue-600 dark:text-blue-400">{stepTitles[currentStep - 1]}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                {Math.round(progress)}% Complete
                            </div>
                        </div>
                    </div>

                    {/* Progress Track - Full Width */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-sky-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
                {/* AI Assistant Message */}
                <AnimatePresence mode="wait">
                    {aiMessage && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="mb-8"
                        >
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 relative">
                                    <div className={`h-12 w-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-md border border-gray-100 dark:border-gray-700 ${aiThinking ? "animate-pulse" : ""}`}>
                                        <img src="/logooo.png" alt="Ojest AI" className="h-8 w-8 object-contain" />
                                    </div>
                                    {aiThinking && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-5 shadow-sm border border-gray-100 dark:border-gray-700 relative">
                                        {/* Decorative triangle for speech bubble */}
                                        <div className="absolute top-0 -left-[9px] w-0 h-0 border-t-[12px] border-t-white dark:border-t-gray-800 border-l-[10px] border-l-transparent transform rotate-90 drop-shadow-sm filter-none z-10" />

                                        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                            {aiMessage}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
