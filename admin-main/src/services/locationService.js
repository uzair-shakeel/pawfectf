import axios from "axios";

const IPGEOLOCATION_API_KEY = "fc48d07774ae44f2872eced8e43b6f1a";
const IPGEOLOCATION_API_URL = "https://api.ipgeolocation.io/ipgeo";

// Create a dedicated axios instance for ipgeolocation API
const locationApi = axios.create({
  baseURL: IPGEOLOCATION_API_URL,
  params: {
    apiKey: IPGEOLOCATION_API_KEY,
  },
  timeout: 5000, // 5 second timeout
});

// Cache the location check result
let locationCheckCache = {
  timestamp: null,
  result: null,
  error: null,
};

// Development flag - set to true to bypass VPN check
const DEV_MODE = true; // Always bypass in development for easier testing

// Function to log VPN status with styling
const logVPNStatus = (status, data) => {
  const styles = {
    success:
      "background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;",
    error:
      "background: #f44336; color: white; padding: 2px 5px; border-radius: 2px;",
    info: "background: #2196F3; color: white; padding: 2px 5px; border-radius: 2px;",
  };

  if (status === "success") {
    console.log("%c✓ VPN Status: Connected to Netherlands", styles.success);
  } else if (status === "error") {
    console.log("%c✗ VPN Status: Not connected to Netherlands", styles.error);
  }

  console.log("%c Location Details", styles.info, data);
};

// Service to handle location-based operations
export const locationService = {
  // Get location data for Netherlands VPN
  getNetherlands: async (bypassCheck = DEV_MODE) => {
    try {
      // Check cache if it's less than 5 minutes old
      const now = Date.now();
      if (
        locationCheckCache.timestamp &&
        now - locationCheckCache.timestamp < 5 * 60 * 1000
      ) {
        if (locationCheckCache.error) {
          throw locationCheckCache.error;
        }
        return locationCheckCache.result;
      }

      // If bypass is enabled (for development/testing)
      if (bypassCheck) {
        const mockData = {
          ip: "192.168.1.1",
          country: "Netherlands",
          country_code2: "NL",
          city: "Amsterdam",
          latitude: 52.3676,
          longitude: 4.9041,
        };
        locationCheckCache.result = mockData;
        locationCheckCache.timestamp = now;

        logVPNStatus("success", {
          ip: mockData.ip,
          country: mockData.country,
          city: mockData.city,
          mode: "Development Mode (VPN Check Bypassed)",
        });

        return mockData;
      }

      const response = await locationApi.get();
      const locationData = response.data;

      // Store successful result in cache
      locationCheckCache = {
        timestamp: now,
        result: locationData,
        error: null,
      };

      // Verify if the location is in the Netherlands
      if (locationData.country_code2 !== "NL") {
        logVPNStatus("error", {
          ip: locationData.ip,
          country: locationData.country_name,
          city: locationData.city,
          requiredCountry: "Netherlands (NL)",
          mode: "Production Mode",
        });

        const error = new Error(
          `To use live mode, please:\n` +
            `1. Install a VPN client if you haven't already\n` +
            `2. Connect to a Netherlands (NL) server\n` +
            `3. Try again\n\n` +
            `Current location: ${locationData.country_name}`
        );
        locationCheckCache.error = error;
        throw error;
      }

      logVPNStatus("success", {
        ip: locationData.ip,
        country: locationData.country_name,
        city: locationData.city,
        mode: "Production Mode",
      });

      return {
        ip: locationData.ip,
        country: locationData.country_name,
        city: locationData.city,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };
    } catch (error) {
      // Handle API-specific errors
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error(
          "%c⚠ IP Geolocation API Error",
          "background: #ff9800; color: white; padding: 2px 5px; border-radius: 2px;",
          errorMessage
        );
        throw new Error(
          `Unable to verify VPN connection. Please ensure:\n` +
            `1. You have an active internet connection\n` +
            `2. Your VPN client is properly configured\n` +
            `3. You're connected to a Netherlands server`
        );
      }

      // Re-throw the error if it's our custom error
      if (error.message.includes("To use live mode")) {
        throw error;
      }

      // Handle other errors
      console.error(
        "%c⚠ Location Verification Error",
        "background: #ff9800; color: white; padding: 2px 5px; border-radius: 2px;",
        error
      );
      throw new Error(
        "Unable to verify VPN connection. Please check your internet connection and VPN settings."
      );
    }
  },

  // Clear the location check cache
  clearCache: () => {
    locationCheckCache = {
      timestamp: null,
      result: null,
      error: null,
    };
    console.log(
      "%c♻ Location cache cleared",
      "background: #607D8B; color: white; padding: 2px 5px; border-radius: 2px;"
    );
  },
};
