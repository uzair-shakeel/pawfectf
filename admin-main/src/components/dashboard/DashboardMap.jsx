import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createShipIcon, createPinIcon, iconStyle } from "./MapIcons";

const DashboardMap = ({
  ships,
  selectedShip,
  onShipSelect,
  mapRef,
  startDate,
  endDate,
}) => {
  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-4 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Ship Locations & Routes</h2>
        {startDate && endDate && (
          <div className="text-sm text-gray-300 mt-1 md:mt-0">
            Showing data from {formatDate(startDate)} to {formatDate(endDate)}
          </div>
        )}
      </div>
      <div className="h-[400px] rounded-lg overflow-hidden">
        <style>{iconStyle}</style>
        <MapContainer
          center={[40, -50]}
          zoom={3}
          style={{ height: "100%", width: "100%" }}
          minZoom={2}
          ref={mapRef}
        >
          {/* Land layer */}
          <TileLayer
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
            zIndex={1}
          />
          {/* OpenSeaMap layer */}
          <TileLayer
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            zIndex={2}
          />

          {/* Ship markers and routes */}
          {ships.map((ship) => (
            <React.Fragment key={ship.id}>
              {/* Start Position Pin */}
              {ship.path?.length > 0 && (
                <Marker
                  position={ship.path[0]}
                  icon={createPinIcon()}
                  zIndexOffset={900}
                >
                  <Popup>
                    <div className="text-gray-900">
                      <h3 className="font-bold">{ship.name} - Start Point</h3>
                      <p>IMO: {ship.imo}</p>
                      <p>
                        Position: {ship.path[0][0].toFixed(4)}°N,{" "}
                        {ship.path[0][1].toFixed(4)}°E
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Current Position with Ship Icon */}
              <Marker
                position={[
                  ship.position?.latitude || 0,
                  ship.position?.longitude || 0,
                ]}
                icon={createShipIcon()}
                zIndexOffset={1000}
                eventHandlers={{
                  click: () => onShipSelect(ship),
                }}
              >
                <Popup>
                  <div className="text-gray-900">
                    <h3 className="font-bold">{ship.name}</h3>
                    <p>IMO: {ship.imo}</p>
                    <p>Status: {ship.status}</p>
                    <p>
                      Position: {ship.position?.latitude?.toFixed(4)}°N,{" "}
                      {ship.position?.longitude?.toFixed(4)}°E
                    </p>
                    <p>Wind Speed: {ship.statistics?.wind_speed?.avg} knots</p>
                    <p>Fan Speed: {ship.statistics?.fan_speed?.avg}</p>
                    <p>Destination: {ship.destination}</p>
                    <p>ETA: {ship.eta}</p>
                  </div>
                </Popup>
              </Marker>

              {/* End Position Pin */}
              {ship.path?.length > 1 && (
                <Marker
                  position={ship.path[ship.path.length - 1]}
                  icon={createPinIcon()}
                  zIndexOffset={900}
                >
                  <Popup>
                    <div className="text-gray-900">
                      <h3 className="font-bold">{ship.name} - End Point</h3>
                      <p>IMO: {ship.imo}</p>
                      <p>
                        Position:{" "}
                        {ship.path[ship.path.length - 1][0].toFixed(4)}°N,{" "}
                        {ship.path[ship.path.length - 1][1].toFixed(4)}°E
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Simple Route Line */}
              {ship.path?.length > 1 && (
                <Polyline
                  positions={ship.path}
                  color={ship.color}
                  weight={3}
                  opacity={selectedShip?.id === ship.id ? 0.9 : 0.4}
                />
              )}
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default DashboardMap;
