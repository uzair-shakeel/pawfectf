"use client";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "../../../lib/GoogleMapsContext";
import { useState, useEffect } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function StepFive({
  prevStep,
  handleSubmit,
  formData,
  updateFormData,
  loading,
}) {
  const { isLoaded, getGeocodingData } = useGoogleMaps();
  const [locationDetails, setLocationDetails] = useState({
    city: "",
    state: "",
  });

  // Fetch location details when component loads
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (formData.location?.coordinates?.length === 2) {
        try {
          const details = await getGeocodingData(
            formData.location.coordinates[1],
            formData.location.coordinates[0]
          );
          setLocationDetails(details);
        } catch (error) {
          console.error("Error fetching location details:", error);
        }
      }
    };

    if (isLoaded) {
      fetchLocationDetails();
    }
  }, [formData.location, isLoaded, getGeocodingData]);

  // Translation maps for all values
  const conditionKeyMap = {
    interior: "Stan Wnętrza",
    mechanical: "Stan Mechaniczny",
    paintandBody: "Stan Lakieru i Karoserii",
    frameandUnderbody: "Stan Ramy i Podwozia",
    overall: "Stan Ogólny",
  };

  const conditionValueMap = {
    "Excellent": "Doskonały",
    "Very Good": "Bardzo Dobry",
    "Good": "Dobry",
    "Fair": "Dostateczny",
    "Poor": "Słaby",
  };

  const transmissionMap = {
    "Automatic": "Automat",
    "Manual": "Manualna",
    "Semi-Automatic": "Półautomat",
    "CVT": "CVT",
  };

  const fuelMap = {
    "Petrol": "Benzyna",
    "Diesel": "Diesel",
    "Electric": "Elektryczny",
    "Hybrid": "Hybryda",
    "Plug-in Hybrid": "Hybryda Plug-in",
    "Hydrogen": "Wodór",
    "LPG": "LPG",
    "CNG": "CNG",
  };

  const drivetrainMap = {
    "FWD": "Przedni",
    "RWD": "Tylny",
    "AWD": "Napęd na wszystkie koła",
    "4WD": "4x4",
  };

  const yesNoMap = {
    "Yes": "Tak",
    "No": "Nie",
  };

  const sellerTypeMap = {
    "private": "Prywatny",
    "dealer": "Dealer",
    "company": "Firma",
  };

  const sellOptionsMap = {
    "Long term rental": "Wynajem długoterminowy",
    "Short term rental": "Wynajem krótkoterminowy",
    "Lease": "Leasing",
    "Cash only": "Tylko gotówka",
  };

  const invoiceOptionsMap = {
    "Selling Agreement": "Umowa Sprzedaży",
    "Invoice": "Faktura",
    "VAT Invoice": "Faktura VAT",
    "Receipt": "Paragon",
  };

  // Helper function to translate values
  const translateValue = (value, map) => {
    if (!value) return "N/A";
    if (Array.isArray(value)) {
      return value.map(v => map[v] || v).join(", ");
    }
    return map[value] || value;
  };

  const SummaryItem = ({ label, value, fullWidth = false }) => (
    <div className={`${fullWidth ? 'col-span-2' : 'col-span-1'} space-y-1`}>
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="font-bold text-gray-900 dark:text-gray-200 dark:text-gray-100 leading-tight">{value || "N/A"}</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-dark-main rounded-lg transition-colors duration-300">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-200 dark:text-white transition-colors duration-300">
        Krok 7: Przejrzyj i Potwierdź
      </h2>

      <div className="space-y-8">
        {/* Basic Info Section */}
        <div className="bg-gray-50/50 dark:bg-dark-main rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-100/50 dark:bg-dark-main border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-200 dark:text-gray-100 uppercase tracking-widest text-xs">Informacje Podstawowe</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <SummaryItem label="Tytuł" value={formData.title} fullWidth />
              <SummaryItem label="Notatki Sprzedającego" value={formData.description || "Brak"} fullWidth />
              <SummaryItem label="Marka" value={formData.make} />
              <SummaryItem label="Model" value={formData.model} />
              <SummaryItem label="Wersja" value={formData.trim || "Brak"} />
              <SummaryItem label="Typ" value={formData.type} />
              <SummaryItem label="Rok" value={formData.year} />
              <SummaryItem label="Przebieg" value={formData.mileage ? `${formData.mileage} km` : "N/A"} />
              <SummaryItem label="Skrzynia" value={translateValue(formData.transmission, transmissionMap)} />
              <SummaryItem label="Paliwo" value={translateValue(formData.fuel, fuelMap)} />
              <SummaryItem label="Silnik" value={formData.engine ? `${formData.engine} cm3` : "N/A"} />
              <SummaryItem label="Moc" value={formData.horsepower ? `${formData.horsepower} KM` : "N/A"} />
              <SummaryItem label="Bezwypadkowy" value={translateValue(formData.accidentHistory, yesNoMap)} />
              <SummaryItem label="Serwisowany" value={translateValue(formData.serviceHistory, yesNoMap)} />
              <SummaryItem label="VIN" value={formData.vin || "Brak"} />
              <SummaryItem label="Kraj" value={formData.country || "Polska"} />
              {formData.generatedListing && (
                <div className="col-span-2 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Wygenerowany Opis Ojest</p>
                  <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-6 whitespace-pre-line font-medium">
                    {formData.generatedListing}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Condition Section */}
        <div className="bg-gray-50/50 dark:bg-dark-main rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-100/50 dark:bg-dark-main border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-200 dark:text-gray-100 uppercase tracking-widest text-xs">Stan Pojazdu</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {Object.entries(formData.condition).map(([key, value]) => (
                <SummaryItem
                  key={key}
                  label={conditionKeyMap[key] || key}
                  value={translateValue(value, conditionValueMap)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Financial Info Section */}
        <div className="bg-gray-50/50 dark:bg-dark-main rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-100/50 dark:bg-dark-main border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-200 dark:text-gray-100 uppercase tracking-widest text-xs">Finanse i Sprzedaż</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <SummaryItem label="Opcje Sprzedaży" value={translateValue(formData.financialInfo.sellOptions, sellOptionsMap)} />
              <SummaryItem label="Dokumentacja" value={translateValue(formData.financialInfo.invoiceOptions, invoiceOptionsMap)} />
              <SummaryItem label="Typ Sprzedawcy" value={translateValue(formData.financialInfo.sellerType, sellerTypeMap)} />
              <div className="col-span-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Cena</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {formData.financialInfo.invoiceOptions.includes("Invoice VAT")
                    ? `${formData.financialInfo.priceNetto} € (Netto)`
                    : `${formData.financialInfo.priceNetto} €`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-gray-50/50 dark:bg-dark-main rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-100/50 dark:bg-dark-main border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-200 dark:text-gray-100 uppercase tracking-widest text-xs">Lokalizacja</h3>
          </div>
          <div className="p-6">
            {locationDetails.city && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-white dark:bg-dark-main border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FaMapMarkerAlt className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-200 dark:text-white leading-none">{locationDetails.city}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{locationDetails.state || "Polska"}</p>
                </div>
              </div>
            )}
            <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm shadow-gray-50">
              {isLoaded && formData.location && (
                <GoogleMap
                  zoom={12}
                  center={{
                    lat: formData.location.coordinates[1],
                    lng: formData.location.coordinates[0],
                  }}
                  mapContainerClassName="w-full h-full"
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                  }}
                >
                  <Marker
                    position={{
                      lat: formData.location.coordinates[1],
                      lng: formData.location.coordinates[0],
                    }}
                  />
                </GoogleMap>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 relative">
        <button
          onClick={prevStep}
          disabled={loading}
          className="text-gray-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Wstecz
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 text-white font-bold px-12 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center gap-2 disabled:bg-green-400"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Zapisywanie...
            </>
          ) : (
            "Zatwierdź i Wyślij"
          )}
        </button>
      </div>

      {/* Global Processing Overlay if loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-main p-6 rounded-xl shadow-2xl flex flex-col items-center text-gray-900 dark:text-gray-200 dark:text-white">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Tworzenie Twojego Ogłoszenia</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Przetwarzanie zdjęć i danych...</p>
          </div>
        </div>
      )}
    </div>
  );
}
