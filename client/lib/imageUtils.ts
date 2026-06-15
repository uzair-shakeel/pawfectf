/**
 * Shared image utilities for client-side compression, HEIC conversion, etc.
 */

/**
 * Compress an image File to stay under a target byte size using Canvas.
 * Tries up to 6 quality steps (binary-search style from 0.9 → minQuality).
 * Also downscales the image if it exceeds maxDimension on the longest axis.
 *
 * @param file         - The source File object
 * @param targetBytes  - Maximum output size in bytes (default 1 MB)
 * @param maxDimension - Longest dimension cap in pixels (default 1920)
 * @param minQuality   - Minimum JPEG quality to attempt (default 0.5)
 * @returns            - A compressed File (or the original if already small enough / compression failed)
 */
export async function compressImage(
  file: File,
  targetBytes = 1_000_000, // 1 MB default
  maxDimension = 1920,
  minQuality = 0.5
): Promise<File> {
  try {
    // Skip if already under target
    if (file.size <= targetBytes) return file;

    const bitmap = await createImageBitmap(file);

    // Scale down if needed
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);

    // Step down JPEG quality until we're under target
    let quality = 0.9;
    let blob: Blob | null = null;

    for (let i = 0; i < 6; i++) {
      // eslint-disable-next-line no-await-in-loop
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
      );
      if (!blob) break;
      if (blob.size <= targetBytes || quality <= minQuality) break;
      quality = Math.max(minQuality, quality - 0.1);
    }

    if (blob && blob.size < file.size) {
      return new File(
        [blob],
        file.name.replace(/\.(png|jpg|jpeg|webp|heic|heif)$/i, ".jpg"),
        { type: "image/jpeg", lastModified: Date.now() }
      );
    }

    return file;
  } catch (e) {
    console.warn("[compressImage] Compression failed, using original file:", e);
    return file;
  }
}

/**
 * Convert a HEIC/HEIF file to JPEG using Canvas (or heic2any CDN fallback).
 */
export function isHeicFile(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );
    if (!blob) return file;
    return new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg") || "image.jpg",
      { type: "image/jpeg", lastModified: Date.now() }
    );
  } catch (_) {
    try {
      const anyGlobal: any = globalThis as any;
      if (!anyGlobal.heic2any) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("heic2any failed to load"));
          document.head.appendChild(s);
        });
      }
      if (anyGlobal.heic2any) {
        const result: Blob | Blob[] = await anyGlobal.heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });
        const outBlob = Array.isArray(result) ? result[0] : result;
        if (outBlob) {
          return new File(
            [outBlob],
            file.name.replace(/\.(heic|heif)$/i, ".jpg") || "image.jpg",
            { type: "image/jpeg", lastModified: Date.now() }
          );
        }
      }
    } catch (_) {}
    return file;
  }
}

/**
 * Read a File as a base64 data URL.
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export const optimizeCloudinaryUrl = (url: string, width: number = 800): string => {
  if (!url) return url;
  // Check if it's a Cloudinary URL and hasn't been transformed yet
  if (typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/w_')) {
      return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }
  return url;
};

