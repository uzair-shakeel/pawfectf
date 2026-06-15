import { NextResponse } from "next/server";
import axios from "axios";

const API_URL = "https://api.carsxe.com/v1/international-vin-decoder";
const API_KEY = process.env.CARSXE_API_KEY;

// Helper function to map transmission types
const mapTransmission = (value) => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("manual") || lower.includes("standard")) return "Manual";
  if (lower.includes("automatic") || lower.includes("auto") || lower.includes("cvt") || lower.includes("dual-clutch")) return "Automatic";
  if (lower.includes("semi")) return "Semi-Automatic";
  return "";
};

// Helper function to map fuel types
const mapFuelType = (value) => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("gasoline") || lower.includes("petrol") || lower.includes("benzin")) return "Petrol";
  if (lower.includes("diesel")) return "Diesel";
  if (lower.includes("hybrid")) return "Hybrid";
  if (lower.includes("electric") || lower.includes("ev")) return "Electric";
  if (lower.includes("lpg")) return "LPG";
  if (lower.includes("hydrogen") || lower.includes("wodór")) return "Wodór";
  return "";
};

// Helper function to map drive types
const mapDriveType = (value) => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("front-wheel") || lower === "fwd") return "FWD";
  if (lower.includes("rear-wheel") || lower === "rwd") return "RWD";
  if (lower.includes("all-wheel") || lower.includes("all wheel") || lower.includes("awd") || lower.includes("4x4") || lower.includes("4wd") || lower.includes("quattro")) return "4WD";
  if (lower.includes("2wd")) return "2WD";
  return "";
};

// Helper function to map body type to UI values
const mapBodyType = (value) => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("wagon") || lower.includes("estate") || lower.includes("variant") || lower.includes("touring") || lower.includes("kombi")) return "Kombi";
  if (lower.includes("sedan") || lower.includes("saloon") || lower.includes("berline")) return "Sedan";
  if (lower.includes("hatchback") || lower.includes("liftback") || lower.includes("sportback")) return "Hatchback";
  if (lower.includes("coupe") || lower.includes("coupé")) return "Coupe";
  if (lower.includes("suv") || lower.includes("4x4") || lower.includes("off-road")) return "SUV";
  if (lower.includes("convertible") || lower.includes("cabrio") || lower.includes("spyder")) return "Convertible";
  if (lower.includes("van") || lower.includes("bus") || lower.includes("minivan") || lower.includes("mpv")) return "Bus";
  if (lower.includes("pickup") || lower.includes("truck")) return "Pickup";
  if (lower.includes("crossover")) return "Crossover";
  if (lower.includes("limousine") || lower.includes("limuzyna")) return "Limousine";
  // Default to capitalized first letter if no match
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get("vin");

    if (!vin || vin.length !== 17) {
      return NextResponse.json(
        { error: "Invalid VIN. Must be 17 characters." },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      console.error("Missing CarsXE API key");
      return NextResponse.json(
        { error: "API configuration error. Please ensure CARSXE_API_KEY is set." },
        { status: 500 }
      );
    }

    console.log(`Looking up VIN with CarsXE: ${vin}`);

    const response = await axios.get(API_URL, {
      params: {
        key: API_KEY,
        vin: vin,
      },
    });

    if (response.data && response.data.success) {
      const attributes = response.data.attributes;

      const carDetails = {
        make: attributes.make || "",
        model: attributes.model || "",
        year: attributes.year?.toString() || "",
        engine: (attributes.engine_size || attributes.engine_displacement_cc || attributes.engine_cc || attributes.displacement)?.toString() || "",
        fuel: mapFuelType(attributes.fuel_type || attributes.fuel || ""),
        transmission: mapTransmission(attributes.transmission || attributes.transmission_type || ""),
        driveType: mapDriveType(attributes.drive_type || attributes.drivetrain || ""),
        bodyClass: mapBodyType(attributes.body || attributes.body_style || ""),
        vin: attributes.vin || vin,
        manufacturer: attributes.manufacturer || "",
        trim: attributes.series || "",
        horsepower: (attributes.horsepower || attributes.engine_power_hp || attributes.power_hp || attributes.max_power_hp)?.toString() || "",
        engineDetails: [
          attributes.engine_manufacturer || attributes.engine_make,
          attributes.engine_code,
          attributes.engine_cylinders ? `${attributes.engine_cylinders} Cylinders` : null
        ].filter(Boolean).join(" "),
        color: attributes.color || "",
        mileage: "",
        country: attributes.plant_country || "",
        accidentHistory: "",
        serviceHistory: "",
        type: mapBodyType(attributes.body || attributes.body_style || ""),
        // Additional technical details
        engineCode: attributes.engine_code || "",
        engineCylinders: attributes.engine_cylinders?.toString() || "",
        enginePosition: attributes.engine_position || "",
        engineTorque: attributes.engine_torque?.toString() || "",
        fuelCapacity: (attributes.fuel_capacity_liters || attributes.fuel_tank_capacity_liters)?.toString() || "",
        fuelConsumption: attributes.fuel_consumption_combined_l100km?.toString() || "",
        transmission_gears: attributes.gears?.toString() || "",
        weight: (attributes.weight_empty_kg || attributes.curb_weight_kg)?.toString() || "",
        maxSpeed: attributes.max_speed_kmh?.toString() || "",
        acceleration: attributes.acceleration_0_100_kmh_s?.toString() || "",
        // Dimensions and other attributes
        length: attributes.length_mm?.toString() || "",
        width: attributes.width_mm?.toString() || "",
        height: attributes.height_mm?.toString() || "",
        wheelbase: attributes.wheelbase_mm?.toString() || "",
        emissions: attributes.avg_co2_emission_g_km?.toString() || "",
        emissionStandard: attributes.emission_standard || "",
      };

      return NextResponse.json(carDetails, { status: 200 });
    }

    return NextResponse.json(
      {
        error: "Vehicle data not found or invalid VIN",
        details: response.data?.message || "Success was false"
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in VIN lookup route:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch vehicle data from CarsXE", details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
