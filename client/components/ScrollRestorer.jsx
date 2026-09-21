"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  clearReturnTarget,
  getRememberedScroll,
  getReturnTarget,
  isPetDetailPath,
  pathKey,
  rememberScroll,
  restoreScrollTo,
  setReturnTarget,
} from "../lib/scrollMemory";

/**
 * Remembers the scroll position of every URL and puts it back when the user
 * returns from a pet detail page. Any other navigation still starts at the top.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const prevKeyRef = useRef(null);
  const stopRestoreRef = useRef(null);

  // Record the current position continuously: on scroll, right before any
  // click that might navigate, and before the tab unloads.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch {
        /* ignore */
      }
    }

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        rememberScroll();
      });
    };
    const snapshot = () => rememberScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", snapshot, true);
    window.addEventListener("pagehide", snapshot);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", snapshot, true);
      window.removeEventListener("pagehide", snapshot);
    };
  }, []);

  useEffect(() => {
    const key = pathKey();
    const prevKey = prevKeyRef.current;
    prevKeyRef.current = key;

    stopRestoreRef.current?.();
    stopRestoreRef.current = null;

    // Heading into a pet page: come back to wherever we are standing now.
    if (isPetDetailPath(key)) {
      if (prevKey && !isPetDetailPath(prevKey)) setReturnTarget(prevKey);
      window.scrollTo(0, 0);
      return undefined;
    }

    if (getReturnTarget() === key) {
      clearReturnTarget();
      const y = getRememberedScroll(key);
      if (y != null && y > 0) {
        stopRestoreRef.current = restoreScrollTo(y);
        return () => {
          stopRestoreRef.current?.();
          stopRestoreRef.current = null;
        };
      }
    }

    // Normal navigation (not the first paint of a fresh load) starts at the top.
    if (prevKey && prevKey !== key) window.scrollTo(0, 0);
    return undefined;
  }, [pathname]);

  return null;
}
