"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";

// Libraries we need for all map components
const libraries = ["places"];

// Create context
const GoogleMapsContext = createContext(null);

// Provider component
export function GoogleMapsProvider({ children }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
    // Add these to prevent unnecessary reloads
    googleMapsClientId: "ojestSell-app",
  });

  // Geocoding cache to prevent duplicate API calls
  const [geocodingCache, setGeocodingCache] = useState({});

  // Function to get cached geocoding data or fetch new
  const getGeocodingData = async (latitude, longitude) => {
    const cacheKey = `${latitude},${longitude}`;

    // Return from cache if available
    if (geocodingCache[cacheKey]) {
      return geocodingCache[cacheKey];
    }

    // Otherwise fetch and cache
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        // Process the data
        const addressComponents = data.results[0].address_components;
        let city = "";
        let state = "";

        // Extract city and state
        addressComponents.forEach((component) => {
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
        });

        const result = { city, state };

        // Cache the result
        setGeocodingCache((prev) => ({
          ...prev,
          [cacheKey]: result,
        }));

        return result;
      }
      return { city: "", state: "" };
    } catch (error) {
      console.error("Error fetching address:", error);
      return { city: "", state: "" };
    }
  };

  return (
    <GoogleMapsContext.Provider
      value={{ isLoaded, loadError, getGeocodingData }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
}

// Custom hook to use the Google Maps context
export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === null) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
}
