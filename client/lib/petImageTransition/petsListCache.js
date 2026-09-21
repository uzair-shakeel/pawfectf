/** In-memory list cache so back navigation doesn't flash a blank/loading remount. */
const cache = new Map();
const MAX_ENTRIES = 8;

export function petsListCacheKey(filters) {
  try {
    return JSON.stringify(filters || {});
  } catch {
    return String(filters);
  }
}

export function readPetsListCache(key) {
  if (!key) return null;
  const entry = cache.get(key);
  if (!entry || !Array.isArray(entry.pets)) return null;
  return { pets: entry.pets, totalItems: entry.totalItems };
}

export function writePetsListCache(key, pets, totalItems) {
  if (!key) return;
  if (cache.size >= MAX_ENTRIES && !cache.has(key)) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, {
    pets: Array.isArray(pets) ? pets : [],
    totalItems: Number(totalItems) || 0,
  });
}
