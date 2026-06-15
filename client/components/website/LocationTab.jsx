import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "../../lib/GoogleMapsContext";

const LocationTab = ({ location }) => {
  const { isLoaded } = useGoogleMaps();

  if (!isLoaded) return <div>Loading...</div>;

  // Extract coordinates from location object
  const coordinates = location.coordinates;
  const lat = coordinates[1]; // Latitude
  const lng = coordinates[0]; // Longitude

  return (
    <div className="w-full">
      {/* Google Map */}
      <GoogleMap
        zoom={10}
        center={{ lat: lat, lng: lng }} // Set center using coordinates
        mapContainerClassName="w-full h-96 rounded-lg"
      >
        {/* Display Marker if coordinates are available */}
        {lat && lng && <Marker position={{ lat: lat, lng: lng }} />}
      </GoogleMap>
    </div>
  );
};

export default LocationTab;
