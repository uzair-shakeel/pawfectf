"use client";
// REMOVED: Google Maps - was making the site slow
// Components now use location.city directly instead of geocoding

export function GoogleMapsProvider({ children }) {
  return <>{children}</>;
}

export function useGoogleMaps() {
  // Return a stub - no longer using Google Maps
  return {
    isLoaded: false,
    loadError: null,
    getGeocodingData: () => Promise.resolve({ city: "", state: "" })
  };
}
