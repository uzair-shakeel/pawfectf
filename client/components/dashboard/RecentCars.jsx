"use client";

import Link from "next/link";
import { FaPaw } from "react-icons/fa";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { optimizeCloudinaryUrl } from "../../lib/imageUtils";

export default function RecentCars({ cars = [] }) {
  const { t } = useLanguage();
  const items = Array.isArray(cars) ? cars.slice(-5).reverse() : [];

  const getStatusClasses = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "rejected":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-[#F1F5F9] text-[#64748B] dark:bg-dark-raised dark:text-gray-300";
    }
  };

  return (
    <div className="flex h-full min-h-[280px] w-full min-w-0 flex-col border border-[#E2E8F0] bg-white p-5 dark:border-dark-divider dark:bg-dark-card">
      <h3 className="mb-4 font-display text-lg font-bold text-[#0F172A] dark:text-white">
        {t("dashboard.recentCars.recentlyAdded", "Recently Added")}
      </h3>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15">
            <FaPaw className="h-6 w-6" />
          </div>
          <p className="font-display text-base font-bold text-[#0F172A] dark:text-white">
            {t("dashboard.recentCars.noPetsAdded", "No pets added")}
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard.recentCars.noPetsDesc",
              "List your first pet to see it appear here."
            )}
          </p>
          <Link
            href="/dashboard/cars/add"
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 bg-[#2563EB] px-5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
          >
            <FaPaw className="h-3.5 w-3.5" />
            {t("dashboard.dashboardStats.listPet", "List a Pet")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-1 flex-col divide-y divide-[#E2E8F0] dark:divide-dark-divider">
          {items.map((car) => {
            let img = "/images/placeholder-car.jpg";
            if (car?.images?.[0]) img = car.images[0];
            img = optimizeCloudinaryUrl(img, 400);

            const title =
              car?.title ||
              car?.name ||
              `${car?.make || ""} ${car?.model || ""}`.trim() ||
              "Untitled";
            const status = car?.status || "Pending";
            return (
              <div
                key={car?._id || car?.id || title}
                className="flex items-center gap-3 py-3"
              >
                <img src={img} alt={title} className="h-12 w-12 object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[#0F172A] dark:text-white">
                    {title}
                  </div>
                  <div className="truncate text-sm text-[#64748B]">
                    {car?.breed ||
                      car?.species ||
                      [car?.year, car?.trim].filter(Boolean).join(" ")}
                  </div>
                </div>
                {String(status).toLowerCase() !== "pending" && (
                  <span
                    className={`px-2 py-1 text-xs font-semibold ${getStatusClasses(status)}`}
                  >
                    {status}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
