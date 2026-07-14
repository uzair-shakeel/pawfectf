"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from "lucide-react";
import QuestionCard from "../shared/QuestionCard";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImageBatch } from "../../../../services/petService";

// The deployed AI generation service
const AI_API_URL = "https://ojest.pl/getting/data/api/generate";

interface ListingSection {
    heading: string;
    content: string;
    source_tags: string[];
}

interface AIResponse {
    success: boolean;
    sections: ListingSection[];
    metadata: {
        vin?: string;
        make?: string;
        model?: string;
        year?: number;
        generation_mode?: string;
        model_used?: string;
        degraded?: boolean;
    };
}

interface Step11Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

// Maps formData fields to the car_listing payload format the AI API expects
function buildPayload(formData: any) {
    // Collect only already-uploaded CDN URLs (strings), skip any pending File objects
    const imageUrls: string[] = (formData.images || [])
        .filter((img: any) => typeof img === "string");

    return {
        car_listing: {
            images: imageUrls,
            core_info: {
                vin: formData.vin || "",
            },
            specifications: {
                make: formData.make || "",
                model: formData.model || "",
                year: parseInt(formData.year) || 0,
                trim: formData.trim || formData.modelClean || null,
                mileage: parseInt(formData.mileage) || 0,
                color: formData.color || formData.exteriorColor || null,
                body_type: formData.bodyType || null,
                registration_status: formData.registrationStatus || "",
                engine: {
                    type: formData.fuelType || formData.fuel || "",
                    power_hp: formData.powerHp ? parseInt(formData.powerHp) : null,
                    transmission: formData.transmission || "",
                    drivetrain: formData.drivetrain || "",
                },
            },
            financials: {
                price: parseInt(formData.price) || 0,
                currency: formData.currency || "PLN",
                sale_document: formData.saleDocument || "",
            },
            condition_report: {
                ownership: formData.ownership || null,
                accident_history: formData.accidentHistory || "Unknown",
                service_history: formData.serviceHistory || "Unknown",
                storage: formData.storage || null,
                known_issues: formData.issues || "None",
                visible_flaws: null,
                warranty: formData.hasWarranty || null,
            },
            features_and_equipment: {
                selected_equipment: formData.equipment || [],
                custom_equipment: formData.customEquipment || {},
            },
            modifications_and_extras: {
                modifications: formData.isModified && formData.modificationsText
                    ? [formData.modificationsText]
                    : (formData.modifications || []),
                extras: formData.extras || [],
                custom_options: formData.customMods || {},
            },
            fuel_specifics: {
                battery_capacity_kwh: formData.batteryKwh || null,
                lpg_installation: formData.hasLpg || false,
            },
        }
    };
}

// Section icons and colors for the 7 fixed headings
const SECTION_CONFIG: Record<string, { color: string; bg: string; darkBg: string; emoji: string }> = {
    "Highlights": { color: "text-blue-600", bg: "bg-blue-50", darkBg: "dark:bg-blue-900/10", emoji: "⭐" },
    "Seller Notes": { color: "text-violet-600", bg: "bg-violet-50", darkBg: "dark:bg-violet-900/10", emoji: "💬" },
    "Equipment": { color: "text-emerald-600", bg: "bg-emerald-50", darkBg: "dark:bg-emerald-900/10", emoji: "🔧" },
    "Known Flaws": { color: "text-amber-600", bg: "bg-amber-50", darkBg: "dark:bg-amber-900/10", emoji: "⚠️" },
    "Ownership History": { color: "text-cyan-600", bg: "bg-cyan-50", darkBg: "dark:bg-cyan-900/10", emoji: "📋" },
    "Condition": { color: "text-indigo-600", bg: "bg-indigo-50", darkBg: "dark:bg-indigo-900/10", emoji: "🔍" },
    "Financial": { color: "text-green-600", bg: "bg-green-50", darkBg: "dark:bg-green-900/10", emoji: "💰" },
};

