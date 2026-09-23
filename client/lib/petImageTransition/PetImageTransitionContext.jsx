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

/** Prefer the same photo tile the forward morph left from */
function findCardLandingEl(petId, imageIndex = 0) {
  const card = findCardEl(petId);
  if (!card) return null;
  const tiles = [...card.querySelectorAll("[data-pet-tile]")];
  if (!tiles.length) return card;
  const idx = Math.min(
    Math.max(0, Number(imageIndex) || 0),
    tiles.length - 1
  );
  return tiles[idx] || card;
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

/**
 * Predict where the detail hero will land so the morph can start expanding
 * immediately — waiting for the next route to mount is what felt like a reload.
 */
function estimateDetailHeroRect() {
  if (typeof window === "undefined") return null;
  const vw = window.innerWidth;
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  const padX = vw >= 640 ? 32 : 16;
  const maxContent = Math.min(vw, 1520);
  const sideGutter = Math.max(0, (vw - maxContent) / 2);
  const left = sideGutter + padX;
  const width = Math.max(120, maxContent - padX * 2);
  // Navbar (~64) + page py + back button row
  const top = 64 + (vw >= 1024 ? 40 : 24) + 40;
  if (isDesktop) {
    let height = 380;
    if (vw >= 1536) height = 600;
    else if (vw >= 1280) height = 560;
    else if (vw >= 1024) height = 520;
    else if (vw >= 768) height = 461;
    else if (vw >= 640) height = 430;
    return { top, left, width, height };
  }
  return { top, left, width, height: Math.round(width * 0.75) };
}

const MORPH_DURATION = 0.68;
const VEIL_ACTIVE = 1;

function easeOutCubic(t) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) * (1 - x) * (1 - x);
}

/** Where object-fit:cover would draw the bitmap inside a box. */
function coverImageRect(box, aspect) {
  const a = aspect > 0.05 ? aspect : box.width / Math.max(box.height, 1);
  const boxAspect = box.width / Math.max(box.height, 1);
  if (boxAspect > a) {
    const width = box.width;
    const height = width / a;
    return {
      left: box.left,
      top: box.top + (box.height - height) / 2,
      width,
      height,
    };
  }
  const height = box.height;
  const width = height * a;
  return {
    left: box.left + (box.width - width) / 2,
    top: box.top,
    width,
    height,
  };
}

function tweenMorph({ from, to, fromImage, toImage, duration, onUpdate, onComplete }) {
  const start = performance.now();
  let raf = 0;
  let stopped = false;

  const mix = (a, b, e) => a + (b - a) * e;

  const tick = (now) => {
    if (stopped) return;
    const t = Math.min(1, (now - start) / (duration * 1000));
    const e = easeOutCubic(t);
    onUpdate(
      {
        top: mix(from.top, to.top, e),
        left: mix(from.left, to.left, e),
        width: mix(from.width, to.width, e),
        height: mix(from.height, to.height, e),
        borderRadius: mix(from.borderRadius, to.borderRadius, e),
      },
      {
        left: mix(fromImage.left, toImage.left, e),
        top: mix(fromImage.top, toImage.top, e),
        width: mix(fromImage.width, toImage.width, e),
        height: mix(fromImage.height, toImage.height, e),
      },
      t
    );
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  };

  raf = requestAnimationFrame(tick);
  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
}

function tweenFade({ from, to, duration, onUpdate, onComplete }) {
  const start = performance.now();
  let raf = 0;
  let stopped = false;
  const tick = (now) => {
    if (stopped) return;
    const t = Math.min(1, (now - start) / (duration * 1000));
    const e = 1 - (1 - t) * (1 - t);
    onUpdate({
      cover: from.cover + (to.cover - from.cover) * e,
      veil: from.veil + (to.veil - from.veil) * e,
    });
    if (t < 1) raf = requestAnimationFrame(tick);
    else onComplete?.();
  };
  raf = requestAnimationFrame(tick);
  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
}

