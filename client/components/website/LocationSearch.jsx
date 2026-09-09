"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Search, ChevronDown } from "lucide-react";
import { useAnimatedOpen } from "../../lib/useAnimatedOpen";

const POPULAR = [
  { name: "Warszawa", region: "Mazowieckie" },
  { name: "Kraków", region: "Małopolskie" },
  { name: "Wrocław", region: "Dolnośląskie" },
  { name: "Poznań", region: "Wielkopolskie" },
  { name: "Gdańsk", region: "Pomorskie" },
  { name: "Łódź", region: "Łódzkie" },
  { name: "Szczecin", region: "Zachodniopomorskie" },
  { name: "Lublin", region: "Lubelskie" },
  { name: "Katowice", region: "Śląskie" },
  { name: "Białystok", region: "Podlaskie" },
];

export default function LocationSearch({
  value,
  onChange,
  label,
  placeholder,
  variant = "search",
  tone = "light",
}) {
  const { open, mounted, closing, show, hide, toggle } = useAnimatedOpen(200);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(POPULAR);
  const [loading, setLoading] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 280, maxHeight: 320 });
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const isFilter = variant === "filter";
  const isDark = isFilter && tone === "dark";

  const updatePos = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(rect.width, 260);
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const height = Math.min(340, openUp ? spaceAbove : spaceBelow);
    setMenuPos({
      top: openUp ? Math.max(8, rect.top - height - 6) : rect.bottom + 6,
      left: Math.min(Math.max(8, rect.left), window.innerWidth - width - 8),
      width,
      maxHeight: Math.max(180, height),
    });
  };

  useLayoutEffect(() => {
    if (!mounted) return;
    updatePos();
    const t = setTimeout(() => searchRef.current?.focus(), 30);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || closing) return;
    const q = query.trim();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/locations?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(Array.isArray(data.results) && data.results.length ? data.results : POPULAR);
      } catch {
        const needle = q.toLowerCase();
        setResults(POPULAR.filter((c) => c.name.toLowerCase().includes(needle)));
      } finally {
        setLoading(false);
      }
    }, q.length < 2 ? 0 : 280);
    return () => clearTimeout(timer);
  }, [query, mounted, closing]);

  useEffect(() => {
    const onDoc = (event) => {
      if (wrapRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      hide();
    };
    const onKey = (event) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [hide]);

  const pick = (city) => {
    onChange(city.name);
    setQuery("");
    hide();
  };

  const menu = mounted && menuPos.width > 0 && createPortal(
    <div
      ref={menuRef}
      className={`loc-menu ${closing ? "is-closing" : ""}`}
      style={{
        position: "fixed",
        top: menuPos.top,
        left: menuPos.left,
        width: menuPos.width,
        zIndex: 500,
        maxHeight: menuPos.maxHeight,
        display: "flex",
        flexDirection: "column",
        pointerEvents: closing ? "none" : "auto",
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="loc-menu-head">
        <label className="loc-menu-search">
          <Search className="loc-menu-search-icon" size={18} strokeWidth={2.2} />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (results[0]) pick(results[0]);
              }
            }}
            placeholder="Szukaj miasta w Polsce"
            className="loc-menu-search-input"
          />
        </label>
      </div>
      <div className="loc-menu-list min-h-0 flex-1 overflow-y-auto">
        <p className="loc-menu-heading">
          {query.trim().length >= 2 ? "Wyniki" : "Popularne miasta"}
        </p>
        {loading && <p className="loc-menu-empty">Szukanie...</p>}
        {!loading && results.length === 0 && (
          <p className="loc-menu-empty">Brak lokalizacji</p>
        )}
        {!loading && results.map((city) => {
          const active = value === city.name;
          return (
            <button
              key={`${city.name}-${city.region}`}
              type="button"
              onClick={() => pick(city)}
              className={`loc-item ${active ? "is-active" : ""}`}
            >
              <span className="loc-item-icon">
                <MapPin size={16} strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className="loc-item-name">{city.name}</span>
                {city.region && <span className="loc-item-region">{city.region}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );

  if (isFilter) {
    return (
      <div ref={wrapRef} className="relative w-full min-w-0">
        <button
          type="button"
          onClick={() => {
            if (!open) updatePos();
            toggle();
          }}
          className={`flt-select-btn ${isDark ? "is-dark" : "is-light"}`}
        >
          <span className="min-w-0 truncate">{value || placeholder || label}</span>
        </button>
        {menu}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="mkt-field">
      <MapPin className="mr-3 h-5 w-5 shrink-0 text-[#2563EB]" />
      <button
        type="button"
        onClick={() => {
          if (!open) updatePos();
          toggle();
        }}
        className="h-full min-w-0 flex-1 text-left"
      >
        <span className="mkt-field-stack">
          {label && <span className="mkt-field-label">{label}</span>}
          <span className={`mkt-field-value truncate ${value ? "" : "text-[#64748B] dark:text-white/45"}`}>
            {value || placeholder || label}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {menu}
    </div>
  );
}
