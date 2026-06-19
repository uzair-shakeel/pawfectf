import React from "react";
import { Line, Bar, Pie } from "react-chartjs-2";

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(148, 163, 184, 0.1)",
      },
      ticks: {
        color: "#94A3B8",
      },
    },
    x: {
      grid: {
        color: "rgba(148, 163, 184, 0.1)",
      },
      ticks: {
        color: "#94A3B8",
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: "#94A3B8",
        padding: 20,
        font: {
          size: 12,
          weight: "500",
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      titleColor: "#E2E8F0",
      bodyColor: "#E2E8F0",
      padding: 12,
      boxPadding: 8,
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: {
        color: "#94A3B8",
        padding: 20,
        font: {
          size: 12,
          weight: "500",
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      titleColor: "#E2E8F0",
      bodyColor: "#E2E8F0",
      padding: 12,
      boxPadding: 8,
    },
  },
};

const DashboardCharts = ({ chartData }) => {
  return (
    <>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ship Types Distribution */}
        <div className="bg-slate-900 overflow-hidden shadow-lg rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">
            Fleet Distribution
          </h3>
          <div className="h-[300px]">
            <Pie data={chartData.shipTypes} options={pieOptions} />
          </div>
        </div>

        {/* Monthly Cargo Volume */}
        <div className="bg-slate-900 overflow-hidden shadow-lg rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">
            Monthly Cargo Volume
          </h3>
          <div className="h-[300px]">
            <Bar data={chartData.monthlyCargoVolume} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Fuel Efficiency Trend */}
      <div className="bg-slate-900 overflow-hidden shadow-lg rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">
          Fleet Fuel Efficiency Trend
        </h3>
        <div className="h-[300px]">
          <Line data={chartData.fuelEfficiency} options={chartOptions} />
        </div>
      </div>
    </>
  );
};

export default DashboardCharts;