export function PetImageTransitionProvider({ children }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState("idle"); // idle | departing | waiting | morphing | done | releasing
  const [payload, setPayload] = useState(null);
  const [visual, setVisual] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [veilOpacity, setVeilOpacity] = useState(VEIL_ACTIVE);

  const phaseRef = useRef(phase);
  const payloadRef = useRef(payload);
  const visualRef = useRef(null);
  const targetRef = useRef(null); // { petId, el }
  const animControlsRef = useRef(null);
  const clipRef = useRef(null);
  const flyImgRef = useRef(null);
  const veilRef = useRef(null);
  const parkedRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const morphStartedRef = useRef(false);
  const morphRetryCountRef = useRef(0);
  const lastForwardRef = useRef(null);
  const lastTargetRectRef = useRef(null);
  const reachedDetailRef = useRef(false);

  phaseRef.current = phase;
  payloadRef.current = payload;
  visualRef.current = visual;

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
    lastTargetRectRef.current = null;
    reachedDetailRef.current = false;
    setPhase("idle");
    setPayload(null);
    setVisual(null);
    setVeilOpacity(VEIL_ACTIVE);
  }, [clearSafety]);

  const armSafety = useCallback(
    (ms = 4500) => {
      clearSafety();
      safetyTimerRef.current = setTimeout(() => finish(), ms);
    },
    [clearSafety, finish]
  );

  const applyVisual = useCallback((proxy, opacity = 1) => {
    setVisual({
      top: proxy.top,
      left: proxy.left,
      width: proxy.width,
      height: proxy.height,
      borderRadius: `${proxy.borderRadius}px`,
      opacity,
    });
  }, []);

  /** Direct DOM writes — React setState every frame is what made the flight stutter. */
  const paintFly = useCallback((clip, image, radiusPx, opacity, veil) => {
    parkedRef.current = { clip, image, radius: radiusPx };
    const v = veilRef.current;
    if (v) v.style.opacity = String(veil);
    const c = clipRef.current;
    if (!c || !clip) return;
    c.style.width = `${clip.width}px`;
    c.style.height = `${clip.height}px`;
    c.style.transform = `translate3d(${clip.left}px, ${clip.top}px, 0)`;
    c.style.borderRadius = `${radiusPx}px`;
    c.style.opacity = String(opacity);
    const im = flyImgRef.current;
    if (!im || !image) return;
    im.style.width = `${image.width}px`;
    im.style.height = `${image.height}px`;
    im.style.transform = `translate3d(${image.left - clip.left}px, ${image.top - clip.top}px, 0)`;
  }, []);

  const runMorph = useCallback(
    (opts = {}) => {
      const current = payloadRef.current;
      const target = targetRef.current;
      const currentPhase = phaseRef.current;
      const forceRetarget = !!opts.retarget;

      if (!current || !target) return;
      if (String(current.petId) !== String(target.petId)) return;
      // Reverse: never fly while still on the detail route (departing)
      if (current.direction === "reverse" && currentPhase === "departing") {
        return;
      }
      if (
        !forceRetarget &&
        currentPhase !== "waiting" &&
        currentPhase !== "departing"
      ) {
        return;
      }
      if (!forceRetarget && morphStartedRef.current) return;

      let to = rectFromElement(target.el);
      let toRadiusStr = readBorderRadius(target.el) || "0px";

      if (current.direction === "reverse") {
        const liveEl = findCardLandingEl(
          current.petId,
          current.imageIndex ?? 0
        );
        if (liveEl) {
          const liveRect = rectFromElement(liveEl);
          if (liveRect) {
            to = liveRect;
            toRadiusStr =
              readBorderRadius(liveEl) || current.toRadius || "0px";
            targetRef.current = { petId: current.petId, el: liveEl };
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
            if (!morphStartedRef.current || forceRetarget) runMorph(opts);
          });
        } else if (current.direction === "reverse") {
          finish();
        }
        return;
      }
      morphRetryCountRef.current = 0;

      const fromVisual = visualRef.current;
      const from =
        forceRetarget && fromVisual
          ? {
              top: fromVisual.top,
              left: fromVisual.left,
              width: fromVisual.width,
              height: fromVisual.height,
            }
          : current.from;
      const fromRadiusStr =
        forceRetarget && fromVisual?.borderRadius
          ? fromVisual.borderRadius
          : current.borderRadius;

      // Skip tiny retargets that only cause a visible snap
      if (forceRetarget && lastTargetRectRef.current && to) {
        const prev = lastTargetRectRef.current;
        const drift =
          Math.abs(prev.top - to.top) +
          Math.abs(prev.left - to.left) +
          Math.abs(prev.width - to.width) +
          Math.abs(prev.height - to.height);
        if (drift < 24) return;
      }
      lastTargetRectRef.current = to ? { ...to } : null;

      morphStartedRef.current = true;
      phaseRef.current = "morphing";
      setPhase("morphing");

      const fromR = parseRadiusPx(fromRadiusStr);
      const toR = parseRadiusPx(toRadiusStr);
      const aspect =
        current.imageAspect > 0
          ? current.imageAspect
          : from.width / Math.max(from.height, 1);
      const fromBox = {
        left: from.left,
        top: from.top,
        width: from.width,
        height: from.height,
      };
      const toBox = {
        left: to.left,
        top: to.top,
        width: to.width,
        height: to.height,
      };
      const fromImage = coverImageRect(fromBox, aspect);
      const toImage = coverImageRect(toBox, aspect);

      if (animControlsRef.current) {
        animControlsRef.current.stop();
      }

      const duration = MORPH_DURATION;
      setVeilOpacity(VEIL_ACTIVE);
      paintFly(fromBox, fromImage, fromR, 1, VEIL_ACTIVE);

      animControlsRef.current = tweenMorph({
        from: { ...fromBox, borderRadius: fromR },
        to: { ...toBox, borderRadius: toR },
        fromImage,
        toImage,
        duration,
        onUpdate: (clip, image) => {
          paintFly(clip, image, clip.borderRadius, 1, VEIL_ACTIVE);
        },
        onComplete: () => {
          paintFly(toBox, toImage, toR, 1, VEIL_ACTIVE);
          if (current.direction === "reverse") {
            clearMorphSources();
            const endClip = toBox;
            const endImage = toImage;
            animControlsRef.current = tweenFade({
              from: { cover: 1, veil: VEIL_ACTIVE },
              to: { cover: 0, veil: 0 },
              duration: 0.18,
              onUpdate: ({ cover, veil }) => {
                paintFly(endClip, endImage, toR, cover, veil);
              },
              onComplete: () => finish(),
            });
            return;
          }
          phaseRef.current = "done";
          setPhase("done");
        },
      });
    },
    [finish, paintFly]
  );

  // Abort only after we actually landed on the detail route, then left it.
  // (Do NOT abort while still on the list — morph starts before navigation.)
  useEffect(() => {
    if (!payload?.href) return;
    if (phase !== "morphing" && phase !== "done" && phase !== "releasing") {
      return;
    }
    if (payload.direction === "reverse") return;
    try {
      const expected = new URL(payload.href, window.location.origin).pathname;
      if (pathname === expected) {
        reachedDetailRef.current = true;
        return;
      }
      if (reachedDetailRef.current && pathname !== expected) {
        finish();
      }
    } catch {
      /* ignore */
    }
  }, [pathname, phase, payload, finish]);

  // Retry morph when phase/payload change or after resize/layout
  useEffect(() => {
    if (phase !== "waiting" && phase !== "departing") return;
    // Reverse waits for scroll restore effect to flip into waiting
    if (payload?.direction === "reverse" && phase === "departing") return;
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) runMorph();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
    // Intentionally omit runMorph — identity churn was cancelling the rAF
    // before the morph could start (frozen overlay / blink).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, payload?.petId, payload?.direction, payload?.href]);

  const startTransition = useCallback(
    ({ petId, href, imageSrc, sourceEl, clientX, clientY, imageCount: imageCountArg }) => {
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
      reachedDetailRef.current = false;

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

      const imageAspect =
        photoImg && photoImg.naturalWidth > 0 && photoImg.naturalHeight > 0
          ? photoImg.naturalWidth / photoImg.naturalHeight
          : from.width / Math.max(from.height, 1);
      const imageCount = Math.max(
        1,
        Number.isFinite(imageCountArg) ? imageCountArg : 1
      );

      lastForwardRef.current = {
        petId: String(petId),
        imageSrc: readySrc,
        from: { ...from },
        borderRadius,
        listPath,
        scrollX,
        scrollY,
        imageAspect,
        imageCount,
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
        imageAspect,
        imageCount,
        imageIndex:
          typeof resolved?.imageIndex === "number" ? resolved.imageIndex : 0,
      };

      // No guessed hero rect. The flyer stays on the card until the real
      // hero has a stable box, then one tween — no mid-flight correction.
      targetRef.current = null;

      setPayload(next);
      payloadRef.current = next;
      setVisual({
        ...from,
        borderRadius,
        opacity: 1,
      });
      setVeilOpacity(VEIL_ACTIVE);
      phaseRef.current = "waiting";
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
        imageAspect: last.imageAspect,
        imageCount: last.imageCount,
        scrollX: last.scrollX ?? 0,
        scrollY: last.scrollY ?? 0,
      });
      payloadRef.current = {
        petId: id,
        href,
        imageSrc: readySrc,
        from,
        to: { ...last.from },
        toRadius: last.borderRadius || "0px",
        borderRadius: readBorderRadius(sourceEl) || "0px",
        direction: "reverse",
        imageIndex: last.imageIndex ?? 0,
        imageAspect: last.imageAspect,
        imageCount: last.imageCount,
        scrollX: last.scrollX ?? 0,
        scrollY: last.scrollY ?? 0,
      };
      setVisual({
        ...from,
        borderRadius: readBorderRadius(sourceEl) || "0px",
        opacity: 1,
      });
      setVeilOpacity(VEIL_ACTIVE);
      phaseRef.current = "departing";
      setPhase("departing");
      armSafety(2800);

      return href;
    },
    [armSafety]
  );

  // Reverse: hide the route swap, put the list back where it was, then shrink
  // into that card. Scroll must not move once the flight starts.
  useLayoutEffect(() => {
    if (!payload || payload.direction !== "reverse") return;
    if (phase !== "departing") return;
    if (isPetDetailPath(pathname)) return;

    const petId = payload.petId;
    const imageIndex = payload.imageIndex ?? 0;
    const scrollX = payload.scrollX ?? 0;
    const scrollY = payload.scrollY ?? 0;
    let cancelled = false;
    let rafId = 0;
    let tries = 0;
    let prevTop = null;
    let stable = 0;

    const placeList = () => {
      try {
        window.scrollTo(scrollX, scrollY);
      } catch {
        /* ignore */
      }
    };

    const beginMorph = () => {
      if (cancelled) return;
      placeList();

      const land = findCardLandingEl(petId, imageIndex);
      let to = land ? rectFromElement(land) : null;
      let toRadius = land
        ? readBorderRadius(land) || payload.toRadius || "0px"
        : payload.toRadius || "0px";
      if (!to && payload.to) to = payload.to;
      if (!to) {
        finish();
        return;
      }

      // Leave the real card visible. The flyer lands on top of it, then fades.
      targetRef.current = {
        petId,
        el: land || makeFakeEl(to),
      };
      payloadRef.current = { ...payloadRef.current, to, toRadius };
      morphStartedRef.current = false;
      morphRetryCountRef.current = 0;
      setVeilOpacity(VEIL_ACTIVE);
      phaseRef.current = "waiting";
      setPhase("waiting");
      runMorph();
    };

    const go = () => {
      if (cancelled) return;
      placeList();
      const land = findCardLandingEl(petId, imageIndex);
      const rect = land ? rectFromElement(land) : null;
      const scrolled =
        scrollY <= 1 || Math.abs(window.scrollY - scrollY) < 3;
      if (rect && scrolled && prevTop != null && Math.abs(rect.top - prevTop) < 2) {
        stable += 1;
      } else {
        stable = 0;
      }
      prevTop = rect ? rect.top : null;
      tries += 1;
      if (rect && scrolled && stable >= 1) {
        beginMorph();
        return;
      }
      if (tries < 16) {
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
  }, [pathname, phase, payload, finish, runMorph]);

  const registerTarget = useCallback(
    (petId, targetEl) => {
      if (!petId || !targetEl) return () => {};

      targetRef.current = { petId: String(petId), el: targetEl };

      requestAnimationFrame(() => {
        const p = phaseRef.current;
        const dir = payloadRef.current?.direction;
        // One flight only. A second correction is the stutter.
        if (dir === "reverse") return;
        if (p === "waiting" && !morphStartedRef.current) runMorph();
      });

      return () => {
        if (
          targetRef.current &&
          String(targetRef.current.petId) === String(petId) &&
          targetRef.current.el === targetEl
        ) {
          const p = phaseRef.current;
          if (p === "idle" || p === "releasing") {
            targetRef.current = null;
          }
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

    const parked = parkedRef.current;
    if (animControlsRef.current) animControlsRef.current.stop();
    animControlsRef.current = tweenFade({
      from: { cover: 1, veil: VEIL_ACTIVE },
      to: { cover: 0, veil: 0 },
      duration: 0.2,
      onUpdate: ({ cover, veil }) => {
        if (!parked) return;
        paintFly(parked.clip, parked.image, parked.radius, cover, veil);
      },
      onComplete: () => finish(),
    });
  }, [finish, paintFly]);

  useLayoutEffect(() => {
    if (!visual) return;
    if (phase !== "waiting" && phase !== "departing") return;
    const aspect =
      payloadRef.current?.imageAspect ||
      visual.width / Math.max(visual.height, 1);
    const clip = {
      left: visual.left,
      top: visual.top,
      width: visual.width,
      height: visual.height,
    };
    paintFly(
      clip,
      coverImageRect(clip, aspect),
      parseRadiusPx(
        typeof visual.borderRadius === "number"
          ? `${visual.borderRadius}px`
          : visual.borderRadius
      ),
      visual.opacity ?? 1,
      veilOpacity
    );
  }, [visual, phase, veilOpacity, paintFly]);

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
      shellImageCount: payload?.imageCount ?? 0,
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
              ref={veilRef}
              className="absolute inset-0 bg-white dark:bg-black"
              style={{ opacity: veilOpacity }}
            />
            <div
              ref={clipRef}
              className="absolute left-0 top-0 overflow-hidden bg-transparent"
              style={{
                width: visual.width,
                height: visual.height,
                transform: `translate3d(${visual.left}px, ${visual.top}px, 0)`,
                borderRadius: visual.borderRadius,
                opacity: visual.opacity ?? 1,
                willChange: "transform, width, height, opacity",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={flyImgRef}
                src={payload.imageSrc}
                alt=""
                draggable={false}
                decoding="sync"
                className="absolute left-0 top-0 max-w-none"
                style={{
                  width: visual.width,
                  height: visual.height,
                }}
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
      shellImageCount: 0,
      finish: () => {},
    };
  }
  return ctx;
}
