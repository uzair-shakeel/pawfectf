"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { Sparkles } from "lucide-react";

const FieldWrapper = ({ label, auto, children }: { label: string, auto: boolean, children: React.ReactNode }) => {
  return (
    <div className="col-span-2 md:col-span-1">
      <label className={`flex items-center gap-1.5 text-sm font-semibold mb-2 uppercase tracking-wider ${auto ? 'text-blue-600' : 'text-gray-700'}`}>
        {label}
        {auto && <Sparkles size={14} className="text-blue-500" />}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default function StepTwo({
  nextStep,
  prevStep,
  updateFormData,
  formData,
  makesModelsData,
}) {
  const { getToken } = useAuth();
  const [localData, setLocalData] = useState({
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
    vin: formData.vin || "",
    country: formData.country || "",
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

  const handleNext = () => {
    if (!localData.type) {
      alert("Typ pojazdu jest wymagany.");
      return;
    }
    updateFormData(localData);
    nextStep();
  };

  const isAutoFilled = (field: string) => {
    return formData.vinFields?.includes(field);
  };

  return (
    <div className="bg-white rounded-lg w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Krok 4: Szczegóły Techniczne</h2>
        {formData.vinFields?.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100 shadow-sm">
            <Sparkles size={14} />
            <span>{formData.vinFields.length} Danych pobranych z VIN</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8">
        <FieldWrapper label="Wersja / Trim" auto={isAutoFilled("trim")}>
          <input
            type="text"
            placeholder="Np. Competition, M-Package"
            className={`border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent`}
            value={localData.trim}
            onChange={(e) => setLocalData({ ...localData, trim: e.target.value })}
          />
        </FieldWrapper>

        <FieldWrapper label="Typ Nadwozia" auto={isAutoFilled("type")}>
          <select
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
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
          </select>
        </FieldWrapper>

        <FieldWrapper label="Rok Produkcji" auto={isAutoFilled("year")}>
          <select
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
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
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
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
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
            value={localData.mileage}
            onChange={(e) => setLocalData({ ...localData, mileage: e.target.value })}
          />
        </FieldWrapper>

        <FieldWrapper label="Napęd" auto={isAutoFilled("drivetrain")}>
          <select
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
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
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
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
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
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
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
            value={localData.horsepower}
            onChange={(e) => setLocalData({ ...localData, horsepower: e.target.value })}
          />
        </FieldWrapper>

        <FieldWrapper label="Pojemność (cm3)" auto={isAutoFilled("engine")}>
          <input
            list="engines"
            type="text"
            placeholder="Np. 1998"
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
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
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
            value={localData.country}
            onChange={(e) => setLocalData({ ...localData, country: e.target.value })}
          />
        </FieldWrapper>

        <FieldWrapper label="Bezwypadkowość" auto={isAutoFilled("accidentHistory")}>
          <select
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
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
            className="border-2 border-gray-100 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent"
            value={localData.serviceHistory}
            onChange={(e) => setLocalData({ ...localData, serviceHistory: e.target.value })}
          >
            <option value="">Wybierz</option>
            <option value="Yes">Tak</option>
            <option value="No">Nie</option>
          </select>
        </FieldWrapper>

        <div className="col-span-2 flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
          <button
            onClick={prevStep}
            className="text-gray-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all font-bold"
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
