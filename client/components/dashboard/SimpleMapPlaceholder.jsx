"use client";
import { useState } from "react";
import { MapPin, Search } from "lucide-react";

/**
 * Simple map placeholder - replaces Google Maps
 * Just shows location coordinates and allows manual entry
 */
export default function SimpleMapPlaceholder({ location, setLocation }) {
  const [coords, setCoords] = useState({
    lat: location?.coordinates?.[1] || 51.5074,
    lng: location?.coordinates?.[0] || -0.1278
  });

  const handleUpdate = () => {
    setLocation({
      type: "Point",
      coordinates: [coords.lng, coords.lat]
    });
  };

  return (
    <div className="w-full h-96 bg-gray-100 dark:bg-dark-raised rounded-xl flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-dark-divider">
      <MapPin className="w-16 h-16 text-blue-500 mb-4" />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Location Coordinates</h3>
      <p className="text-md text-gray-500 mb-6 text-center">
        Enter your location coordinates or get them from Google Maps
      </p>

      <div className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Latitude</label>
          <input
            type="number"
            step="0.000001"
            value={coords.lat}
            onChange={(e) => setCoords({ ...coords, lat: parseFloat(e.target.value) })}
            className="w-full border-2 border-gray-200 dark:border-dark-divider p-3 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-dark-main"
            placeholder="51.5074"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Longitude</label>
          <input
            type="number"
            step="0.000001"
            value={coords.lng}
            onChange={(e) => setCoords({ ...coords, lng: parseFloat(e.target.value) })}
            className="w-full border-2 border-gray-200 dark:border-dark-divider p-3 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-dark-main"
            placeholder="-0.1278"
          />
        </div>

        <button
          type="button"
          onClick={handleUpdate}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Update Location
        </button>

        <p className="text-sm text-gray-400 text-center">
          Get coordinates from{" "}
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Google Maps
          </a>
          {" "}by right-clicking on your location
        </p>
      </div>
    </div>
  );
}
