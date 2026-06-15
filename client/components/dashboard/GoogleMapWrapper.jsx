"use client";
import React from "react";
import { GoogleMapsProvider } from "../../lib/GoogleMapsContext";

const GoogleMapWrapper = ({ children }) => {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
};

export default GoogleMapWrapper;
