"use client";
import { useState, useEffect } from "react";
import { generatePetListing } from "../../../services/petService";
import { useAuth } from "../../../lib/auth/AuthContext";
import { toast } from "react-hot-toast";
import { Sparkles, FileText, ChevronRight, Loader2 } from "lucide-react";

export default function StepSix({ nextStep, prevStep, formData, updateFormData }) {
    const { getToken } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedListing, setGeneratedListing] = useState(formData.generatedListing || "");

    const handleGenerateListing = async () => {
        try {
            setIsGenerating(true);

            // Prepare input data for OpenAI based on the OJEST prompt structure
            const inputData = {
                vehicle_confirmed: {
                    make: formData.make,
                    model: formData.model,
                    trim: formData.trim,
                    year: formData.year,
                    fuel: formData.fuel,
                    transmission: formData.transmission,
                    drivetrain: formData.drivetrain,
                    engine: formData.engine,
                    horsepower: formData.horsepower,
                    vin: formData.vin,
                    country: formData.country,
                },
                seller_input: {
                    title: formData.title,
                    description: formData.description,
                    mileage: formData.mileage,
                    condition: formData.condition,
                    conditionType: formData.conditionType,
                    financialInfo: formData.financialInfo,
                },
                market_context: {
                    region: formData.country || "Polska",
                },
                commercial: {
                    warranties: formData.warranties,
                }
            };

            const result = await generatePetListing(inputData, getToken);
            setGeneratedListing(result.listing);
            updateFormData({ generatedListing: result.listing });
            toast.success("Opis wygenerowany pomyślnie!", { icon: '✨' });
        } catch (error: any) {
            console.error("Error generating listing:", error);
            toast.error("Nie udało się wygenerować opisu. Spróbuj ponownie.");
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (!generatedListing && !isGenerating) {
            handleGenerateListing();
        }
    }, []);

    // Function to format the generated listing with the requested styling
    const formatListing = (text: string) => {
        if (!text) return null;

        // Split by markdown h2 headers: ## Heading
        const sections = text.split(/##\s+/).filter(s => s.trim().length > 0);

        return sections.map((section, index) => {
            const lines = section.trim().split('\n');
            const title = lines[0].replace(/\*\*/g, '').trim(); // Remove any stray **
            const content = lines.slice(1).filter(line => line.trim().length > 0);

            // If there's no content after the title, skip this section
            if (content.length === 0) return null;

            return (
                <div key={index} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-200 dark:text-white mb-4 uppercase tracking-tight border-b-2 border-gray-100 dark:border-gray-700 pb-2">
                        {title}
                    </h3>
                    <div className="space-y-2">
                        {content.map((line, lIdx) => {
                            // Handle bullet points
                            if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*')) {
                                return (
                                    <div key={lIdx} className="flex gap-3 items-start group">
                                        <span className="text-blue-600 dark:text-blue-400 mt-1.5 shrink-0">•</span>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                            {line.trim().replace(/^[-•*]\s*/, '').replace(/\*\*/g, '')}
                                        </p>
                                    </div>
                                );
                            }
                            // Regular text, remove any stray **
                            return (
                                <p key={lIdx} className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                    {line.trim().replace(/\*\*/g, '')}
                                </p>
                            );
                        })}
                    </div>
                </div>
            );
        }).filter(Boolean); // Remove null sections
    };

    return (
        <div className="bg-white dark:bg-dark-main rounded-xl shadow-sm p-8 max-w-3xl mx-auto transition-colors">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
                    <Sparkles className="text-blue-600 dark:text-blue-400 w-8 h-8" />
                </div>
                <h3 className="text-blue-600 dark:text-blue-400 font-bold text-md uppercase tracking-widest mb-2">Krok 6</h3>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 dark:text-white">Twój profesjonalny opis</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Wygenerowaliśmy czytelny i rzeczowy opis Twojego auta.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-main rounded-2xl border border-gray-100 dark:border-gray-700 p-8 min-h-[400px] relative">
                {isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-dark-main/80 backdrop-blur-sm rounded-2xl z-10">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-900 dark:text-gray-200 dark:text-white font-bold text-lg">Generowanie opisu...</p>
                        <p className="text-gray-500 dark:text-gray-400 text-md mt-2">To może potrwać kilka sekund</p>
                    </div>
                ) : null}

                <div className="prose prose-blue max-w-none dark:prose-invert">
                    {generatedListing ? (
                        formatListing(generatedListing)
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <FileText className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-gray-400">Kliknij przycisk poniżej, aby wygenerować opis.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 mt-10">
                <button
                    onClick={handleGenerateListing}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-md hover:underline disabled:opacity-50"
                >
                    <Sparkles className="w-4 h-4" />
                    Wygeneruj ponownie
                </button>

                <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={prevStep}
                        className="text-gray-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        Wstecz
                    </button>
                    <button
                        onClick={nextStep}
                        disabled={!generatedListing || isGenerating}
                        className="bg-blue-600 text-white font-bold px-12 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-widest text-md"
                    >
                        <span>Dalej</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
