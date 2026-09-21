"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { animate } from "framer-motion";
import { usePathname } from "next/navigation";

const PetImageTransitionContext = createContext(null);

/** Module flag so NavigationOverlay can skip without React coupling */
export const PetImageTransitionFlag = {
  active: false,
};

function rectFromElement(el) {
  if (!el) return null;
  try {
    const r =
      typeof el.getBoundingClientRect === "function"
        ? el.getBoundingClientRect()
        : el;
    if (!r || r.width < 8 || r.height < 8) return null;
    return {
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    };
  } catch {
    return null;
  }
}

function readBorderRadius(el) {
  if (!el || typeof window === "undefined") return "1rem";
  try {
    if (typeof el.getBoundingClientRect !== "function") return "0px";
    return window.getComputedStyle(el).borderRadius || "1rem";
  } catch {
    return "0px";
  }
}

function parseRadiusPx(value) {
  if (typeof value !== "string") return 0;
  if (value.includes("rem")) return parseFloat(value) * 16;
  const first = value.split(" ")[0];
  return parseFloat(first) || 0;
}

/** Prefer live URL — canvas dataURLs stall the main thread and hitch the morph. */
function snapshotReadyImg(img) {
  if (!img) return null;
  return img.currentSrc || img.src || null;
}

function isPetPhotoImg(img) {
  if (!img || img.tagName !== "IMG") return false;
  const alt = (img.getAttribute("alt") || "").toLowerCase();
  // Skip chrome overlays (premium badge, etc.)
  if (alt === "featured" || alt.includes("featured")) return false;
  const r = img.getBoundingClientRect();
  return r.width >= 8 && r.height >= 8;
}

/**
 * Pick the collage tile under the click (or the primary tile as fallback).
 * Returns { tileEl, img, imageIndex } so morph starts from that exact photo.
 */
export function resolveTransitionSource(wrapperEl, clientX, clientY) {
  if (!wrapperEl || typeof window === "undefined") {
    return { tileEl: wrapperEl, img: null, imageIndex: 0 };
  }

  const imgs = [...wrapperEl.querySelectorAll("img")].filter(isPetPhotoImg);
  if (!imgs.length) {
    return { tileEl: wrapperEl, img: null, imageIndex: 0 };
  }

  let hitImg = null;
  if (typeof clientX === "number" && typeof clientY === "number") {
    hitImg =
      imgs.find((img) => {
        const r = img.getBoundingClientRect();
        return (
          clientX >= r.left &&
          clientX <= r.right &&
          clientY >= r.top &&
          clientY <= r.bottom
        );
      }) || null;
  }

  const img = hitImg || imgs[0];
  const tileEl =
    img.closest("[data-pet-tile]") || img.parentElement || wrapperEl;

  const rawIndex = tileEl.getAttribute?.("data-pet-tile-index");
  let imageIndex = rawIndex != null ? parseInt(rawIndex, 10) : NaN;
  if (Number.isNaN(imageIndex)) {
    // Fallback: order among pet photos in the card
    imageIndex = Math.max(0, imgs.indexOf(img));
  }

  return { tileEl, img, imageIndex };
}

function getReadyImageSrc(sourceEl, fallbackSrc, preferredImg) {
  if (typeof window === "undefined") return fallbackSrc || null;

  if (preferredImg) {
    const snapped = snapshotReadyImg(preferredImg);
    if (snapped) return snapped;
  }

  if (sourceEl) {
    const imgs = [...sourceEl.querySelectorAll("img")].filter(isPetPhotoImg);
    for (const img of imgs) {
      const snapped = snapshotReadyImg(img);
      if (snapped) return snapped;
    }
  }

  // Always allow URL fallback so lazy Next/Image never blocks the morph
  return fallbackSrc || null;
}

function clearMorphSources() {
  document.querySelectorAll("[data-pet-morph-source]").forEach((el) => {
    el.removeAttribute("data-pet-morph-source");
    if (el instanceof HTMLElement) el.style.opacity = "";
  });
}

function markMorphSource(el) {
  clearMorphSources();
  if (!el) return;
  el.setAttribute("data-pet-morph-source", "1");
  if (el instanceof HTMLElement) el.style.opacity = "0";
}

function findCardEl(petId) {
  if (typeof document === "undefined" || !petId) return null;
  const id = String(petId).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return document.querySelector(`[data-pet-card-id="${id}"]`);
}

function makeFakeEl(rect) {
  return {
    getBoundingClientRect: () => ({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
    }),
  };
}

