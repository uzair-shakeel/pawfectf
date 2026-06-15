'use client'
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

// === Section colour/emoji config matching the wizard preview ===
const SECTION_CONFIG = {
  "Highlights": { emoji: "⭐", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/10", border: "border-blue-100 dark:border-blue-900/30" },
  "Seller Notes": { emoji: "💬", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/10", border: "border-violet-100 dark:border-violet-900/30" },
  "Equipment": { emoji: "🔧", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/10", border: "border-emerald-100 dark:border-emerald-900/30" },
  "Known Flaws": { emoji: "⚠️", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10", border: "border-amber-100 dark:border-amber-900/30" },
  "Ownership History": { emoji: "📋", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-900/10", border: "border-cyan-100 dark:border-cyan-900/30" },
  "Condition": { emoji: "🔍", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/10", border: "border-indigo-100 dark:border-indigo-900/30" },
  "Financial": { emoji: "💰", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10", border: "border-green-100 dark:border-green-900/30" },
};

function AISectionCard({ section, index }) {
  const [expanded, setExpanded] = useState(index === 0); // Highlights open by default
  const cfg = SECTION_CONFIG[section.heading] || {
    emoji: "📝",
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-800/40",
    border: "border-gray-100 dark:border-gray-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`rounded-2xl border overflow-hidden ${cfg.border}`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${cfg.bg}`}>
            {cfg.emoji}
          </div>
          <span className={`font-bold text-base ${cfg.color}`}>{section.heading}</span>
          {section.source_tags?.includes("seller") && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
              Sprzedawca
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`px-5 py-4 border-t ${cfg.border} ${cfg.bg}`}>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// === Fallback: plain description (old listings without aiSections) ===
function PlainDescription({ description }) {
  const [showMore, setShowMore] = useState(false);
  const words = (description || "").trim().split(/\s+/);
  const shouldTruncate = words.length > 40;
  const previewText = shouldTruncate ? words.slice(0, 40).join(" ") + "…" : description;

  if (!description?.trim()) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        Brak opisu dla tego ogłoszenia.
      </p>
    );
  }

  return (
    <div>
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line transition-colors duration-300">
        {showMore ? description : previewText}
      </p>
      {shouldTruncate && (
        <button
          className="text-blue-500 dark:text-blue-400 mt-2 text-sm underline transition-colors duration-300"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Pokaż mniej" : "Pokaż więcej"}
        </button>
      )}
    </div>
  );
}

// === Main Component ===
const DetailTab = ({ cardetails }) => {
  const aiSections = Array.isArray(cardetails?.aiSections) && cardetails.aiSections.length > 0
    ? cardetails.aiSections
    : null;

  return (
    <div className="space-y-3">
      {aiSections ? (
        <>
          {/* AI-generated structured listing */}
          <div className="flex items-center gap-2 mb-4">
            <img src="/logooo.png" alt="Ojest AI" className="h-5 w-5 object-contain" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Opis wygenerowany przez Ojest AI
            </span>
          </div>
          {aiSections.map((section, i) => (
            <AISectionCard key={section.heading} section={section} index={i} />
          ))}
        </>
      ) : (
        <>
          {/* Fallback: old plain text description */}
          <p className="font-semibold text-sm text-gray-900 dark:text-white uppercase tracking-wide mb-2">
            Opis
          </p>
          <PlainDescription description={cardetails?.description} />
        </>
      )}
    </div>
  );
};

export default DetailTab;
