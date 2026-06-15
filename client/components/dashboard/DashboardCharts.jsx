import { useState, useEffect, useMemo } from "react";
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

export default function DashboardCharts({
  recentCars = [],
  chatsCountByDay = [],
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const fmt = (d) => {
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  const carLabels = useMemo(() => {
    const items = recentCars.slice(-7);
    return items.map((c) => fmt(c.createdAt || c.updatedAt));
  }, [recentCars]);

  const carCounts = useMemo(() => {
    const items = recentCars.slice(-7);
    return items.map(() => 1);
  }, [recentCars]);

  const lineData = useMemo(() => {
    return {
      labels: carLabels,
      datasets: [
        {
          label: "Odrzucone",
          data: carCounts,
          borderColor: "#2563eb",
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(37, 99, 235, 0.35)");
            gradient.addColorStop(1, "rgba(37, 99, 235, 0.02)");
            return gradient;
          },
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#fff",
          pointRadius: 3,
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }, [carLabels, carCounts]);

  const barLabels = useMemo(
    () => chatsCountByDay.map((d) => fmt(d.label || d.date || d)),
    [chatsCountByDay]
  );
  const barCounts = useMemo(
    () => chatsCountByDay.map((d) => d.count),
    [chatsCountByDay]
  );

  const barData = useMemo(
    () => ({
      labels: barLabels,
      datasets: [
        {
          label: "Nowe Wiadomości",
          data: barCounts,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)");
            gradient.addColorStop(1, "rgba(16, 185, 129, 0.2)");
            return gradient;
          },
          borderColor: "#10b981",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 26,
        },
      ],
    }),
    [barLabels, barCounts]
  );

  const statusCounts = useMemo(() => {
    // Only count non-pending statuses for the dashboard mix
    const counts = { Approved: 0, Rejected: 0 };
    (recentCars || []).forEach((c) => {
      const s = (c?.status || "").toLowerCase();
      if (s === "approved") counts.Approved += 1;
      else if (s === "rejected") counts.Rejected += 1;
      // ignore pending and unknown
    });
    return counts;
  }, [recentCars]);

  const doughnutData = useMemo(() => {
    const labels = Object.keys(statusCounts);
    const values = labels.map((k) => statusCounts[k]);
    const palette = {
      Approved: { bg: "rgba(16, 185, 129, 0.9)", border: "#10b981" },
      Rejected: { bg: "rgba(244, 63, 94, 0.9)", border: "#f43f5e" },
    };
    const pl = { Approved: "Zatwierdzone", Rejected: "Odrzucone" };
    return {
      labels: labels.map((k) => pl[k] || k),
      datasets: [
        {
          label: "Status",
          data: values,
          backgroundColor: labels.map((l) => palette[l]?.bg || "#ddd"),
          borderColor: labels.map((l) => palette[l]?.border || "#ccc"),
          borderWidth: 1,
        },
      ],
    };
  }, [statusCounts]);

  const axisOptions = {
    x: {
      grid: { color: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" },
      ticks: { color: isDarkMode ? "#94a3b8" : "#64748b", maxRotation: 0, autoSkip: true },
      border: { display: false },
    },
    y: {
      grid: { color: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" },
      ticks: { color: isDarkMode ? "#94a3b8" : "#64748b", precision: 0 },
      border: { display: false },
    },
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 8,
          usePointStyle: false,
          color: isDarkMode ? "#f8fafc" : "#1e293b",
          font: { size: 11 },
        },
      },
      title: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    interaction: { mode: "nearest", intersect: false },
    maintainAspectRatio: false,
    scales: axisOptions,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="p-4 pb-8 bg-white dark:bg-dark-panel  shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 h-80 lg:col-span-2 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:text-white transition-colors duration-300">
            Wystawione Auta
          </h3>
        </div>
        <Line data={lineData} options={commonOptions} />
      </div>
      <div className="p-4 pb-8 bg-white dark:bg-dark-panel shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 h-80 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:text-white transition-colors duration-300">
            Zatwierdzone
          </h3>
        </div>
        <Doughnut
          data={doughnutData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } },
            cutout: "65%",
          }}
        />
      </div>
      <div className="p-4 pb-8 bg-white dark:bg-dark-panel shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 h-80 lg:col-span-3 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:text-white transition-colors duration-300">
            Wiadomości Ostatnie 7 dni

          </h3>
        </div>
        <Bar data={barData} options={commonOptions} />
      </div>
    </div>
  );
}
