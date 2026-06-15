"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, GaugeCircle, Package, Plus, Check, X } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";

interface Step06Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

const CATEGORIES = [
    {
        id: "modifications",
        label: "Modifications",
        icon: GaugeCircle,
        items: ["Tinted Windows", "Performance Exhaust", "ECU Tune", "Lowering Springs", "Custom Rims", "Spoiler", "Wrapped Body", "Upgraded Sound System"]
    },
    {
        id: "extras",
        label: "Included Extras",
        icon: Package,
        items: ["Winter Tires", "Roof Rack", "Car Cover", "Rubber Mats", "Spare Key", "Service Book", "Battery Charger"]
    }
];

export default function Step06_ModsExtras({ formData, updateFormData, nextStep, prevStep }: Step06Props) {
    const [addingTo, setAddingTo] = useState<string | null>(null);
    const [customValue, setCustomValue] = useState("");

    const toggleItem = (field: string, item: string) => {
        const currentList = formData[field] || [];
        const isSelected = currentList.includes(item);
        const newList = isSelected
            ? currentList.filter((i: string) => i !== item)
            : [...currentList, item];

        updateFormData({ [field]: newList });
    };

    const addCustomItem = (categoryId: string) => {
        const itemName = customValue.trim();
        if (!itemName) return;

        const currentList = formData[categoryId] || [];
        const currentCustoms = formData.customModsExtras || {};
        const categoryCustoms = currentCustoms[categoryId] || [];

        const updates: any = {};

        // Add to selected list
        if (!currentList.includes(itemName)) {
            updates[categoryId] = [...currentList, itemName];
        }

        // Add to category options
        if (!categoryCustoms.includes(itemName)) {
            updates.customModsExtras = {
                ...currentCustoms,
                [categoryId]: [...categoryCustoms, itemName]
            };
        }

        if (Object.keys(updates).length > 0) {
            updateFormData(updates);
        }

        setCustomValue("");
        setAddingTo(null);
    };

    return (
        <div className="space-y-6">
            <QuestionCard title="Modifications & Extras" subtitle="Any upgrades or additional items included?">
                <div className="space-y-10">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div key={category.id} className="p-1 px-2">
                                <div className="flex items-center gap-3 mb-5 group">
                                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">{category.label}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {/* Combined static and custom items for this category */}
                                    {[
                                        ...category.items,
                                        ...(formData.customModsExtras?.[category.id] || [])
                                    ].map((item) => {
                                        const isSelected = (formData[category.id] || []).includes(item);
                                        return (
                                            <button
                                                key={item}
                                                onClick={() => toggleItem(category.id, item)}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${isSelected
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]"
                                                    : "bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400"
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        );
                                    })}

                                    {addingTo === category.id ? (
                                        <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                                            <input
                                                type="text"
                                                autoFocus
                                                value={customValue}
                                                onChange={(e) => setCustomValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addCustomItem(category.id)}
                                                placeholder="Custom..."
                                                className="px-3 py-1.5 rounded-xl text-sm border-2 border-blue-500 bg-white dark:bg-dark-bg outline-none w-32 placeholder:text-gray-400"
                                            />
                                            <button
                                                onClick={() => addCustomItem(category.id)}
                                                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setAddingTo(null)}
                                                className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg hover:bg-gray-200"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setAddingTo(category.id)}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center gap-1"
                                        >
                                            <Plus className="h-4 w-4" /> Custom
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </QuestionCard>

            {/* Navigation - Static */}
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
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
