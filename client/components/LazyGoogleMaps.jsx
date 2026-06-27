"use client";
import dynamic from 'next/dynamic';
import { GoogleMapsProvider } from '../lib/GoogleMapsContext';

// This wrapper only loads Google Maps when the component is actually rendered
// Use this in dashboard pages that need maps instead of loading it globally
const LazyGoogleMapsProvider = ({ children }) => {
  return (
    <GoogleMapsProvider>
      {children}
    </GoogleMapsProvider>
  );
};

export default LazyGoogleMapsProvider;
