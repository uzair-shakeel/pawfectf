"use client";

import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Zap, Fuel, Calendar, FileCheck, Battery, Plug, Info } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { motion } from "framer-motion";

interface Step07Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step07_FuelSpecific({ formData, updateFormData, nextStep, prevStep }: Step07Props) {
    const isLPG = ['LPG', 'CNG', 'Petrol+LPG', 'Petrol+CNG'].some(t => (formData.fuel || "").includes(t));
    const isEV = ['Electric', 'Plug-in Hybrid'].some(t => (formData.fuel || "").includes(t));

    // Determine which sub-form to show
    // If user selected generic "Other" or petrol/diesel, we might skip
    const needed = isLPG || isEV;

    useEffect(() => {
        // If no specific details needed, we could auto-skip, but for now let's show a "N/A" screen 
        // or rely on user to click Next. 
        // Better UX: Show a friendly "No extra fuel details needed" message.
    }, [needed]);

    if (!needed) {
        return (
            <div className="space-y-6">
                <QuestionCard title="Fuel Details">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Fuel className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Standard Fuel Configuration</h3>
                        <p className="text-gray-500 max-w-md">
                            Based on your selection ({formData.fuel}), no additional fuel-specific details are required.
                        </p>
                    </div>
                </QuestionCard>
                {/* Navigation */}
                {/* Navigation - Static */}
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={prevStep} className="px-6 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button onClick={nextStep} className="px-8 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                        Next Step <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
                <div className="h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <QuestionCard
                title={isLPG ? "LPG/CNG Details" : "Electric/Hybrid Details"}
                subtitle="Specifics for your alternative fuel system."
            >
                {isLPG && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex gap-3">
                            <Fuel className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Gas Installation</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Buyers need to know if the system is valid and safe.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Installation Type</label>
                                <select
                                    value={formData.fuelSpecific?.lpg?.factory ? "Factory" : "Aftermarket"}
                                    onChange={(e) => updateFormData({
                                        fuelSpecific: {
                                            ...formData.fuelSpecific,
                                            lpg: { ...formData.fuelSpecific?.lpg, factory: e.target.value === "Factory" }
                                        }
                                    })}
                                    className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Aftermarket">Aftermarket (Installed later)</option>
                                    <option value="Factory">Factory Original</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Installation Year</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="number"
                                        placeholder="YYYY"
                                        value={formData.fuelSpecific?.lpg?.installYear || ""}
                                        onChange={(e) => updateFormData({
                                            fuelSpecific: {
                                                ...formData.fuelSpecific,
                                                lpg: { ...formData.fuelSpecific?.lpg, installYear: e.target.value }
                                            }
                                        })}
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            onClick={() => updateFormData({
                                fuelSpecific: {
                                    ...formData.fuelSpecific,
                                    lpg: { ...formData.fuelSpecific?.lpg, documented: !formData.fuelSpecific?.lpg?.documented }
                                }
                            })}
                        >
                            <div className={`h-6 w-6 rounded border flex items-center justify-center transition-colors ${formData.fuelSpecific?.lpg?.documented ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 dark:border-gray-600"
                                }`}>
                                {formData.fuelSpecific?.lpg?.documented && <FileCheck className="h-4 w-4" />}
                            </div>
                            <span className="font-medium">Homologation / Documents valid?</span>
                        </div>
                    </div>
                )}

                {isEV && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30 flex gap-3">
                            <Zap className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-green-900 dark:text-green-100">Electric System</h4>
                                <p className="text-sm text-green-700 dark:text-green-300">Battery health is the #1 concern for EV buyers.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Battery Capacity (kWh)</label>
                                <div className="relative">
                                    <Battery className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="number"
                                        placeholder="e.g. 75"
                                        value={formData.fuelSpecific?.ev?.batteryKwh || ""}
                                        onChange={(e) => updateFormData({
                                            fuelSpecific: {
                                                ...formData.fuelSpecific,
                                                ev: { ...formData.fuelSpecific?.ev, batteryKwh: e.target.value }
                                            }
                                        })}
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Real Range (km)</label>
                                <div className="relative">
                                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="number"
                                        placeholder="e.g. 400"
                                        value={formData.fuelSpecific?.ev?.range || ""}
                                        onChange={(e) => updateFormData({
                                            fuelSpecific: {
                                                ...formData.fuelSpecific,
                                                ev: { ...formData.fuelSpecific?.ev, range: e.target.value }
                                            }
                                        })}
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inlcuded Cables</label>
                            <div className="flex gap-4">
                                {['Type 2', 'CCS', 'Home Charger (230V)'].map(cable => {
                                    const current = formData.fuelSpecific?.ev?.cables || [];
                                    const isSelected = current.includes(cable);
                                    return (
                                        <button
                                            key={cable}
                                            onClick={() => {
                                                const newCables = isSelected ? current.filter((c: string) => c !== cable) : [...current, cable];
                                                updateFormData({
                                                    fuelSpecific: {
                                                        ...formData.fuelSpecific,
                                                        ev: { ...formData.fuelSpecific?.ev, cables: newCables }
                                                    }
                                                });
                                            }}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isSelected
                                                ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300"
                                                : "bg-white dark:bg-dark-bg border-gray-200 dark:border-gray-700"
                                                }`}
                                        >
                                            {cable}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </QuestionCard>

            {/* Navigation */}
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