function isPetDetailPath(path) {
  return /^\/website\/pets\/[^/?#]+/.test(String(path || ""));
}

export function PetImageTransitionProvider({ children }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState("idle"); // idle | departing | waiting | morphing | done | releasing
  const [payload, setPayload] = useState(null);
  const [visual, setVisual] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [veilOpacity, setVeilOpacity] = useState(0.35);

  const phaseRef = useRef(phase);
  const payloadRef = useRef(payload);
  const targetRef = useRef(null); // { petId, el }
  const animControlsRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const morphStartedRef = useRef(false);
  const morphRetryCountRef = useRef(0);
  const lastForwardRef = useRef(null);

  phaseRef.current = phase;
  payloadRef.current = payload;

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearSafety = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    clearSafety();
    if (animControlsRef.current) {
      animControlsRef.current.stop();
      animControlsRef.current = null;
    }
    clearMorphSources();
    PetImageTransitionFlag.active = false;
    morphStartedRef.current = false;
    morphRetryCountRef.current = 0;
    setPhase("idle");
    setPayload(null);
    setVisual(null);
    setVeilOpacity(0.35);
  }, [clearSafety]);

  const armSafety = useCallback(
    (ms = 4500) => {
      clearSafety();
      safetyTimerRef.current = setTimeout(() => finish(), ms);
    },
    [clearSafety, finish]
  );

  const runMorph = useCallback(() => {
    const current = payloadRef.current;
    const target = targetRef.current;
    const currentPhase = phaseRef.current;

    if (!current || !target) return;
    if (String(current.petId) !== String(target.petId)) return;
    if (currentPhase !== "waiting" && currentPhase !== "departing") return;
    if (morphStartedRef.current) return;

    let to = rectFromElement(target.el);
    let toRadiusStr = readBorderRadius(target.el) || "0px";

    if (current.direction === "reverse") {
      const live = findCardEl(current.petId);
      if (live) {
        const liveRect = rectFromElement(live);
        if (liveRect) {
          to = liveRect;
          toRadiusStr = readBorderRadius(live) || current.toRadius || "0px";
          targetRef.current = { petId: current.petId, el: live };
        }
      } else if (current.to) {
        to = current.to;
        toRadiusStr = current.toRadius || "0px";
      }
    }

    if (!to) {
      if (morphRetryCountRef.current < 60) {
        morphRetryCountRef.current += 1;
        requestAnimationFrame(() => {
          if (!morphStartedRef.current) runMorph();
        });
      } else if (current.direction === "reverse") {
        // Never leave the flying image stuck on the list
        finish();
      }
      return;
    }
    morphRetryCountRef.current = 0;

    morphStartedRef.current = true;
    setPhase("morphing");

    const from = current.from;
    const fromR = parseRadiusPx(current.borderRadius);
    const toR = parseRadiusPx(toRadiusStr);

    const proxy = {
      top: from.top,
      left: from.left,
      width: from.width,
      height: from.height,
      borderRadius: fromR,
    };

    setVisual({
      top: from.top,
      left: from.left,
      width: from.width,
      height: from.height,
      borderRadius: `${fromR}px`,
      opacity: 1,
    });

    if (animControlsRef.current) {
      animControlsRef.current.stop();
    }

    animControlsRef.current = animate(
      proxy,
      {
        top: to.top,
        left: to.left,
        width: to.width,
        height: to.height,
        borderRadius: toR,
      },
      {
        duration: 0.55,
        ease: [0.32, 0.72, 0, 1],
        onUpdate: () => {
          setVisual({
            top: proxy.top,
            left: proxy.left,
            width: proxy.width,
            height: proxy.height,
            borderRadius: `${proxy.borderRadius}px`,
            opacity: 1,
          });
        },
        onComplete: () => {
          if (current.direction === "reverse") {
            const fade = { cover: 1, veil: 0.28 };
            animControlsRef.current = animate(
              fade,
              { cover: 0, veil: 0 },
              {
                duration: 0.14,
                ease: "easeOut",
                onUpdate: () => {
                  setVeilOpacity(fade.veil);
                  setVisual((prev) =>
                    prev ? { ...prev, opacity: fade.cover } : prev
                  );
                },
                onComplete: () => finish(),
              }
            );
            return;
          }
          // Stay in "done" with the floating image covering the hero until
          // the detail page confirms the matching main image has painted.
          setPhase("done");
        },
      }
    );
  }, [finish]);

  // Abort only if we already reached the detail route, then left it
  useEffect(() => {
    if (!payload?.href) return;
    if (phase !== "morphing" && phase !== "done") return;
    if (payload.direction === "reverse") return;
    try {
      const expected = new URL(payload.href, window.location.origin).pathname;
      if (pathname !== expected) finish();
    } catch {
      /* ignore */
    }
  }, [pathname, phase, payload, finish]);

  // Retry morph when phase/payload change or after resize/layout
  useEffect(() => {
    if (phase !== "waiting" && phase !== "departing") return;
    // Reverse waits for scroll restore effect to flip into waiting
    if (payload?.direction === "reverse" && phase === "departing") return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => runMorph());
    });
    return () => cancelAnimationFrame(id);
  }, [phase, payload, runMorph]);

  const startTransition = useCallback(
    ({ petId, href, imageSrc, sourceEl, clientX, clientY }) => {
      if (!href || !petId || !sourceEl) return false;

      // Collage cards: morph from the exact tile under the click, not the whole card frame
      const resolved = resolveTransitionSource(sourceEl, clientX, clientY);
      const tileEl = resolved?.tileEl || sourceEl;
      const photoImg = resolved?.img || null;

      const from = rectFromElement(tileEl) || rectFromElement(sourceEl);
      if (!from) return false;

      const readySrc = getReadyImageSrc(tileEl, imageSrc, photoImg);
      if (!readySrc) return false;

      if (animControlsRef.current) {
        animControlsRef.current.stop();
        animControlsRef.current = null;
      }
      morphStartedRef.current = false;
      morphRetryCountRef.current = 0;

      const tileRadius = readBorderRadius(tileEl);
      const wrapRadius = readBorderRadius(sourceEl);
      const borderRadius =
        parseRadiusPx(tileRadius) > 0 ? tileRadius : wrapRadius;

      markMorphSource(tileEl);

      PetImageTransitionFlag.active = true;

      const listPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/website/pets";

      const scrollX = window.scrollX || 0;
      const scrollY = window.scrollY || 0;

      lastForwardRef.current = {
        petId: String(petId),
        imageSrc: readySrc,
        from: { ...from },
        borderRadius,
        listPath,
        scrollX,
        scrollY,
        imageIndex:
          typeof resolved?.imageIndex === "number" ? resolved.imageIndex : 0,
      };

      const next = {
        petId: String(petId),
        href,
        imageSrc: readySrc,
        from,
        borderRadius,
        direction: "forward",
        imageIndex:
          typeof resolved?.imageIndex === "number" ? resolved.imageIndex : 0,
      };

      setPayload(next);
      setVisual({
        ...from,
        borderRadius,
        opacity: 1,
      });
      setVeilOpacity(0.35);
      setPhase("waiting");
      armSafety();

      return true;
    },
    [armSafety]
  );

  /** Product → card (same morph engine as forward) */
  const startReturnTransition = useCallback(
    ({ petId, imageSrc, sourceEl, listHref }) => {
      const last = lastForwardRef.current;
      const id = String(petId || last?.petId || "");
      if (!id || !sourceEl) return false;
      if (!last || String(last.petId) !== id) return false;

      const from = rectFromElement(sourceEl);
      if (!from) return false;

      const readySrc =
        getReadyImageSrc(sourceEl, imageSrc || last.imageSrc) || last.imageSrc;
      if (!readySrc) return false;

      const href = listHref || last.listPath || "/website/pets";

      if (animControlsRef.current) {
        animControlsRef.current.stop();
        animControlsRef.current = null;
      }
      morphStartedRef.current = false;
      morphRetryCountRef.current = 0;

      markMorphSource(sourceEl);
      PetImageTransitionFlag.active = true;

      setPayload({
        petId: id,
        href,
        imageSrc: readySrc,
        from,
        to: { ...last.from },
        toRadius: last.borderRadius || "0px",
        borderRadius: readBorderRadius(sourceEl) || "0px",
        direction: "reverse",
        imageIndex: last.imageIndex ?? 0,
        scrollX: last.scrollX ?? 0,
        scrollY: last.scrollY ?? 0,
      });
      setVisual({
        ...from,
        borderRadius: readBorderRadius(sourceEl) || "0px",
        opacity: 1,
      });
      setVeilOpacity(0.28);
      setPhase("departing");
      armSafety(2200);

      return href;
    },
    [armSafety]
  );

  // Reverse: once we leave the detail route, wait for ScrollRestorer to put the
  // list back in place, then morph toward the live card.
  useLayoutEffect(() => {
    if (!payload || payload.direction !== "reverse") return;
    if (phase !== "departing") return;
    if (isPetDetailPath(pathname)) return;

    const petId = payload.petId;
    let cancelled = false;
    let tries = 0;
    let rafId = 0;

    const beginMorph = () => {
      if (cancelled) return;

      const card = findCardEl(petId);
      let to = payload.to;
      let toRadius = payload.toRadius || "0px";

      if (card) {
        const live = rectFromElement(card);
        if (live) {
          to = live;
          toRadius = readBorderRadius(card) || toRadius;
        }
        markMorphSource(card);
        targetRef.current = { petId, el: card };
      } else if (to) {
        targetRef.current = { petId, el: makeFakeEl(to) };
      } else {
        // Nowhere to land — fade out instead of leaving a stuck overlay
        finish();
        return;
      }

      // Avoid setPayload here, it would retrigger this effect
      payloadRef.current = { ...payloadRef.current, to, toRadius };
      setVeilOpacity(0.28);
      setPhase("waiting");
    };

    const go = () => {
      if (cancelled) return;
      const card = findCardEl(petId);
      // Give the list a few frames to render and settle at the restored offset
      if (!card && tries < 12) {
        tries += 1;
        rafId = requestAnimationFrame(go);
        return;
      }
      beginMorph();
    };

    rafId = requestAnimationFrame(go);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [pathname, phase, payload, finish]);

  const registerTarget = useCallback(
    (petId, targetEl) => {
      if (!petId || !targetEl) return () => {};

      targetRef.current = { petId: String(petId), el: targetEl };

      requestAnimationFrame(() => {
        requestAnimationFrame(() => runMorph());
      });

      return () => {
        if (
          targetRef.current &&
          String(targetRef.current.petId) === String(petId) &&
          targetRef.current.el === targetEl
        ) {
          targetRef.current = null;
        }
      };
    },
    [runMorph]
  );

  const isTransitioningFor = useCallback(
    (petId) => {
      if (!payload || !petId) return false;
      if (phase === "idle") return false;
      return String(payload.petId) === String(petId);
    },
    [payload, phase]
  );

  const peekImageIndex = useCallback(
    (id) => {
      if (!payload || !id) return null;
      if (phase === "idle") return null;
      if (String(payload.petId) !== String(id)) return null;
      return typeof payload.imageIndex === "number" ? payload.imageIndex : 0;
    },
    [payload, phase]
  );

  const confirmHandoff = useCallback(() => {
    if (phaseRef.current !== "done") return;
    phaseRef.current = "releasing";
    setPhase("releasing");

    const target = targetRef.current;
    const to = target?.el ? rectFromElement(target.el) : null;
    if (to) {
      setVisual((prev) =>
        prev
          ? {
              ...prev,
              top: to.top,
              left: to.left,
              width: to.width,
              height: to.height,
              borderRadius: readBorderRadius(target.el) || prev.borderRadius,
              opacity: 1,
            }
          : prev
      );
    }

    // Soft dissolve of the cover over the already-painted hero (kills the hard blink)
    const proxy = { cover: 1, veil: 0.35 };
    if (animControlsRef.current) animControlsRef.current.stop();
    animControlsRef.current = animate(
      proxy,
      { cover: 0, veil: 0 },
      {
        duration: 0.16,
        ease: "easeOut",
        onUpdate: () => {
          setVeilOpacity(proxy.veil);
          setVisual((prev) =>
            prev ? { ...prev, opacity: proxy.cover } : prev
          );
        },
        onComplete: () => finish(),
      }
    );
  }, [finish]);

  const value = useMemo(
    () => ({
      startTransition,
      startReturnTransition,
      registerTarget,
      isTransitioningFor,
      peekImageIndex,
      confirmHandoff,
      phase,
      activePetId: payload?.petId ?? null,
      finish,
    }),
    [
      startTransition,
      startReturnTransition,
      registerTarget,
      isTransitioningFor,
      peekImageIndex,
      confirmHandoff,
      phase,
      payload,
      finish,
    ]
  );

  const showOverlay =
    mounted &&
    visual &&
    payload &&
    (phase === "departing" ||
      phase === "waiting" ||
      phase === "morphing" ||
      phase === "done" ||
      phase === "releasing");

  return (
    <PetImageTransitionContext.Provider value={value}>
      {children}
      {showOverlay &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[10000]"
            style={{ contain: "layout paint" }}
          >
            <div
              className="absolute inset-0 bg-white dark:bg-black"
              style={{ opacity: veilOpacity }}
            />
            <div
              className="absolute overflow-hidden bg-transparent"
              style={{
                top: visual.top,
                left: visual.left,
                width: visual.width,
                height: visual.height,
                borderRadius: visual.borderRadius,
                opacity: visual.opacity ?? 1,
                boxShadow:
                  phase === "done" ||
                  phase === "morphing" ||
                  phase === "releasing"
                    ? "none"
                    : "0 25px 50px -12px rgb(0 0 0 / 0.35)",
                willChange: "top, left, width, height, border-radius, opacity",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payload.imageSrc}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
                decoding="sync"
              />
            </div>
          </div>,
          document.body
        )}
    </PetImageTransitionContext.Provider>
  );
}

export function usePetImageTransition() {
  const ctx = useContext(PetImageTransitionContext);
  if (!ctx) {
    return {
      startTransition: () => false,
      startReturnTransition: () => false,
      registerTarget: () => () => {},
      isTransitioningFor: () => false,
      peekImageIndex: () => null,
      confirmHandoff: () => {},
      phase: "idle",
      activePetId: null,
      finish: () => {},
    };
  }
  return ctx;
}
