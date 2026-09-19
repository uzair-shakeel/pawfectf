"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { useAnimatedOpen } from "../../lib/useAnimatedOpen";

export default function CustomSelect({
  value,
  onChange,
  options,
  label,
  icon: Icon,
  ariaLabel,
  menuClassName = "",
  disabled = false,
  variant = "search",
  tone = "light",
}) {
  const { open, mounted, closing, hide, toggle } = useAnimatedOpen(200);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    bottom: null,
    left: 0,
    width: 0,
    maxHeight: 280,
    openUp: false,
  });
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const isFilter = variant === "filter";
  const isDark = isFilter && tone === "dark";
  const list = Array.isArray(options) ? options : [];
  const selected = list.find((opt) => opt.value === value) || list[0];

  const updatePos = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(rect.width, 160);
    const maxH = 280;
    const estimatedH = Math.min(maxH, Math.max(48, list.length * 44 + 8));
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUp = spaceBelow < estimatedH && spaceAbove > spaceBelow;
    const height = Math.min(maxH, openUp ? spaceAbove : spaceBelow);

    setMenuPos({
      top: openUp ? null : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : null,
      left: Math.min(Math.max(8, rect.left), window.innerWidth - width - 8),
      width,
      maxHeight: Math.max(120, height),
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (!mounted) return;
    updatePos();
    const t = requestAnimationFrame(() => {
      const menuEl = menuRef.current;
      const trigger = wrapRef.current;
      if (!menuEl || !trigger) return;
      const triggerRect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerRect.bottom - 12;
      const estimatedH = Math.min(280, Math.max(48, list.length * 44 + 8));
      const shouldOpenUp = spaceBelow < estimatedH && triggerRect.top - 12 > spaceBelow;
      if (!shouldOpenUp) return;
      const maxH = Math.min(280, triggerRect.top - 12);
      setMenuPos((prev) => ({
        ...prev,
        openUp: true,
        top: null,
        bottom: window.innerHeight - triggerRect.top + 6,
        maxHeight: Math.min(Math.max(menuEl.scrollHeight, 48), maxH),
      }));
    });
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [mounted, list.length]);

  useEffect(() => {
    if (disabled) hide();
  }, [disabled, hide]);

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

  const menu = mounted && menuPos.width > 0 && createPortal(
    <div
      ref={menuRef}
      className={`${isFilter ? `flt-select-menu ${isDark ? "is-dark" : "is-light"}` : "mkt-select-menu"} ${closing ? "is-closing" : ""} ${menuClassName}`}
      role="listbox"
      style={{
        position: "fixed",
        top: menuPos.openUp ? "auto" : menuPos.top,
        bottom: menuPos.openUp ? menuPos.bottom : "auto",
        left: menuPos.left,
        width: menuPos.width,
        maxHeight: menuPos.maxHeight,
        zIndex: 500,
        pointerEvents: closing ? "none" : "auto",
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {list.map((opt) => (
        <button
          key={opt.value || "empty"}
          type="button"
          role="option"
          aria-selected={opt.value === value}
          data-active={opt.value === value}
          className={isFilter ? "flt-select-option" : "mkt-select-option"}
          onClick={() => {
            onChange(opt.value);
            hide();
          }}
        >
          <span>{opt.label}</span>
          {!isFilter && opt.value === value && <Check className="h-4 w-4 text-[#2563EB]" />}
        </button>
      ))}
    </div>,
    document.body
  );

  if (isFilter) {
    return (
      <div ref={wrapRef} className="flt-select">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel || selected?.label}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            if (!open) updatePos();
            toggle();
          }}
          className={`flt-select-btn ${isDark ? "is-dark" : "is-light"}`}
        >
          <span className="min-w-0 truncate">{selected?.label}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {menu}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`mkt-field ${disabled ? "pointer-events-none opacity-[0.32]" : ""}`}>
      {Icon && <Icon className="mr-3 h-5 w-5 shrink-0 text-[#2563EB]" />}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || label}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (!open) updatePos();
          toggle();
        }}
        className="h-full min-w-0 flex-1 text-left"
      >
        <span className="mkt-field-stack">
          {label && <span className="mkt-field-label">{label}</span>}
          <span className="mkt-field-value truncate">{selected?.label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {menu}
    </div>
  );
}
