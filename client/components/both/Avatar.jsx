"use client";

import React, { useState, useMemo } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";

// A unified Avatar component with robust fallbacks and URL normalization
// Props:
// - src: string | undefined
// - alt: string
// - size: number (pixels) default 40
// - className: additional classes applied to the wrapper for layout
// - imgClassName: classes applied to the <img>
export default function Avatar({
  src,
  alt = "User avatar",
  size = 40,
  className = "",
  imgClassName = "",
}) {
  const [broken, setBroken] = useState(false);
  // Use Next.js API proxy by default so backend-hosted images under /uploads work: /api/uploads/...
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const resolvedSrc = useMemo(() => {
    if (!src) return null;
    if (broken) return null;
    if (/^(https?:\/\/|blob:)/.test(src)) return src; // absolute
    if (src.startsWith("/")) return src; // public root path
    if (API_BASE) {
      const clean = src.replace(/^[/\\]/, "");
      return `${API_BASE.replace(/\/$/, "")}/${clean}`;
    }
    // Should not happen because we default API_BASE, but keep safe fallback
    const clean = src.replace(/^[/\\]/, "");
    return `/${clean}`;
  }, [src, broken, API_BASE]);

  const dimension = { width: size, height: size, minWidth: size, minHeight: size };

  if (!resolvedSrc) {
    return (
      <div
        className={`flex items-center justify-center rounded-full text-gray-600 overflow-hidden ${className}`}
        style={dimension}
        aria-label={alt}
      >
        <IoPersonCircleOutline size={Math.round(size * 1)} />
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      style={dimension}
      className={`rounded-full object-cover ${imgClassName}`}
      onError={() => setBroken(true)}
    />
  );
}
