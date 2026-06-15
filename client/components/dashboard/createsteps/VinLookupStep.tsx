"use client";
import { useState } from "react";
import { getCarDetailsByVin } from "../../../services/petService";
import { useAuth } from "../../../lib/auth/AuthContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, AlertCircle, X, ChevronRight, Check } from "lucide-react";

export default function VinLookupStep({ nextStep, updateFormData, formData }) {
    const { getToken } = useAuth();
    const [vin, setVin] = useState(formData.vin || "");
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState<{ show: boolean, message: string, details?: string }>({
        show: false,
        message: "",
    });
    const [fetchedData, setFetchedData] = useState<any>(null);

    const handleVinLookup = async () => {
        if (!vin || vin.length < 17) {
            toast.error("Wpisz pełny numer VIN (17 znaków)");
            return;
        }

        try {
            setIsLoading(true);
            setFetchedData(null);

            const carDetails = await getCarDetailsByVin(vin, getToken);

            // Track which fields were auto-filled
            const vinFields = Object.keys(carDetails).filter(key =>
                carDetails[key] !== null && carDetails[key] !== "" &&
                !["vin", "mileage", "accidentHistory", "serviceHistory"].includes(key)
            );

            // Generate a detailed title
            const title = `${carDetails.year} ${carDetails.make} ${carDetails.model} ${carDetails.trim || ""}`.trim();

            // Generate a comprehensive description
            const descriptionParts = [];
            if (carDetails.year) descriptionParts.push(`Rok: ${carDetails.year}`);
            if (carDetails.make) descriptionParts.push(`Marka: ${carDetails.make}`);
            if (carDetails.model) descriptionParts.push(`Model: ${carDetails.model}`);
            if (carDetails.trim) descriptionParts.push(`Wersja: ${carDetails.trim}`);
            if (carDetails.engineDetails) descriptionParts.push(`Silnik: ${carDetails.engineDetails}`);
            if (carDetails.transmission) descriptionParts.push(`Skrzynia: ${carDetails.transmission}`);
            if (carDetails.fuel) descriptionParts.push(`Paliwo: ${carDetails.fuel}`);
            if (carDetails.driveType) descriptionParts.push(`Napęd: ${carDetails.driveType}`);
            if (carDetails.bodyClass) descriptionParts.push(`Typ: ${carDetails.bodyClass}`);
            if (carDetails.horsepower) descriptionParts.push(`Moc: ${carDetails.horsepower} KM`);

            const description = descriptionParts.join("\n");

            const lookupResults = {
                vin: carDetails.vin,
                make: carDetails.make,
                model: carDetails.model,
                trim: carDetails.trim,
                type: carDetails.bodyClass,
                year: carDetails.year,
                fuel: carDetails.fuel,
                transmission: carDetails.transmission,
                drivetrain: carDetails.driveType,
                engine: carDetails.engine,
                horsepower: carDetails.horsepower,
                color: carDetails.color,
                country: carDetails.country,
                title,
                description,
                vinFields,
            };

            setFetchedData(lookupResults);
            updateFormData(lookupResults);

            toast.success("Dane auta pobrane pomyślnie!", {
                icon: '✨',
                duration: 4000
            });

        } catch (error: any) {
            console.error("Error fetching car details:", error);
            let message = "Nie udało się pobrać danych dla tego numeru VIN.";
            let details = "";

            if (error.response?.data?.details) {
                details = error.response.data.details;
            }

            if (error.message?.includes("404")) {
                message = "Nie znaleziono pojazdu z tym numerem VIN w naszej bazie.";
            } else if (error.message?.includes("Network Error")) {
                message = "Błąd połączenia. Sprawdź internet i spróbuj ponownie.";
            }

            setErrorModal({
                show: true,
                message,
                details
            });
        } finally {
            setIsLoading(false);
        }
    };

    const skipVin = () => {
        nextStep();
    };

    return (
        <div className="bg-white dark:bg-dark-elevation-4 rounded-xl shadow-sm p-8 max-w-2xl mx-auto transition-colors">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                    <Sparkles className="text-blue-600 w-8 h-8" />
                </div>
                <h3 className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-widest mb-2">Krok 1</h3>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 dark:text-white">Zacznij od numeru VIN</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Pobierzemy większość danych o Twoim aucie automatycznie.
                </p>
            </div>

            <div className="space-y-8">
                {/* Condition Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider text-center">Stan Pojazdu</label>
                    <div className="flex justify-center gap-6">
                        <label className={`relative cursor-pointer group`}>
                            <input
                                type="radio"
                                name="conditionType"
                                value="Used"
                                checked={formData.conditionType === "Used" || !formData.conditionType}
                                onChange={() => updateFormData({ conditionType: "Used" })}
                                className="peer sr-only"
                            />
                            <div className="px-8 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-main text-gray-600 dark:text-gray-300 font-bold transition-all peer-checked:border-blue-600 dark:peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/30 peer-checked:text-blue-700 dark:peer-checked:text-blue-300 hover:border-blue-200 dark:hover:border-blue-700">
                                Używany
                            </div>
                        </label>
                        <label className={`relative cursor-pointer group`}>
                            <input
                                type="radio"
                                name="conditionType"
                                value="New"
                                checked={formData.conditionType === "New"}
                                onChange={() => updateFormData({ conditionType: "New" })}
                                className="peer sr-only"
                            />
                            <div className="px-8 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-main text-gray-600 dark:text-gray-300 font-bold transition-all peer-checked:border-blue-600 dark:peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/30 peer-checked:text-blue-700 dark:peer-checked:text-blue-300 hover:border-blue-200 dark:hover:border-blue-700">
                                Nowy
                            </div>
                        </label>
                    </div>
                </div>

                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Numer VIN (17 znaków)</label>
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-gray-400 w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Wpisz numer VIN..."
                                className="block w-full pl-10 pr-3 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-blue-500 transition-all text-lg font-mono uppercase tracking-wider bg-white dark:bg-dark-main dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                value={vin}
                                onChange={(e) => setVin(e.target.value.toUpperCase())}
                                maxLength={17}
                            />
                        </div>
                        <button
                            onClick={handleVinLookup}
                            disabled={isLoading || vin.length < 17}
                            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none flex items-center gap-2 whitespace-nowrap uppercase tracking-wider text-sm"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Szukanie...</span>
                                </div>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    <span>Sprawdź</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {fetchedData && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-xl p-6 mt-6"
                        >
                            <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Znaleziono dane auta!
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-green-600 dark:text-green-400 block uppercase font-bold tracking-wider">Marka</span>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:text-white">{fetchedData.make}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-green-600 dark:text-green-400 block uppercase font-bold tracking-wider">Model</span>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:text-white">{fetchedData.model}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-green-600 dark:text-green-400 block uppercase font-bold tracking-wider">Rok</span>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:text-white">{fetchedData.year}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-green-600 dark:text-green-400 block uppercase font-bold tracking-wider">Moc</span>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:text-white">{fetchedData.horsepower} KM</span>
                                </div>
                            </div>
                            <button
                                onClick={nextStep}
                                className="w-full mt-6 bg-green-600 text-white py-5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 group uppercase tracking-widest text-sm"
                            >
                                <span>Kontynuuj do ogłoszenia</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!fetchedData && (
                    <div className="flex flex-col gap-4 mt-8">
                        <button
                            onClick={skipVin}
                            className="text-gray-400 font-bold text-sm tracking-wide hover:text-blue-600 transition-colors py-4 px-8 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 uppercase"
                        >
                            Wpiszę dane ręcznie
                        </button>
                    </div>
                )}
            </div>

            {/* Error Modal */}
            <AnimatePresence>
                {errorModal.show && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setErrorModal(prev => ({ ...prev, show: false }))}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white dark:bg-dark-main rounded-2xl shadow-2xl max-w-md w-full p-8"
                        >
                            <button
                                onClick={() => setErrorModal(prev => ({ ...prev, show: false }))}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                    <AlertCircle className="text-red-600 w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 dark:text-white mb-4">Wystąpił błąd</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">{errorModal.message}</p>
                                {errorModal.details && (
                                    <p className="text-gray-400 text-sm italic mb-6">
                                        "{errorModal.details}"
                                    </p>
                                )}
                                <button
                                    onClick={() => setErrorModal(prev => ({ ...prev, show: false }))}
                                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all uppercase tracking-wider"
                                >
                                    Rozumiem, wpiszę ręcznie
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
