"use client";
import { useState } from "react";

export default function StepThree({ nextStep, prevStep, updateFormData, formData }) {
  // Polish label -> English enum value mapping expected by backend
  const CONDITION_OPTS = [
    { label: "Nowy", value: "New" },
    { label: "Bardzo Dobry", value: "Very Good" },
    { label: "Dobry", value: "Good" },
    { label: "Normalny", value: "Normal" },
    { label: "Zły", value: "Bad" },
  ];
  const plToEn: Record<string, string> = {
    "Nowy": "New",
    "Bardzo Dobry": "Very Good",
    "Dobry": "Good",
    "Normalny": "Normal",
    "Zły": "Bad",
  };

  const normalize = (v: string) => (plToEn[v] ? plToEn[v] : v || "");

  const [localData, setLocalData] = useState({
    // Ensure ENGLISH values are stored
    interior: normalize(formData.condition.interior),
    mechanical: normalize(formData.condition.mechanical),
    paintandBody: normalize(formData.condition.paintandBody),
    frameandUnderbody: normalize(formData.condition.frameandUnderbody),
    overall: normalize(formData.condition.overall),
  });

  const [warranties, setWarranties] = useState<any[]>(formData.warranties || []);

  const handleNext = () => {
    updateFormData({ condition: localData, warranties });
    nextStep();
  };

  const isNewCar = formData.conditionType === "New";

  return (
    <div className="bg-white dark:bg-dark-main rounded-lg w-full transition-colors">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white">Krok 4: Stan Auta</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Określ stan wizualny i techniczny swojego pojazdu.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {!isNewCar && (
          <>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-gray-700 dark:text-gray-300">Stan Wnętrza</label>
              <select
                className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent dark:bg-dark-main dark:text-white"
                value={localData.interior}
                onChange={(e) => setLocalData({ ...localData, interior: e.target.value })}
              >
                <option value="">Wybierz Stan Wnętrza</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-gray-700 dark:text-gray-300">Stan Mechaniczny</label>
              <select
                className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent dark:bg-dark-main dark:text-white"
                value={localData.mechanical}
                onChange={(e) => setLocalData({ ...localData, mechanical: e.target.value })}
              >
                <option value="">Wybierz Stan Mechaniczny</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-gray-700 dark:text-gray-300">Stan Lakieru i Karoserii</label>
              <select
                className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent dark:bg-dark-main dark:text-white"
                value={localData.paintandBody}
                onChange={(e) => setLocalData({ ...localData, paintandBody: e.target.value })}
              >
                <option value="">Wybierz Stan Lakieru i Karoserii</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-gray-700 dark:text-gray-300">Stan Ramy i Podwozia</label>
              <select
                className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent dark:bg-dark-main dark:text-white"
                value={localData.frameandUnderbody}
                onChange={(e) => setLocalData({ ...localData, frameandUnderbody: e.target.value })}
              >
                <option value="">Wybierz Stan Ramy i Podwozia</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-gray-700 dark:text-gray-300">Stan Ogólny</label>
              <select
                className="border-2 border-gray-100 dark:border-gray-700 p-4 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-semibold bg-transparent dark:bg-dark-main dark:text-white"
                value={localData.overall}
                onChange={(e) => setLocalData({ ...localData, overall: e.target.value })}
              >
                <option value="">Wybierz Stan Ogólny</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {(isNewCar || localData.overall === "New") && (
          <div className="col-span-2 mt-8 p-8 bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white mb-2">Gwarancja (dla nowych aut)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-2xl">
              Dodaj opcje gwarancji doliczane do ceny podstawowej.
            </p>
            <div className="space-y-6">
              {warranties.map((w, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-white dark:bg-dark-main border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm relative group">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Lata</label>
                    <select
                      className="border-2 border-gray-50 dark:border-gray-700 p-3 w-full rounded-xl h-12 bg-gray-50/50 dark:bg-dark-card focus:border-blue-400 transition-all font-semibold dark:text-white"
                      value={w.years || ""}
                      onChange={(e) => {
                        const years = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        const next = [...warranties];
                        next[index] = { ...next[index], years };
                        setWarranties(next);
                      }}
                    >
                      <option value="">Wybierz</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((y) => (
                        <option key={y} value={y}>{y} Lat{y > 1 ? 'a' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Limit (KM)</label>
                    <input
                      type="number"
                      placeholder="Np. 100000"
                      className="border-2 border-gray-50 dark:border-gray-700 p-3 w-full rounded-xl h-12 bg-gray-50/50 dark:bg-dark-card focus:border-blue-400 transition-all font-semibold dark:text-white"
                      value={w.mileageLimit || ""}
                      onChange={(e) => {
                        const mileageLimit = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        const next = [...warranties];
                        next[index] = { ...next[index], mileageLimit };
                        setWarranties(next);
                      }}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Opis</label>
                    <textarea
                      placeholder="Szczegóły gwarancji..."
                      className="border-2 border-gray-50 dark:border-gray-700 p-4 w-full rounded-xl min-h-[100px] bg-gray-50/50 dark:bg-dark-card focus:border-blue-400 transition-all dark:text-white"
                      value={w.description || ""}
                      onChange={(e) => {
                        const description = e.target.value;
                        const next = [...warranties];
                        next[index] = { ...next[index], description };
                        setWarranties(next);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setWarranties(warranties.filter((_, i) => i !== index))}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setWarranties([...warranties, { years: undefined, mileageLimit: undefined, description: "" }])}
              className="mt-6 w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              + Dodaj kolejną gwarancję
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
        <button
          onClick={prevStep}
          className="text-gray-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all"
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
  );
}