function SectionCard({ section, index }: { section: ListingSection; index: number }) {
    const [expanded, setExpanded] = useState(index === 0); // First section open by default
    const config = SECTION_CONFIG[section.heading] || { color: "text-gray-600", bg: "bg-gray-50", darkBg: "dark:bg-gray-900/10", emoji: "📝" };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35 }}
            className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm"
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${config.bg} ${config.darkBg}`}>
                        {config.emoji}
                    </div>
                    <span className={`font-bold text-base ${config.color}`}>{section.heading}</span>
                    {section.source_tags?.includes("seller") && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                            Seller
                        </span>
                    )}
                </div>
                {expanded
                    ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            </button>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className={`px-5 py-4 border-t border-gray-100 dark:border-gray-800 ${config.bg} ${config.darkBg}`}>
                            <p className="text-md text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {section.content}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function Step11_AIPreview({ formData, updateFormData, nextStep, prevStep }: Step11Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sections, setSections] = useState<ListingSection[]>(formData.aiSections || []);
    const [aiMeta, setAiMeta] = useState<AIResponse["metadata"] | null>(formData.aiMeta || null);
    const { getToken } = useAuth();

    // Auto-generate on first mount if not already done
    useEffect(() => {
        if (!formData.aiSections?.length) {
            generateListing();
        }
    }, []);

    const generateListing = async () => {
        setLoading(true);
        setError(null);

        try {
            // Check if there are File objects that need to be uploaded
            const fileObjects = (formData.images || []).filter((img: any) => img instanceof File);
            let updatedFormData = formData;

            if (fileObjects.length > 0) {
                console.log(`[Step11] Uploading ${fileObjects.length} images one by one to avoid size limits...`);
                const uploadedUrls: string[] = [];
                const existingUrls = (formData.images || []).filter((img: any) => typeof img === "string");

                for (let i = 0; i < fileObjects.length; i++) {
                    const file = fileObjects[i];
                    console.log(`[Step11] Uploading image ${i + 1}/${fileObjects.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

                    try {
                        const uploadResult = await uploadImageBatch([file], undefined, getToken);
                        if (uploadResult.success && uploadResult.urls.length > 0) {
                            uploadedUrls.push(...uploadResult.urls);
                            console.log(`[Step11] Image ${i + 1} uploaded successfully`);
                        } else {
                            console.error(`[Step11] Failed to upload image ${i + 1}:`, uploadResult.errors);
                        }
                    } catch (err) {
                        console.error(`[Step11] Error uploading image ${i + 1}:`, err);
                    }
                }

                if (uploadedUrls.length > 0) {
                    const allUrls = [...existingUrls, ...uploadedUrls];

                    updatedFormData = {
                        ...formData,
                        images: allUrls
                    };

                    // Update formData so images persist
                    updateFormData({ images: allUrls });

                    console.log("[Step11] All images uploaded successfully:", uploadedUrls);
                } else {
                    console.error("[Step11] All image uploads failed");
                }
            }

            const payload = buildPayload(updatedFormData);

            console.log("========== PAYLOAD SENT TO API ==========");
            console.log(payload);
            console.log("========== END PAYLOAD ==========");

            const response = await fetch(AI_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`AI service error: ${response.status}`);
            }

            const data: AIResponse = await response.json();

            console.log("========== FRONTEND RAW API RESPONSE ==========");
            console.log(data);
            console.log("========== END FRONTEND RAW RESPONSE ==========");

            setSections(data.sections);
            setAiMeta(data.metadata);

            // Store in formData so it persists when navigating back/forward
            updateFormData({
                aiSections: data.sections,
                aiMeta: data.metadata,
                // Also build a plain text version for the final publish step
                generatedListing: data.sections
                    .map(s => `${s.heading}\n${s.content}`)
                    .join("\n\n"),
            });
        } catch (err: any) {
            console.error("AI generation failed:", err);
            setError(err.message || "Failed to contact the AI service. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <QuestionCard
                title="Listing Preview"
                subtitle="Your listing has been prepared based on your inputs. Review each section below."
            >
                {loading ? (
                    /* ── Loading State ─────────────────────────────── */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="relative mb-6">
                            <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl border border-gray-100 dark:border-gray-700">
                                <img src="/logooo.png" alt="Ojest AI" className="h-12 w-12 object-contain animate-pulse" />
                            </div>
                            <div className="absolute -inset-2 bg-gradient-to-br from-blue-400 to-sky-300 rounded-full blur-lg opacity-20 animate-ping" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Analysing your listing...
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs text-md leading-relaxed">
                            We're reviewing your car's specs, condition, and equipment to prepare a complete listing.
                        </p>
                        <div className="mt-6 flex gap-1.5">
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    /* ── Error State ───────────────────────────────── */
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
                        <p className="text-md text-red-500 dark:text-red-400 mb-6 max-w-sm">{error}</p>
                        <button
                            onClick={generateListing}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" /> Try Again
                        </button>
                    </div>
                ) : sections.length > 0 ? (
                    /* ── Success State ─────────────────────────────── */
                    <div className="space-y-3">

                        {/* Section Cards */}
                        {sections.map((section, i) => (
                            <SectionCard key={section.heading} section={section} index={i} />
                        ))}


                    </div>
                ) : null}
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
                    disabled={loading || sections.length === 0}
                    className={`px-8 py-2.5 rounded-lg font-bold text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg ${loading || sections.length === 0
                        ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50"
                        : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
                        }`}
                >
                    Review & Publish <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
