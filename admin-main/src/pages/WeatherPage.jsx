import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Cloud, Wind, Thermometer, Droplets } from "lucide-react";
import StatCard from "../components/shared/StatCard";
import axios from "axios";

// Create a dedicated axios instance for weather API
const weatherApi = axios.create({
  baseURL: "https://api.open-meteo.com/v1",
  withCredentials: false, // Explicitly disable credentials
  headers: {
    "Content-Type": "application/json",
  },
});

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Weather codes mapping (WMO codes)
const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

// Mock ships data - replace with your actual ships data
const MOCK_SHIPS = [
  {
    id: 1,
    name: "Vlad Container",
    position: {
      latitude: 52.3708,
      longitude: 4.8958,
    },
  },
  {
    id: 2,
    name: "Paulo Tanker",
    position: {
      latitude: 34.0528,
      longitude: -118.2442,
    },
  },
  {
    id: 3,
    name: "Evy Yacht",
    position: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
  },
];

const WeatherPage = () => {
  const [selectedShip, setSelectedShip] = useState(MOCK_SHIPS[0]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to format timestamp to hour
  const formatHour = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      hour12: false,
    });
  };

  // Fetch weather data when selected ship changes
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the dedicated weather API instance
        const response = await weatherApi.get(
          `/forecast?latitude=${selectedShip.position.latitude}&longitude=${selectedShip.position.longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&timezone=auto`
        );

        if (!response.data) {
          throw new Error("Invalid response from Open-Meteo API");
        }

        setCurrentWeather(response.data.current_weather);

        // Process forecast data
        const processedForecast = {
          temperature: {
            labels: [],
            datasets: [
              {
                label: "Temperature (°C)",
                data: [],
                borderColor: "#6366f1",
                tension: 0.4,
              },
            ],
          },
          wind: {
            labels: [],
            datasets: [
              {
                label: "Wind Speed (km/h)",
                data: [],
                borderColor: "#8B5CF6",
                tension: 0.4,
              },
            ],
          },
          humidity: {
            labels: [],
            datasets: [
              {
                label: "Humidity (%)",
                data: [],
                borderColor: "#EC4899",
                tension: 0.4,
              },
            ],
          },
        };

        // Get next 24 hours of data
        const currentHour = new Date().getHours();
        const hourlyData = response.data.hourly;

        for (let i = currentHour; i < currentHour + 24; i++) {
          const hour = formatHour(new Date(hourlyData.time[i]));
          processedForecast.temperature.labels.push(hour);
          processedForecast.wind.labels.push(hour);
          processedForecast.humidity.labels.push(hour);

          processedForecast.temperature.datasets[0].data.push(
            hourlyData.temperature_2m[i]
          );
          processedForecast.wind.datasets[0].data.push(
            hourlyData.windspeed_10m[i]
          );
          processedForecast.humidity.datasets[0].data.push(
            hourlyData.relativehumidity_2m[i]
          );
        }

        setForecastData(processedForecast);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError("Failed to fetch weather data");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedShip]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading weather data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Weather Conditions</h1>
          <select
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            value={selectedShip.id}
            onChange={(e) =>
              setSelectedShip(
                MOCK_SHIPS.find((s) => s.id === Number(e.target.value))
              )
            }
          >
            {MOCK_SHIPS.map((ship) => (
              <option key={ship.id} value={ship.id}>
                {ship.name}
              </option>
            ))}
          </select>
        </div>

        {/* Current Weather Overview */}
        {currentWeather && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              name="Temperature"
              icon={Thermometer}
              value={`${currentWeather.temperature}°C`}
              color="#6366f1"
            />
            <StatCard
              name="Wind Speed"
              icon={Wind}
              value={`${currentWeather.windspeed} km/h`}
              color="#8B5CF6"
            />
            <StatCard
              name="Conditions"
              icon={Cloud}
              value={weatherCodes[currentWeather.weathercode]}
              color="#EC4899"
            />
            <StatCard
              name="Wind Direction"
              icon={Wind}
              value={`${currentWeather.winddirection}°`}
              color="#10B981"
            />
          </div>
        )}

        {/* Weather Graphs */}
        {forecastData && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Temperature Trend</h3>
              <div className="h-[300px]">
                <Line data={forecastData.temperature} options={chartOptions} />
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Wind Speed Trend</h3>
              <div className="h-[300px]">
                <Line data={forecastData.wind} options={chartOptions} />
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Humidity Trend</h3>
              <div className="h-[300px]">
                <Line data={forecastData.humidity} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherPage;
