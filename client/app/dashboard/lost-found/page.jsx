"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, MapPin } from "lucide-react";
import { getUserLostFound, deleteLostFound } from "../../../services/lostFoundService";
import { useAuth } from "../../../lib/auth/AuthContext";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const FALLBACK = "/home/lost-found.jpg";

const entryPhoto = (entry) => {
  const raw = entry?.images?.[0];
  if (!raw) return FALLBACK;
  if (typeof raw === "string") {
    if (/^https?:\/\//i.test(raw)) return raw;
    return `${API_BASE}/${raw.replace(/\\/g, "/").replace(/^\//, "")}`;
  }
  return raw?.url || raw?.src || FALLBACK;
};

function TypeLabel({ type, t }) {
  const isLost = type === "Lost";
  return (
    <span
      className={`text-[13px] font-semibold ${
        isLost ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
      }`}
    >
      {isLost
        ? t("dashboard:reportPet.lostPet", "Lost")
        : t("dashboard:reportPet.foundPet", "Found")}
    </span>
  );
}

export default function UserLostFoundPage() {
  const { t } = useLanguage();
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchEntries = async () => {
      try {
        const data = await getUserLostFound(getTokenRef.current);
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load your lost and found entries", error);
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEntries();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (
      !confirm(
        t("dashboard:lostFound.confirmDelete", "Are you sure you want to delete this report?")
      )
    ) {
      return;
    }
    try {
      await deleteLostFound(id, getTokenRef.current);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert(t("dashboard.lostFoundDashboard.deleteFailed", "Failed to delete report."));
    }
  };

  return (
    <div className="marketing-ui mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white md:text-[1.75rem]">
            {t("dashboard.lostFoundDashboard.title", "My Lost & Found Reports")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard.lostFoundDashboard.subtitle",
              "Manage your active lost or found pet reports."
            )}
          </p>
        </div>
        <Link
          href="/dashboard/lost-found/new"
          className="inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t("dashboard:lostFound.reportPet", "Report Pet")}
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <div className="mb-4 h-10 w-10 animate-spin border-2 border-[#E2E8F0] border-t-[#2563EB]" />
          <p className="text-sm font-medium text-[#64748B]">
            {t("dashboard:myPets.loading", "Loading...")}
          </p>
        </div>
      ) : entries.length === 0 ? (
        <div className="border border-dashed border-[#CBD5E1] bg-white px-6 py-20 text-center dark:border-dark-divider dark:bg-dark-card">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-[#2563EB]/15">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-white">
            {t("dashboard:lostFound.noReports", "No reports yet")}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard:lostFound.noReportsDesc",
              "You haven't reported any lost or found pets."
            )}
          </p>
          <Link
            href="/dashboard/lost-found/new"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-6 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {t("dashboard:lostFound.createReport", "Create Report")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry, index) => {
            const photo = entryPhoto(entry);
            const city =
              entry?.location?.city ||
              (typeof entry?.location === "string" ? entry.location : "") ||
              "";
            const dateLabel = entry?.dateLostOrFound
              ? new Date(entry.dateLostOrFound).toLocaleDateString()
              : "";

            return (
              <motion.article
                key={entry._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.25) }}
                className="group flex flex-col overflow-hidden border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card"
              >
                <div className="group/img relative aspect-[5/4] overflow-hidden bg-[#E2E8F0] dark:bg-dark-raised">
                  <Image
                    src={photo}
                    alt={entry.title || "Report"}
                    fill
                    className="object-cover transition duration-500 group-hover/img:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <TypeLabel type={entry.type} t={t} />
                    {entry.status ? (
                      <span className="text-xs font-medium text-[#94A3B8]">{entry.status}</span>
                    ) : null}
                  </div>

                  <h2 className="font-display text-[1.45rem] font-bold leading-snug text-[#0F172A] dark:text-white">
                    {entry.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-[#64748B] dark:text-gray-400">{dateLabel}</p>
                  {city ? (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-[#64748B] dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
                      <span className="truncate">{city}</span>
                    </p>
                  ) : null}

                  <div className="mt-5 flex items-center gap-2">
                    <Link
                      href="/website/lost-found"
                      className="inline-flex h-10 flex-1 items-center justify-center bg-[#2563EB] text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                    >
                      {t("dashboard:lostFound.viewPublic", "View Public")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry._id)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 border border-[#E2E8F0] px-3.5 text-sm font-medium text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-dark-divider dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{t("dashboard:myPets.delete", "Delete")}</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
