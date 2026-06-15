import { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  InfoWindow,
} from "@react-google-maps/api";
import { useGoogleMaps } from "../../lib/GoogleMapsContext";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const CustomMap = ({ location, setLocation }) => {
  const { isLoaded, getGeocodingData } = useGoogleMaps();
  const [autocomplete, setAutocomplete] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    city: "",
    state: "",
  });
  const inputRef = useRef(null);

  // Fetch location details when coordinates change
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (location?.coordinates?.length === 2) {
        try {
          const details = await getGeocodingData(
            location.coordinates[1],
            location.coordinates[0]
          );
          setLocationDetails(details);
        } catch (error) {
          console.error("Error fetching location details:", error);
        }
      }
    };

    fetchLocationDetails();
  }, [location?.coordinates, getGeocodingData]);

  // Handle user selecting a location from autocomplete suggestions
  const onPlaceSelected = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setLocation({
          ...location,
          type: "Point",
          coordinates: [
            place.geometry.location.lng(),
            place.geometry.location.lat(),
          ],
        });
        setShowInfoWindow(true);
      }
    }
  };

  // Map is not loaded yet
  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-dark-main rounded-lg">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="w-full mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <Autocomplete
          onLoad={(autocompleteInstance) =>
            setAutocomplete(autocompleteInstance)
          }
          onPlaceChanged={onPlaceSelected}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for a location or address"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-main dark:text-white"
          />
        </Autocomplete>
      </div>

      {/* Location Details */}
      {locationDetails.city && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg flex items-center">
          <FaMapMarkerAlt className="text-blue-500 dark:text-blue-400 mr-2" />
          <div className="text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-gray-200 dark:text-gray-100">Selected Location:</span>{" "}
            {locationDetails.city}
            {locationDetails.state ? `, ${locationDetails.state}` : ""}
          </div>
        </div>
      )}

      {/* Google Map */}
      <GoogleMap
        zoom={12}
        center={{
          lat: location.coordinates[1],
          lng: location.coordinates[0],
        }}
        mapContainerClassName="w-full h-[350px] rounded-lg shadow-md"
        options={{
          fullscreenControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          zoomControl: true,
        }}
        onClick={(e) => {
          setLocation({
            ...location,
            coordinates: [e.latLng.lng(), e.latLng.lat()],
          });
          setShowInfoWindow(true);
        }}
      >
        {location.coordinates[0] && location.coordinates[1] && (
          <Marker
            position={{
              lng: location.coordinates[0],
              lat: location.coordinates[1],
            }}
            animation={window.google?.maps?.Animation?.DROP}
            onClick={() => setShowInfoWindow(true)}
          >
            {showInfoWindow && (
              <InfoWindow
                position={{
                  lng: location.coordinates[0],
                  lat: location.coordinates[1],
                }}
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <div className="p-1">
                  <p className="font-medium">
                    {locationDetails.city}
                    {locationDetails.state ? `, ${locationDetails.state}` : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    Click elsewhere on the map to change location
                  </p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}
      </GoogleMap>
    </div>
  );
};

export default CustomMap;
