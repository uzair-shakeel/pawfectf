"use client";
import { useState } from "react";

export default function StepFour({ nextStep, prevStep, updateFormData, formData }) {
  // Polish label -> English value mappings expected by backend
  const SELL_OPTIONS = [
    { label: "Wynajem długoterminowy", value: "Long term rental" },
    { label: "Leasing", value: "Lease" },
    { label: "Finansowanie/Kredyt", value: "Financing" },
    { label: "Gotówka", value: "Cash" },
  ];
  const INVOICE_OPTIONS = [
    { label: "Faktura", value: "Invoice" },
    { label: "Faktura VAT", value: "Invoice VAT" },
    { label: "Umowa Kupna Sprzedaży", value: "Selling Agreement" },
  ];

  const polishToEnglishSell: Record<string, string> = {
    "Wynajem długoterminowy": "Long term rental",
    Leasing: "Lease",
    "Finansowanie/Kredyt": "Financing",
    "Gotówka": "Cash",
    // Remove unsupported: Crypto (no mapping)
  };
  const polishToEnglishInvoice: Record<string, string> = {
    "Faktura": "Invoice",
    "Faktura Vat Marża": "Invoice VAT",
    "Faktura VAT": "Invoice VAT",
    "Umowa Kupna Sprzedaży": "Selling Agreement",
  };

  const normalizeValues = (arr: any[], map: Record<string, string>) =>
    (Array.isArray(arr) ? arr : [])
      .map((v) => (map[v] ? map[v] : v))
      .filter((v) => typeof v === "string");

  const [localData, setLocalData] = useState({
    // Ensure we store ENGLISH values
    sellOptions: normalizeValues(formData.financialInfo.sellOptions, polishToEnglishSell),
    invoiceOptions: normalizeValues(formData.financialInfo.invoiceOptions, polishToEnglishInvoice),
    sellerType: formData.financialInfo.sellerType || "private",
    priceNetto: formData.financialInfo.priceNetto || "",
    isFeatured: formData.isFeatured || false,
  });

  // UI lists: show Polish labels but toggle English values in state
  const sellOptionsList = SELL_OPTIONS;
  const invoiceOptionsList = INVOICE_OPTIONS;

  const handleCheckboxChange = (category: "sellOptions" | "invoiceOptions", value: string) => {
    setLocalData((prev) => {
      const updatedList = prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updatedList };
    });
  };

  const handleNext = () => {
    if (localData.sellOptions.length === 0) {
      alert("Please select at least one Sell option.");
      return;
    }
    if (localData.invoiceOptions.length === 0) {
      alert("Please select at least one Invoice option.");
      return;
    }
    if (!localData.priceNetto) {
      alert("Please enter the price.");
      return;
    }
    console.log("Updating formData with (english values):", localData);
    // Persist financial info and isFeatured into parent formData
    const { isFeatured, ...financialLocal } = localData as any;
    updateFormData({
      financialInfo: { ...formData.financialInfo, ...financialLocal },
      isFeatured: Boolean(isFeatured),
    });
    nextStep();
  };

  return (
    <div className="bg-white dark:bg-dark-main rounded-lg w-full transition-colors">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white">Krok 5: Finansowe Informacje</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Skonfiguruj cenę i opcje sprzedaży swojego pojazdu.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-50/50 dark:bg-dark-main p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold mb-4 uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Opcje Sprzedaży
          </label>
          <div className="grid grid-cols-2 gap-3">
            {sellOptionsList.map((option, index) => (
              <label
                key={index}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${localData.sellOptions.includes(option.value) ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 shadow-sm' : 'border-gray-50 dark:border-gray-700 bg-white dark:bg-dark-main hover:border-gray-200 dark:hover:border-gray-600'}`}
              >
                <input
                  type="checkbox"
                  checked={localData.sellOptions.includes(option.value)}
                  onChange={() => handleCheckboxChange("sellOptions", option.value)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-dark-card"
                />
                <span className={`text-sm font-bold ${localData.sellOptions.includes(option.value) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-50/50 dark:bg-dark-main p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold mb-4 uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Sposób Sprzedaży
          </label>
          <div className="grid grid-cols-2 gap-3">
            {invoiceOptionsList.map((option, index) => (
              <label
                key={index}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${localData.invoiceOptions.includes(option.value) ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 shadow-sm' : 'border-gray-50 dark:border-gray-700 bg-white dark:bg-dark-main hover:border-gray-200 dark:hover:border-gray-600'}`}
              >
                <input
                  type="checkbox"
                  checked={localData.invoiceOptions.includes(option.value)}
                  onChange={() => handleCheckboxChange("invoiceOptions", option.value)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-dark-card"
                />
                <span className={`text-sm font-bold ${localData.invoiceOptions.includes(option.value) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          {localData.invoiceOptions.includes("Invoice VAT") ? (
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-gray-700 dark:text-gray-300">Cena (Netto)</label>
                <div className="relative group">
                  <input
                    type="number"
                    placeholder="Wprowadź cenę netto"
                    className="border-2 border-gray-100 dark:border-gray-700 p-4 pl-12 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-bold text-lg bg-white dark:bg-dark-main dark:text-white"
                    value={localData.priceNetto}
                    onChange={(e) =>
                      setLocalData({ ...localData, priceNetto: e.target.value })
                    }
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</div>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium italic">* Cena brutto zostanie obliczona automatycznie w ogłoszeniu</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-gray-700 dark:text-gray-300">Cena</label>
              <div className="relative group">
                <input
                  type="number"
                  placeholder="Wprowadź cenę"
                  className="border-2 border-gray-100 dark:border-gray-700 p-4 pl-12 w-full rounded-xl h-14 focus:border-blue-500 transition-all font-bold text-lg bg-white dark:bg-dark-main dark:text-white"
                  value={localData.priceNetto}
                  onChange={(e) =>
                    setLocalData({ ...localData, priceNetto: e.target.value })
                  }
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-start space-x-4">
            <div className="mt-1">
              <input
                type="checkbox"
                id="isFeatured"
                className="w-5 h-5 text-blue-600 bg-white dark:bg-dark-card border-blue-200 dark:border-blue-500 rounded-lg focus:ring-blue-500"
                checked={localData.isFeatured}
                onChange={(e) => setLocalData({ ...localData, isFeatured: e.target.checked })}
              />
            </div>
            <label htmlFor="isFeatured" className="cursor-pointer">
              <span className="block text-gray-900 dark:text-gray-200 dark:text-white font-bold mb-1">Oznacz jako polecany samochód</span>
              <span className="block text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Polecane samochody zostaną wyróżnione i wyeksponowane na stronie głównej oraz w wynikach wyszukiwania.
              </span>
            </label>
          </div>
        </div>
      </div>

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