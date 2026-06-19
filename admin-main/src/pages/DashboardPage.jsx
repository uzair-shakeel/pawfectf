import React, { useState, useEffect, useRef } from "react";
import { shipService } from "../services/shipService";
import { useMockMode } from "../context/MockModeContext";
import MockModeToggle from "../components/shared/MockModeToggle";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardMap from "../components/dashboard/DashboardMap";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import ShipOverview from "../components/dashboard/ShipOverview";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DashboardPage = () => {
  const { isMockMode } = useMockMode();
  const [ships, setShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(1741281633 * 1000)); // Convert seconds to milliseconds
  const [endDate, setEndDate] = useState(new Date(1741317363 * 1000)); // Convert seconds to milliseconds
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the timestamp range for API requests
        const endTimestamp = Math.floor(endDate.getTime() / 1000);
        const startTimestamp = Math.floor(startDate.getTime() / 1000);

        console.log(
          `Fetching dashboard data from ${startDate.toLocaleString()} to ${endDate.toLocaleString()}`
        );

        // Get ships data from API with the selected date range
        const shipsData = await shipService.getAllShips(isMockMode);

        // Check if we have any valid ships data
        if (!isMockMode && (!shipsData || shipsData.length === 0)) {
          // Show a warning but don't break the application
          setError(
            "No live ship data available for the selected date range. Please check your connection, try a different date range, or switch to Mock Mode."
          );
          // Keep any existing data
          if (ships.length > 0) {
            return;
          }
          // If no existing data, throw error to show the error UI
          throw new Error(
            "No live ship data available. Please check your connection or switch to Mock Mode."
          );
        }

        // Set initial selected ship
        if (shipsData.length > 0 && !selectedShip) {
          setSelectedShip(shipsData[0]);
        }

        // Calculate dashboard stats from actual data
        const stats = {
          activeShips: shipsData.length.toString(),
          totalCargo: isMockMode
            ? "45,678 tons"
            : calculateTotalCargo(shipsData),
          fuelConsumption: isMockMode
            ? "1,234 tons"
            : calculateFuelConsumption(shipsData),
          avgSpeed: `${(
            shipsData.reduce(
              (acc, ship) => acc + (ship.statistics?.wind_speed?.avg || 0),
              0
            ) / shipsData.length
          ).toFixed(1)} knots`,
        };

        // Create chart data based on actual ship data in live mode
        const charts = isMockMode
          ? {
              shipTypes: {
                labels: [
                  "Cargo Ships",
                  "Tankers",
                  "Container Ships",
                  "Bulk Carriers",
                ],
                datasets: [
                  {
                    data: [35, 25, 20, 20],
                    backgroundColor: [
                      "rgba(99, 102, 241, 0.8)",
                      "rgba(139, 92, 246, 0.8)",
                      "rgba(236, 72, 153, 0.8)",
                      "rgba(16, 185, 129, 0.8)",
                    ],
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                ],
              },
              monthlyCargoVolume: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                  {
                    label: "Cargo Volume (tons)",
                    data: [45000, 52000, 49000, 47000, 53000, 51000],
                    backgroundColor: "rgba(99, 102, 241, 0.8)",
                    borderColor: "rgba(99, 102, 241, 1)",
                    borderWidth: 2,
                  },
                ],
              },
              fuelEfficiency: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                  {
                    label: "Fuel Efficiency (nm/ton)",
                    data: [12.5, 12.8, 12.3, 12.9, 12.6, 12.7],
                    borderColor: "rgba(236, 72, 153, 1)",
                    backgroundColor: "rgba(236, 72, 153, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              },
            }
          : generateChartsFromApiData(shipsData);

        setShips(shipsData);
        setDashboardStats(stats);
        setChartData(charts);
      } catch (err) {
        console.error("Dashboard data error:", err);

        // Show error but don't clear existing data if we have any
        setError(
          !isMockMode
            ? `Failed to fetch live data: ${err.message}. Showing existing data if available.`
            : "Failed to load dashboard data"
        );

        // Only clear data when there's an error in live mode and we have no existing data
        if (!isMockMode && ships.length === 0) {
          setShips([]);
          setDashboardStats(null);
          setChartData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if we have valid dates
    if (startDate && endDate) {
      fetchDashboardData();
    }
  }, [isMockMode, startDate, endDate]);

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start || new Date(1741281633 * 1000)); // Use specific timestamp if null
    setEndDate(end || new Date(1741317363 * 1000)); // Use specific timestamp if null
  };

  // Helper function to calculate total cargo from ship data
  const calculateTotalCargo = (ships) => {
    // In a real implementation, this would calculate based on actual cargo data
    // For now, we'll return a placeholder since we don't have real cargo data
    return "Based on API data";
  };

  // Helper function to calculate fuel consumption from ship data
  const calculateFuelConsumption = (ships) => {
    // In a real implementation, this would calculate based on actual fuel data
    // For now, we'll return a placeholder since we don't have real fuel data
    return "Based on API data";
  };

  // Helper function to generate chart data from API data
  const generateChartsFromApiData = (ships) => {
    // Count ship types
    const shipTypes = ships.reduce((acc, ship) => {
      acc[ship.type] = (acc[ship.type] || 0) + 1;
      return acc;
    }, {});

    // Extract wind speed data for charts
    const windSpeedData = ships.flatMap(
      (ship) =>
        ship.timeSeriesData?.map((point) => ({
          timestamp: new Date(point.timestamp),
          windSpeed: point.wind_speed,
        })) || []
    );

    // Sort by timestamp
    windSpeedData.sort((a, b) => a.timestamp - b.timestamp);

    // Group by month for monthly data
    const monthlyData = windSpeedData.reduce((acc, data) => {
      const month = data.timestamp.toLocaleString("default", {
        month: "short",
      });
      if (!acc[month]) {
        acc[month] = { count: 0, total: 0 };
      }
      acc[month].count += 1;
      acc[month].total += data.windSpeed;
      return acc;
    }, {});

    // Calculate monthly averages
    const months = Object.keys(monthlyData);
    const monthlyAverages = months.map(
      (month) => monthlyData[month].total / monthlyData[month].count
    );

    return {
      shipTypes: {
        labels: Object.keys(shipTypes),
        datasets: [
          {
            data: Object.values(shipTypes),
            backgroundColor: [
              "rgba(99, 102, 241, 0.8)",
              "rgba(139, 92, 246, 0.8)",
              "rgba(236, 72, 153, 0.8)",
              "rgba(16, 185, 129, 0.8)",
            ],
            borderColor: "rgba(255, 255, 255, 0.1)",
          },
        ],
      },
      monthlyCargoVolume: {
        labels: months,
        datasets: [
          {
            label: "Wind Speed (knots)",
            data: monthlyAverages,
            backgroundColor: "rgba(99, 102, 241, 0.8)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 2,
          },
        ],
      },
      fuelEfficiency: {
        labels: months,
        datasets: [
          {
            label: "Wind Speed Trend",
            data: monthlyAverages,
            borderColor: "rgba(236, 72, 153, 1)",
            backgroundColor: "rgba(236, 72, 153, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
    };
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading dashboard data...</div>
        </div>
        <MockModeToggle />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md mb-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            {!isMockMode && (
              <div className="mt-4">
                <p className="font-semibold">Suggestions:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Check your API connection</li>
                  <li>Verify the API endpoint is correct</li>
                  <li>Ensure you have the correct IMO numbers configured</li>
                  <li>Try switching to Mock Mode to see sample data</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <MockModeToggle />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Ships Dashboard</h1>
          <div className="flex flex-col md:flex-row items-center gap-2 mt-4 md:mt-0">
            <span className="text-sm text-white">Date Range:</span>
            <DatePicker
              selected={startDate}
              onChange={handleDateRangeChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              className="bg-gray-700 text-white text-sm rounded-md px-2 py-1"
              placeholderText="Select date range"
              dateFormat="MMM d, yyyy"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats stats={dashboardStats} />

        {/* World Map */}
        <DashboardMap
          ships={ships}
          selectedShip={selectedShip}
          onShipSelect={setSelectedShip}
          mapRef={mapRef}
          startDate={startDate}
          endDate={endDate}
        />

        {/* Charts */}
        <DashboardCharts chartData={chartData} />

        {/* Ships Overview */}
        <ShipOverview ships={ships} />
      </div>
      <MockModeToggle />
    </div>
  );
};

export default DashboardPage;
