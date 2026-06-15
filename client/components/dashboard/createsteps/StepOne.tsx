"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import CustomMap from "../GoogleMapComponent";
import {
  FaMapMarkerAlt,
  FaChevronDown,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

// Helper component for form fields
const FieldWrapper = ({ label, auto, children }: { label: string, auto: boolean, children: React.ReactNode }) => {
  return (
    <div className="col-span-2 md:col-span-1">
      <label className={`flex items-center gap-1.5 text-sm font-semibold mb-2 uppercase tracking-wider ${auto ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
        {auto && <Sparkles size={14} className="text-blue-500" />}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default function StepOne({ nextStep, prevStep, updateFormData, formData, makesModelsData }) {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);
  const [localData, setLocalData] = useState({
    title: formData.title || "",
    description: formData.description || "",
    images: formData.images || [],
    vin: formData.vin || "",
    make: formData.make || "",
    model: formData.model || "",
    trim: formData.trim || "",
    type: formData.type || "",
    year: formData.year || "",
    color: formData.color || "",
    mileage: formData.mileage || "",
    drivetrain: formData.drivetrain || "",
    transmission: formData.transmission || "",
    fuel: formData.fuel || "",
    engine: formData.engine || "",
    horsepower: formData.horsepower || "",
    accidentHistory: formData.accidentHistory || "",
    serviceHistory: formData.serviceHistory || "",
    country: formData.country || "",
    location: formData.location || {
      type: "Point",
      coordinates: [51.5074, -0.1278], // Default to London
    },
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => currentYear - i
  );
  const engines = ["1000", "1900", "2000", "2400", "3000", "4000", "5000", "7300"];
  const colors = [
    "Beżowy", "Biały", "Bordowy", "Brązowy", "Czarny", "Czerwony", "Fioletowy",
    "Granatowy", "Niebieski", "Pomarańczowy", "Srebrny", "Szary", "Zielony", "Złoty", "Żółty",
  ];

  const isAutoFilled = (field: string) => {
    return formData.vinFields?.includes(field);
  };

  // State for car models
  const [models, setModels] = useState<string[]>([]);
  const makes = makesModelsData?.getMakes() || [];

  useEffect(() => {
    if (localData.make && makesModelsData) {
      let modelsList = makesModelsData.getModelsForMake(localData.make) || [];
      if (localData.model && !modelsList.includes(localData.model)) {
        modelsList = [...modelsList, localData.model];
      }
      setModels(modelsList);
    } else {
      setModels([]);
    }
  }, [localData.make, localData.model, makesModelsData]);

  const handleLocationChange = (newLocation) => {
    setLocalData((prev) => ({
      ...prev,
      location: newLocation,
    }));

    updateFormData({
      ...formData,
      location: newLocation,
    });
  };

  const handleNext = () => {
    if (!localData.title.trim()) {
      alert("Tytuł jest wymagany.");
      return;
    }
    // Description check removed
    if (!localData.make) {
      alert("Marka jest wymagana.");
      return;
    }
    if (!localData.model) {
      alert("Model jest wymagany.");
      return;
    }
    // New validation for merged fields
    if (!localData.type) {
      alert("Typ pojazdu jest wymagany.");
      return;
    }
    updateFormData({
      ...formData,
      ...localData,
    });
    nextStep();
  };

  return (
    <div className="bg-white dark:bg-dark-main rounded-lg w-full p-1 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white">Krok 2: Szczegóły Pojazdu</h2>
        {formData.vinFields?.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-800 shadow-sm">
            <Sparkles size={14} />
            <span>{formData.vinFields.length} Danych z VIN</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6 w-full">

        {/* Title */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Tytuł Ogłoszenia</label>
          <input
            type="text"
            placeholder="Np. BMW M5 F90 Competition 2021"
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
            value={localData.title}
            onChange={(e) =>
              setLocalData({ ...localData, title: e.target.value })
            }
          />
        </div>

        {/* Seller Notes (Description) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Notatki Sprzedającego / Opis</label>
          <textarea
            placeholder="Wpisz dodatkowe informacje o aucie, np. historia, dodatkowe wyposażenie, stan..."
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl min-h-[120px] focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
            value={localData.description}
            onChange={(e) =>
              setLocalData({ ...localData, description: e.target.value })
            }
          />
          <p className="text-xs text-gray-400 mt-2 font-medium italic">
            * Te notatki zostaną wykorzystane przez AI do wygenerowania profesjonalnego opisu.
          </p>
        </div>

        {/* Make & Model Section - Read Only if VIN exists, else Selects */}
        {formData.vin ? (
          <div className="col-span-2">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 p-6">
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                DANE ZWERYFIKOWANE Z VIN
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Marka</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white">{localData.make}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Model</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white">{localData.model}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Rok</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white">{formData.year || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nadwozie</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white">{formData.type || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Paliwo</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white">{formData.fuel || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Skrzynia</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white">{formData.transmission || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Silnik</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white">{formData.engine || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Moc</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white">{formData.horsepower ? `${formData.horsepower} KM` : "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Napęd</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-200 dark:text-white">{formData.drivetrain || "—"}</p>
                </div>
              </div>
              <p className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-4 font-medium">
                Te dane zostały pobrane automatycznie i nie mogą być edytowane.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Make */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Marka</label>
              <select
                className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
                value={localData.make}
                onChange={(e) =>
                  setLocalData({ ...localData, make: e.target.value, model: "" })
                }
                disabled={makesModelsData?.loading}
              >
                <option value="">Wybierz Markę</option>
                {makes.map((make, index) => (
                  <option key={index} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Model</label>
              <select
                className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
                value={localData.model}
                onChange={(e) =>
                  setLocalData({ ...localData, model: e.target.value })
                }
                disabled={makesModelsData?.loading || !localData.make}
              >
                <option value="">Wybierz Model</option>
                {models.map((model, index) => (
                  <option key={index} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* --- Merged Fields from Step 4 --- */}

        <FieldWrapper label="Wersja / Trim" auto={isAutoFilled("trim")}>
          <input
            type="text"
            placeholder="Np. Competition, M-Package"
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
            value={localData.trim}
            onChange={(e) => setLocalData({ ...localData, trim: e.target.value })}
          />
        </FieldWrapper>

        <FieldWrapper label="Typ Nadwozia" auto={isAutoFilled("type")}>
          <select
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
            value={localData.type}
            onChange={(e) => setLocalData({ ...localData, type: e.target.value })}
          >
            <option value="">Wybierz Typ</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Sedan">Sedan</option>
            <option value="Kombi">Kombi</option>
            <option value="Coupe">Coupe</option>
            <option value="SUV">SUV</option>
            <option value="Convertible">Kabriolet</option>
            <option value="Pickup">Pickup</option>
            <option value="Bus">Bus</option>
            <option value="Crossover">Crossover</option>
            <option value="Van">Van</option>
          </select>
        </FieldWrapper>

        <FieldWrapper label="Rok Produkcji" auto={isAutoFilled("year")}>
          <select
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
            value={localData.year}
            onChange={(e) => setLocalData({ ...localData, year: e.target.value })}
          >
            <option value="">Wybierz Rok</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Kolor" auto={isAutoFilled("color")}>
          <select
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
            value={colors.includes(localData.color) ? localData.color : (localData.color ? "__OTHER__" : "")}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__OTHER__") setLocalData({ ...localData, color: "" });
              else setLocalData({ ...localData, color: v });
            }}
          >
            <option value="">Wybierz Kolor</option>
            {colors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__OTHER__">Inny kolor</option>
          </select>
        </FieldWrapper>



        <FieldWrapper label="Przebieg (KM)" auto={isAutoFilled("mileage")}>
          <input
            type="number"
            placeholder="0"
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
            value={localData.mileage}
            onChange={(e) => setLocalData({ ...localData, mileage: e.target.value })}
          />
        </FieldWrapper>

        <FieldWrapper label="Napęd" auto={isAutoFilled("drivetrain")}>
          <select
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
            value={localData.drivetrain}
            onChange={(e) => setLocalData({ ...localData, drivetrain: e.target.value })}
          >
            <option value="">Wybierz Napęd</option>
            <option value="FWD">Przód</option>
            <option value="RWD">Tył</option>
            <option value="4WD">4x4 / AWD</option>
          </select>
        </FieldWrapper>

        <FieldWrapper label="Skrzynia Biegów" auto={isAutoFilled("transmission")}>
          <select
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
            value={localData.transmission}
            onChange={(e) => setLocalData({ ...localData, transmission: e.target.value })}
          >
            <option value="">Wybierz Skrzynię</option>
            <option value="Manual">Manualna</option>
            <option value="Automatic">Automatyczna</option>
          </select>
        </FieldWrapper>

        <FieldWrapper label="Paliwo" auto={isAutoFilled("fuel")}>
          <select
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
            value={localData.fuel}
            onChange={(e) => setLocalData({ ...localData, fuel: e.target.value })}
          >
            <option value="">Wybierz Paliwo</option>
            <option value="Petrol">Benzyna</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybryda</option>
            <option value="Electric">Elektryczny</option>
            <option value="LPG">LPG</option>
          </select>
        </FieldWrapper>

        <FieldWrapper label="Moc (KM)" auto={isAutoFilled("horsepower")}>
          <input
            type="number"
            placeholder="KM"
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
            value={localData.horsepower}
            onChange={(e) => setLocalData({ ...localData, horsepower: e.target.value })}
          />
        </FieldWrapper>

        <FieldWrapper label="Pojemność (cm3)" auto={isAutoFilled("engine")}>
          <input
            list="engines"
            type="text"
            placeholder="Np. 1998"
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
            value={localData.engine}
            onChange={(e) => setLocalData({ ...localData, engine: e.target.value })}
          />
          <datalist id="engines">
            {engines.map((e) => <option key={e} value={e} />)}
          </datalist>
        </FieldWrapper>

        <FieldWrapper label="Kraj pochodzenia" auto={isAutoFilled("country")}>
          <input
            type="text"
            placeholder="Np. Niemcy"
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
            value={localData.country}
            onChange={(e) => setLocalData({ ...localData, country: e.target.value })}
          />
        </FieldWrapper>

        <FieldWrapper label="Bezwypadkowość" auto={isAutoFilled("accidentHistory")}>
          <select
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
            value={localData.accidentHistory}
            onChange={(e) => setLocalData({ ...localData, accidentHistory: e.target.value })}
          >
            <option value="">Wybierz</option>
            <option value="Yes">Tak</option>
            <option value="No">Nie</option>
          </select>
        </FieldWrapper>

        <FieldWrapper label="Historia Serwisowa" auto={isAutoFilled("serviceHistory")}>
          <select
            className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-white dark:bg-dark-main dark:text-white"
            value={localData.serviceHistory}
            onChange={(e) => setLocalData({ ...localData, serviceHistory: e.target.value })}
          >
            <option value="">Wybierz</option>
            <option value="Yes">Tak</option>
            <option value="No">Nie</option>
          </select>
        </FieldWrapper>

        {/* Map Location Section */}
        <div className="col-span-2">
          <div className="border-2 border-gray-50 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
            <div
              className="flex items-center justify-between bg-gray-50 dark:bg-dark-card p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setShowMap(!showMap)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-xl">
                  <FaMapMarkerAlt className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-200 dark:text-gray-100">Lokalizacja Pojazdu</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ustaw gdzie można obejrzeć auto</p>
                </div>
              </div>
              <div className={`transition-transform duration-300 ${showMap ? "rotate-180" : ""}`}>
                <FaChevronDown className="text-gray-400 dark:text-gray-300" />
              </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showMap ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="p-4 bg-white dark:bg-dark-main">
                <CustomMap
                  location={localData.location}
                  setLocation={handleLocationChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="col-span-2 flex justify-between items-center mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={prevStep}
            className="text-gray-500 dark:text-gray-400 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold"
          >
            Wstecz
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white font-bold px-12 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-md dark:shadow-blue-900"
          >
            Następny Krok
          </button>
        </div>
      </div>
    </div>
  );
}
