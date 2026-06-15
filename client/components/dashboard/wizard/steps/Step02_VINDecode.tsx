"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Edit2, AlertCircle, Loader2, ArrowRight, ArrowLeft, Car } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import SourceBadge from "../shared/SourceBadge";
import { getCarDetailsByVin } from "../../../../services/petService";
import { useAuth } from "../../../../lib/auth/AuthContext";

import carData from "../../../../public/data/carMakesModels.json";

interface Step02Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function Step02_VINDecode({ formData, updateFormData, nextStep, prevStep }: Step02Props) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [decodedData, setDecodedData] = useState<any>(null);

    const makes = Object.keys(carData.makesAndModels).sort();
    const models = formData.make ? (carData.makesAndModels[formData.make as keyof typeof carData.makesAndModels] || []) : [];

    useEffect(() => {
        // If we already have decoded data (e.g. from back navigation), use it
        if (formData.vinData) {
            setDecodedData(formData.vinData);
            setLoading(false);
            return;
        }

        const fetchVinData = async () => {
            if (formData.vin && !decodedData) {
                setLoading(true);
                setError(null);
                try {
                    // Attempt to fetch VIN data
                    const data: any = await getCarDetailsByVin(formData.vin, getToken);
                    setDecodedData(data);

                    // Auto-update form data with decoded values if not already set
                    // We only do this if fields are empty to avoid overwriting user edits if they went back and forth?
                    // Actually, if we are fetching fresh, we probably want to overwrite or at least fill defaults.
                    // But if we came back, we use formData.vinData (handled above).

                    updateFormData({
                        vinData: data,
                        make: formData.make || data.make || "",
                        model: formData.model || data.model || "",
                        year: formData.year || data.year || "",
                        trim: formData.trim || data.trim || "",
                        type: formData.type || data.type || data.bodyClass || "",
                        engine: formData.engine || data.engine || "",
                        transmission: formData.transmission || data.transmission || "",
                        drivetrain: formData.drivetrain || data.driveType || "",
                        fuel: formData.fuel || data.fuel || "",
                        color: formData.color || data.color || ""
                    });
                } catch (err: any) {
                    console.error("VIN Decode Error:", err);
                    setError("Could not decode VIN. Please enter details manually.");
                    setIsEditing(true); // Force edit mode on error
                } finally {
                    setLoading(false);
                }
            } else if (!formData.vin) {
                // No VIN provided, go straight to manual entry
                setIsEditing(true);
            }
        };

        fetchVinData();
    }, [formData.vin, getToken, formData.vinData]); // Depend on VIN and vinData

    const handleSaveOverrides = () => {
        // Save current form values as confirmed
        setIsEditing(false);
        // Proceed to next step? Or just exit edit mode?
        // The prompt says "Buttons: Looks correct / Edit".
        // If we are in edit mode, "Save" should probably just go back to review or proceed?
        // Let's stay in review mode to let them click "Looks correct" to proceed.
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Decoding VIN...</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Checking vehicle databases for {formData.vin}</p>
            </div>
        );
    }

    const renderField = (label: string, value: string, field: string, options: string[] = [], required = false) => (
        <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
                options.length > 0 ? (
                    <select
                        value={value}
                        onChange={(e) => {
                            const updates: any = { [field]: e.target.value };
                            if (field === 'make') updates.model = ""; // Reset model if make changes
                            updateFormData(updates);
                        }}
                        className="w-full px-3 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Select {label}...</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => updateFormData({ [field]: e.target.value })}
                        className="w-full px-3 py-3 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder={`Enter ${label}`}
                    />
                )
            ) : (
                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-900 dark:text-white truncate pr-2">
                        {value || "Not specified"}
                    </span>
                    <SourceBadge source={formData.vin && value === (decodedData?.[field] || "") ? 'confirmed' : 'seller'} />
                </div>
            )}
        </div>
    );

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());
    const bodyTypes = ["Sedan", "SUV", "Coupe", "Wagon", "Hatchback", "Convertible", "Van", "Truck", "Minivans", "Others"];

    return (
        <div className="space-y-6">
            <QuestionCard
                title={isEditing ? "Vehicle Details" : "Review Vehicle Details"}
                subtitle={isEditing ? "Please fill in the missing details." : "Verify the decoded information below."}
            >
                {/* ... error display ... skipped for brevity, keeping existing structure */}
                {error && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl flex items-start gap-3 border border-amber-100 dark:border-amber-800">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField("Make", formData.make, "make", makes, true)}
                    {renderField("Model", formData.model, "model", models, true)}
                    {renderField("Year", formData.year, "year", years, true)}
                    {renderField("Trim / Version", formData.trim, "trim")}
                    {/* {renderField("Body Type", formData.type, "type", bodyTypes)} */}

                    {renderField("Engine", formData.engine, "engine", ["1.0L", "1.2L", "1.4L", "1.6L", "1.8L", "2.0L", "2.5L", "3.0L", "3.5L", "4.0L", "Electric"])}
                    {renderField("Transmission", formData.transmission, "transmission", ["Automatic", "Manual", "Semi-Automatic", "CVT"])}
                    {renderField("Drivetrain", formData.drivetrain, "drivetrain", ["FWD", "RWD", "AWD", "4WD"])}
                    {renderField("Fuel Type", formData.fuel, "fuel", ["Petrol", "Diesel", "Hybrid", "Plug-in Hybrid", "Electric", "LPG", "CNG"])}
                </div>

                {!isEditing && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-2.5 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                        >
                            <Edit2 className="h-4 w-4" /> Edit Details
                        </button>
                    </div>
                )}

                {isEditing && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleSaveOverrides}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-shadow shadow-lg hover:shadow-blue-500/25"
                        >
                            <Check className="h-5 w-5" /> Save Changes
                        </button>
                    </div>
                )}
            </QuestionCard>

            {/* Navigation Buttons - Static */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={prevStep}
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {!isEditing && (
                    <button
                        onClick={nextStep}
                        className="px-8 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Check className="h-4 w-4" /> Looks Correct
                    </button>
                )}
            </div>
            <div className="h-8" />
        </div>
    );
}
