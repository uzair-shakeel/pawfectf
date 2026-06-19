import React from "react";
import { mockData } from "../config/mockData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Revenue = () => {
  const { revenueStats, months } = mockData;

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueStats.monthlyRevenue,
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const subscriptionChartData = {
    labels: revenueStats.revenueBySource.map((type) => type.source),
    datasets: [
      {
        data: revenueStats.revenueBySource.map((type) => type.amount),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue - Monthly Plan
          "rgba(147, 51, 234, 0.8)", // Purple - Quarterly Plan
          "rgba(16, 185, 129, 0.8)", // Green - Annual Plan
          "rgba(234, 179, 8, 0.8)", // Yellow - 14-Hour Plan
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(147, 51, 234)",
          "rgb(16, 185, 129)",
          "rgb(234, 179, 8)",
        ],
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
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.label}: ${formatCurrency(value)}`;
          },
        },
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
          callback: (value) => formatCurrency(value),
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

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
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
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(
              value
            )} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "65%",
    radius: "90%",
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-200">
        Revenue Analytics
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-yellow-400">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-yellow-500 mt-2">
            {formatCurrency(revenueStats.totalRevenue)}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Time</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-emerald-400">
            Monthly Average
          </h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">
            {formatCurrency(
              revenueStats.monthlyRevenue.reduce((a, b) => a + b, 0) / 12
            )}
          </p>
          <p className="text-sm text-slate-400 mt-1">Per Month</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-blue-400">Latest Month</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {formatCurrency(
              revenueStats.monthlyRevenue[
                revenueStats.monthlyRevenue.length - 1
              ]
            )}
          </p>
          <p className="text-sm text-slate-400 mt-1">Current Period</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Monthly Revenue Trend
          </h2>
          <Line options={chartOptions} data={lineChartData} />
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Revenue by Plan
          </h2>
          <div className="relative" style={{ height: "300px" }}>
            <Doughnut options={doughnutOptions} data={subscriptionChartData} />
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="rounded-lg overflow-hidden shadow-lg bg-slate-900 border border-slate-700">
        <h2 className="text-lg font-semibold p-6 text-slate-200 border-b border-slate-700">
          Monthly Revenue Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Growth
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
                    {formatCurrency(revenueStats.monthlyRevenue[index])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {index === 0 ? (
                      <span className="text-slate-400">-</span>
                    ) : (
                      <span
                        className={`${
                          ((revenueStats.monthlyRevenue[index] -
                            revenueStats.monthlyRevenue[index - 1]) /
                            revenueStats.monthlyRevenue[index - 1]) *
                            100 >
                          0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {(
                          ((revenueStats.monthlyRevenue[index] -
                            revenueStats.monthlyRevenue[index - 1]) /
                            revenueStats.monthlyRevenue[index - 1]) *
                          100
                        ).toFixed(1)}
                        %
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

export default Revenue;
