"use client";

import { useState, useEffect, useMemo } from "react";
import { FaPaw, FaComments, FaChartPie } from "react-icons/fa";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
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
  Filler,
  Title,
  Tooltip,
  Legend
);

function ChartEmpty({ icon: Icon, title, subtitle }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-bold text-[#0F172A] dark:text-white">{title}</p>
      {subtitle && (
        <p className="mt-1 max-w-[220px] text-xs text-[#64748B] dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ChartShell({ title, children, empty, className = "" }) {
  return (
    <div
      className={`relative flex min-h-[280px] min-w-0 flex-col overflow-hidden border border-[#E2E8F0] bg-white p-5 dark:border-dark-divider dark:bg-dark-card ${className}`}
    >
      <div className="mb-3 shrink-0">
        <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-white">
          {title}
        </h3>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
      {empty}
    </div>
  );
}

export default function DashboardCharts({
  recentCars = [],
  chatsCountByDay = [],
}) {
  const { t } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const fmt = (d) => {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d || "");
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  const hasPets = (recentCars || []).length > 0;
  const statusCounts = useMemo(() => {
    const counts = { Approved: 0, Rejected: 0, Pending: 0 };
    (recentCars || []).forEach((c) => {
      const s = (c?.status || "").toLowerCase();
      if (s === "approved") counts.Approved += 1;
      else if (s === "rejected") counts.Rejected += 1;
      else counts.Pending += 1;
    });
    return counts;
  }, [recentCars]);

  const hasStatusData =
    statusCounts.Approved + statusCounts.Rejected + statusCounts.Pending > 0;

  const hasMessages = (chatsCountByDay || []).some((d) => (d.count || 0) > 0);

  const lineData = useMemo(() => {
    const items = (recentCars || []).slice(-7);
    const labels = items.length
      ? items.map((c) => fmt(c.createdAt || c.updatedAt))
      : ["—"];
    const data = items.length ? items.map(() => 1) : [0];
    return {
      labels,
      datasets: [
        {
          label: t("dashboard.dashboardCharts.listedPets", "Listed Pets"),
          data,
          borderColor: "#2563eb",
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 260);
            gradient.addColorStop(0, "rgba(37, 99, 235, 0.35)");
            gradient.addColorStop(1, "rgba(37, 99, 235, 0.02)");
            return gradient;
          },
          pointBackgroundColor: "#2563eb",
          pointBorderColor: isDarkMode ? "#1a1a1a" : "#fff",
          pointBorderWidth: 2,
          pointRadius: items.length ? 4 : 0,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
        },
      ],
    };
  }, [recentCars, isDarkMode, t]);

  const doughnutData = useMemo(() => {
    const entries = [
      {
        key: "Approved",
        label: t("dashboard.dashboardCharts.approved", "Approved"),
        value: statusCounts.Approved,
        bg: "rgba(16, 185, 129, 0.9)",
        border: "#10b981",
      },
      {
        key: "Pending",
        label: t("dashboard.dashboardCharts.pending", "Pending"),
        value: statusCounts.Pending,
        bg: "rgba(245, 158, 11, 0.9)",
        border: "#f59e0b",
      },
      {
        key: "Rejected",
        label: t("dashboard.dashboardCharts.rejected", "Rejected"),
        value: statusCounts.Rejected,
        bg: "rgba(244, 63, 94, 0.9)",
        border: "#f43f5e",
      },
    ].filter((e) => e.value > 0);

    if (entries.length === 0) {
      return {
        labels: [t("dashboard.dashboardCharts.noData", "No data")],
        datasets: [
          {
            data: [1],
            backgroundColor: [isDarkMode ? "#303030" : "#E2E8F0"],
            borderColor: [isDarkMode ? "#404040" : "#CBD5E1"],
            borderWidth: 0,
          },
        ],
      };
    }

    return {
      labels: entries.map((e) => e.label),
      datasets: [
        {
          data: entries.map((e) => e.value),
          backgroundColor: entries.map((e) => e.bg),
          borderColor: entries.map((e) => e.border),
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [statusCounts, isDarkMode, t]);

  const barData = useMemo(() => {
    const days = Array.isArray(chatsCountByDay) ? chatsCountByDay : [];
    const labels = days.length
      ? days.map((d) => fmt(d.label || d.date || d))
      : ["—"];
    const data = days.length ? days.map((d) => d.count || 0) : [0];
    return {
      labels,
      datasets: [
        {
          label: t("dashboard.dashboardCharts.newMessages", "New Messages"),
          data,
          backgroundColor: "#2563EB",
          hoverBackgroundColor: "#1D4ED8",
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 36,
        },
      ],
    };
  }, [chatsCountByDay, t]);

  const gridColor = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";
  const tickColor = isDarkMode ? "#94a3b8" : "#64748b";
  const legendColor = isDarkMode ? "#e2e8f0" : "#0f172a";

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 14,
          color: legendColor,
          font: { size: 11, weight: "500" },
        },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? "#1f1f1f" : "#0F172A",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, maxRotation: 0, autoSkip: true, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 4,
        grid: { color: gridColor, drawBorder: false },
        ticks: {
          color: tickColor,
          precision: 0,
          stepSize: 1,
          font: { size: 11 },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-3 lg:gap-5">
      <ChartShell
        className="lg:col-span-2"
        title={t("dashboard.dashboardCharts.listedPets", "Listed Pets")}
        empty={
          !hasPets ? (
            <ChartEmpty
              icon={FaPaw}
              title={t("dashboard.recentCars.noPetsAdded", "No pets added")}
              subtitle={t(
                "dashboard.dashboardCharts.listedPetsEmpty",
                "List pets to see activity over time."
              )}
            />
          ) : null
        }
      >
        <div className={`h-full w-full ${!hasPets ? "opacity-20" : ""}`}>
          <Line data={lineData} options={commonOptions} />
        </div>
      </ChartShell>

      <ChartShell
        title={t("dashboard.dashboardCharts.statusMix", "Status mix")}
        empty={
          !hasStatusData ? (
            <ChartEmpty
              icon={FaChartPie}
              title={t("dashboard.dashboardCharts.noStatus", "No status data")}
              subtitle={t(
                "dashboard.dashboardCharts.statusEmpty",
                "Approval stats will show here."
              )}
            />
          ) : null
        }
      >
        <div className={`mx-auto h-full w-full max-w-[220px] ${!hasStatusData ? "opacity-20" : ""}`}>
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: "68%",
              plugins: {
                legend: {
                  display: hasStatusData,
                  position: "bottom",
                  labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    padding: 12,
                    color: legendColor,
                    font: { size: 11, weight: "500" },
                  },
                },
                tooltip: { enabled: hasStatusData },
              },
            }}
          />
        </div>
      </ChartShell>

      <ChartShell
        className="lg:col-span-3"
        title={t(
          "dashboard.dashboardCharts.messagesLast7Days",
          "Messages Last 7 Days"
        )}
        empty={
          !hasMessages ? (
            <ChartEmpty
              icon={FaComments}
              title={t("dashboard.dashboardCharts.noMessages", "No messages yet")}
              subtitle={t(
                "dashboard.dashboardCharts.messagesEmpty",
                "New conversations will appear in this chart."
              )}
            />
          ) : null
        }
      >
        <div className={`h-full w-full ${!hasMessages ? "opacity-20" : ""}`}>
          <Bar
            data={barData}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                legend: {
                  ...commonOptions.plugins.legend,
                  display: hasMessages,
                },
              },
            }}
          />
        </div>
      </ChartShell>
    </div>
  );
}
