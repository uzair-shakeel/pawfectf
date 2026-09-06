"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options,
  label,
  icon: Icon,
  ariaLabel,
  menuClassName = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((opt) => opt.value === value) || options[0];

  const updatePos = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    const onDoc = (event) => {
      if (wrapRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`mkt-field ${disabled ? "pointer-events-none opacity-[0.32]" : ""}`}>
      {Icon && <Icon className="mr-3 h-5 w-5 shrink-0 text-[#2563EB]" />}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || label}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0">
          {label && <span className="mkt-field-label">{label}</span>}
          <span className="mkt-field-value block truncate">{selected?.label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={`mkt-select-menu ${menuClassName}`}
            role="listbox"
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              zIndex: 200,
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                data-active={opt.value === value}
                className="mkt-select-option"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check className="h-4 w-4 text-[#2563EB]" />}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
