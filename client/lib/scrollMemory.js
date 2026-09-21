/**
 * Per-URL scroll memory backed by sessionStorage so it survives both client
 * navigations and full page reloads.
 */

const MEMORY_KEY = "pawfect:scroll-memory";
const RETURN_KEY = "pawfect:scroll-return";
const MAX_ENTRIES = 30;

export function pathKey() {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
}

export function isPetDetailPath(path) {
  return /^\/website\/pets\/[^/?#]+/.test(String(path || "").split("?")[0]);
}

function readMemory() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(MEMORY_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeMemory(map) {
  try {
    const keys = Object.keys(map);
    if (keys.length > MAX_ENTRIES) {
      keys
        .slice(0, keys.length - MAX_ENTRIES)
        .forEach((key) => delete map[key]);
    }
    sessionStorage.setItem(MEMORY_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function rememberScroll(key = pathKey(), y = window.scrollY) {
  if (typeof window === "undefined" || !key) return;
  const map = readMemory();
  map[key] = Math.max(0, Math.round(y) || 0);
  writeMemory(map);
}

export function getRememberedScroll(key = pathKey()) {
  const value = readMemory()[key];
  return typeof value === "number" ? value : null;
}

export function setReturnTarget(key) {
  if (typeof window === "undefined" || !key) return;
  try {
    sessionStorage.setItem(RETURN_KEY, key);
  } catch {
    /* ignore */
  }
}

export function getReturnTarget() {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(RETURN_KEY);
  } catch {
    return null;
  }
}

export function clearReturnTarget() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Drive the window to `y` and hold it there until the page has grown tall
 * enough and the position sticks. Async content (images, fetched lists) keeps
 * changing the document height, so a single scrollTo is never enough.
 */
export function restoreScrollTo(y, { timeout = 3000 } = {}) {
  if (typeof window === "undefined") return () => {};
  const target = Math.max(0, Number(y) || 0);
  if (target === 0) {
    window.scrollTo(0, 0);
    return () => {};
  }

  const events = ["wheel", "touchstart", "keydown", "pointerdown"];

  let rafId = 0;
  let cancelled = false;
  let settledFrames = 0;
  const startedAt = Date.now();

  const onUserInput = () => stop();

  function stop() {
    cancelled = true;
    cancelAnimationFrame(rafId);
    events.forEach((type) => window.removeEventListener(type, onUserInput));
  }

  events.forEach((type) =>
    window.addEventListener(type, onUserInput, { passive: true })
  );

  const tick = () => {
    if (cancelled) return;

    const maxScroll = Math.max(
      0,
      (document.documentElement?.scrollHeight || 0) - window.innerHeight
    );
    const reachable = Math.min(target, maxScroll);

    if (Math.abs(window.scrollY - reachable) > 1) {
      window.scrollTo(0, reachable);
      settledFrames = 0;
    } else if (maxScroll >= target - 1) {
      settledFrames += 1;
    } else {
      settledFrames = 0;
    }

    if (settledFrames >= 6 || Date.now() - startedAt > timeout) {
      stop();
      return;
    }
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
  return stop;
}
