"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface QuestionCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export default function QuestionCard({ title, subtitle, children }: QuestionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-card rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 w-full"
        >
            <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-gray-500 dark:text-gray-400">
                        {subtitle}
                    </p>
                )}
            </div>
            {children}
        </motion.div>
    );
}
