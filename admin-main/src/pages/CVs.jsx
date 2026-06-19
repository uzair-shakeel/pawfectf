import React from "react";
import { mockData } from "../config/mockData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CVs = () => {
  const { cvStats, months } = mockData;

  // Calculate month-over-month growth rates
  const growthRates = cvStats.createdPerMonth.map((current, index) => {
    if (index === 0) return 0;
    const previous = cvStats.createdPerMonth[index - 1];
    return ((current - previous) / previous) * 100;
  });

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Created CVs",
        data: cvStats.createdPerMonth,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
      {
        label: "Downloaded CVs",
        data: cvStats.downloadedPerMonth,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
      },
    ],
  };

  const barChartData = {
    labels: cvStats.popularTemplates.map((template) => template.name),
    datasets: [
      {
        label: "Template Usage",
        data: cvStats.popularTemplates.map((template) => template.usage),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(16, 185, 129, 0.8)", // Green
          "rgba(236, 72, 153, 0.8)", // Pink
          "rgba(234, 179, 8, 0.8)", // Yellow
          "rgba(147, 51, 234, 0.8)", // Purple
          "rgba(239, 68, 68, 0.8)", // Red
          "rgba(75, 85, 99, 0.8)", // Gray
          "rgba(14, 165, 233, 0.8)", // Sky
          "rgba(168, 85, 247, 0.8)", // Purple-light
        ],
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94A3B8",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      title: {
        display: true,
        color: "#94A3B8",
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#E2E8F0",
        bodyColor: "#E2E8F0",
        padding: 12,
        boxPadding: 8,
      },
    },
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
  };

  return (
    <div className="p-6 bg-slate-950">
      <h1 className="text-2xl font-bold mb-6 text-slate-200">CV Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-blue-400">Total Created</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {cvStats.createdPerMonth
              .reduce((a, b) => a + b, 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Time</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-emerald-400">
            Total Downloads
          </h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">
            {cvStats.downloadedPerMonth
              .reduce((a, b) => a + b, 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Time</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-purple-400">
            Most Popular Template
          </h3>
          <p className="text-3xl font-bold text-purple-500 mt-2">
            {cvStats.popularTemplates[0].name}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {cvStats.popularTemplates[0].usage.toLocaleString()} Uses
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg p-6 shadow-lg border border-slate-700 bg-slate-900">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Monthly Creation & Download Trends
          </h2>
          <Line options={chartOptions} data={lineChartData} />
        </div>
        <div className="rounded-lg p-6 shadow-lg border border-slate-700 bg-slate-900">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Template Usage Distribution
          </h2>
          <Bar options={chartOptions} data={barChartData} />
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="mt-8 rounded-lg overflow-hidden shadow-lg bg-slate-900 border border-slate-700">
        <h2 className="text-lg font-semibold p-6 text-slate-200 border-b border-slate-700">
          Monthly Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Downloaded
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Growth Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {months.map((month, index) => (
                <tr
                  key={month}
                  className="bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {cvStats.createdPerMonth[index].toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {cvStats.downloadedPerMonth[index].toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {index === 0 ? (
                      <span className="text-slate-400">-</span>
                    ) : (
                      <span
                        className={`${
                          growthRates[index] > 0
                            ? "text-emerald-400"
                            : growthRates[index] < 0
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        {growthRates[index] > 0 ? "+" : ""}
                        {growthRates[index].toFixed(1)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CVs;
