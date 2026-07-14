import React from "react";
import { MapPin } from "lucide-react";

const LocationTab = ({ location }) => {
  // Extract coordinates from location object
  const coordinates = location?.coordinates;
  if (!coordinates) {
    return (
      <div className="w-full h-96 bg-gray-100 dark:bg-dark-raised rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No location data available</p>
        </div>
      </div>
    );
  }

  const lat = coordinates[1]; // Latitude
  const lng = coordinates[0]; // Longitude

  return (
    <div className="w-full">
      <div className="w-full h-96 bg-gray-100 dark:bg-dark-raised rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-divider">
        <div className="text-center p-6">
          <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Location</h3>
          <p className="text-md text-gray-600 dark:text-gray-400 mb-4">
            Latitude: {lat?.toFixed(6)}<br />
            Longitude: {lng?.toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-md font-medium"
          >
            <MapPin className="w-4 h-4" />
            View on Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default LocationTab;
