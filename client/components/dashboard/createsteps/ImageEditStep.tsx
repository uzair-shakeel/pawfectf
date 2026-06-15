"use client";
import { useState, useEffect, useRef } from "react";
import type React from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Wand2, CloudyIcon as Blur, CropIcon, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadImageBatch } from "../../../services/petService"; // Import service
import { useAuth } from "../../../lib/auth/AuthContext";
import pLimit from "p-limit";

// Define limit outside component to avoid recreation
const limit = pLimit(5); // 5 concurrent uploads

interface ImageEditStepProps {
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: any) => void;
  formData: {
    images: (File | string)[]; // Allow both File and URL string
    imagePreviews: string[];
    imageAdjustments?: {
      [key: number]: {
        brightness: number;
        contrast: number;
        saturation: number;
        blur: number;
        grayscale: number;
        sepia: number;
        hueRotate: number;
        exposure: number;
        shadows: number;
        highlights: number;
        vignette: number;
        sharpen: number;
        rotate: number;
        flipX: boolean;
        flipY: boolean;
        clarity: number;
        temperature: number;
        vibrance: number;
        noise: number;
        tint: number;
      };
    };
  };
}

// Compress an image file to stay under a target size using canvas
async function compressImage(
  file: File,
  targetBytes = 1000 * 1000, // 1 MB
  maxDimension = 1920,
  minQuality = 0.5
): Promise<File> {
  try {
    if (file.size <= targetBytes) return file;

    const bitmap = await createImageBitmap(file);
    // Compute scale to limit longest dimension
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);

    // Binary search-like quality reduction
    let quality = 0.9;
    let blob: Blob | null = null;
    // Try a few steps to get under target
    for (let i = 0; i < 6; i++) {
      // eslint-disable-next-line no-await-in-loop
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), file.type || "image/jpeg", quality)
      );
      if (!blob) break;
      if (blob.size <= targetBytes || quality <= minQuality) break;
      quality -= 0.1;
    }
    if (blob && blob.size < file.size) {
      return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }
    return file;
  } catch (e) {
    console.warn("Compression failed, using original file", e);
    return file;
  }
}

function isHeicFile(file: File) {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

async function convertHeicToJpeg(file: File): Promise<File> {
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
        const result: Blob | Blob[] = await anyGlobal.heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        const outBlob = Array.isArray(result) ? result[0] : result;
        if (outBlob) {
          return new File(
            [outBlob],
            file.name.replace(/\.(heic|heif)$/i, ".jpg") || "image.jpg",
            { type: "image/jpeg", lastModified: Date.now() }
          );
        }
      }
    } catch (_) { }
    return file;
  }
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export default function ImageEditStep({
  nextStep,
  prevStep,
  updateFormData,
  formData,
}: ImageEditStepProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState<File | string | null>(null);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("none");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBlurBox, setShowBlurBox] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isBlurringPlate, setIsBlurringPlate] = useState(false);

  // Upload State
  const { getToken } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [uploadedUrls, setUploadedUrls] = useState<{ [key: number]: string }>({});
  const [isUploading, setIsUploading] = useState(false);

  // Effect: Auto-upload images when they are added to formData
  useEffect(() => {
    const uploadImages = async () => {
      if (!formData.images || formData.images.length === 0) return;

      const uploadPromises: Promise<void>[] = [];
      let shouldSetIsUploading = false;

      const results: { [key: number]: string } = {};

      formData.images.forEach((img, index) => {
        // Skip if already a string (URL) or already uploaded in this session
        if (typeof img === "string" || uploadedUrls[index]) {
          return;
        }

        shouldSetIsUploading = true;

        uploadPromises.push(
          limit(async () => {
            // Check again if uploaded (race condition)
            if (uploadedUrls[index]) return;

            // Set progress to 0 to show loading state
            setUploadProgress((prev) => ({ ...prev, [index]: 0 }));

            try {
              const res = await uploadImageBatch(
                [img as File],
                (percent) => {
                  setUploadProgress((prev) => ({ ...prev, [index]: percent }));
                },
                getToken
              );

              if (res.success && res.urls[0]) {
                const url = res.urls[0];
                results[index] = url; // Store in local results object
                setUploadedUrls((prev) => ({ ...prev, [index]: url }));
              } else {
                console.error("Upload failed for index", index, "No URL returned.");
              }
            } catch (err) {
              console.error("Upload failed for index", index, err);
              // Optionally, set progress to -1 or some error state
              setUploadProgress((prev) => ({ ...prev, [index]: -1 }));
            }
          })
        );
      });

      if (shouldSetIsUploading) {
        setIsUploading(true);
        await Promise.all(uploadPromises);
        setIsUploading(false);

        // Sync back to parent after all uploads in this batch are done
        // IMPORTANT: We use the local 'results' object here because 'uploadedUrls' 
        // in this closure is stale and doesn't contain the new values yet!
        const latestImages = [...formData.images];
        let changed = false;

        Object.entries(results).forEach(([idxStr, url]) => {
          const idx = parseInt(idxStr);
          if (latestImages[idx] && typeof latestImages[idx] !== "string") {
            latestImages[idx] = url;
            changed = true;
          }
        });

        if (changed) {
          updateFormData({ ...formData, images: latestImages });
        }
      }
    };

    uploadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.images]); // Trigger when formData.images array itself changes (e.g., new files added)
  // uploadedUrls is managed internally by this effect, so it shouldn't be a dependency.

  // Progress Calculation
  const totalImages = formData.images?.length || 0;
  const uploadedCount = formData.images?.filter(img => typeof img === 'string').length || 0;


  // Image adjustments state
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    exposure: 100,
    shadows: 0,
    highlights: 0,
    vignette: 0,
    sharpen: 0,
    rotate: 0,
    flipX: false,
    flipY: false,
    clarity: 0,
    temperature: 0,
    vibrance: 0,
    noise: 0,
    tint: 0,
  });

  // Upload images directly in this step
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const currentCount = formData.images?.length || 0;
    if (currentCount + selectedFiles.length > 100) {
      alert("You can upload a maximum of 100 images.");
      return;
    }

    // Cast to explicit type safe array or use "as any" if mixed types cause headache with complex legacy code
    // Using (File|string)[] is correct for state, but local logic pushes Files.
    const images: (File | string)[] = [...(formData.images || [])];
    const newPreviews: string[] = [...(formData.imagePreviews || [])];

    const process = async () => {
      for (const f of selectedFiles) {
        // 1. Convert HEIC → JPEG if needed
        const converted = isHeicFile(f) ? await convertHeicToJpeg(f) : f;
        // 2. Compress to ≤1 MB, max 1920px (mirrors Step01 compression)
        const compressed = await compressImage(converted, 1_000_000, 1920, 0.5);
        images.push(compressed);
        try {
          const dataUrl = await fileToDataURL(compressed);
          newPreviews.push(dataUrl);
        } catch (_) {
          newPreviews.push("");
        }
      }
      updateFormData({ ...formData, images, imagePreviews: newPreviews });

      // Select first if it's the first batch
      if (currentCount === 0 && images.length > 0) {
        // We know the new items are Files
        const firstNew = images[0];
        if (firstNew instanceof File) {
          setActiveImage(firstNew);
        }
        setActiveImageIndex(0);
        setPreviewUrl(newPreviews[0]);
      }
      (e.currentTarget as HTMLInputElement).value = "";
    };
    process();
  };

  // Drag & drop reorder state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Helper to reorder arrays immutably
  const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Drag handlers
  const handleThumbDragStart = (index: number) => () => setDraggingIndex(index);
  const handleThumbDragOver = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleThumbDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };
  const handleThumbDrop = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return handleThumbDragEnd();

    // Allow reordering all images freely
    const newImages = reorder(formData.images, draggingIndex, index);
    const newPreviews = reorder(formData.imagePreviews, draggingIndex, index);
    updateFormData({ ...formData, images: newImages, imagePreviews: newPreviews });
    setActiveImageIndex(index);
    handleThumbDragEnd();
  };

  // Load the first image when component mounts (only run once)
  useEffect(() => {
    if (formData.images && formData.images.length > 0 && activeImage === null) {
      setActiveImage(formData.images[0]);
      setActiveImageIndex(0);
      setPreviewUrl(formData.imagePreviews[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load saved adjustments when switching images
  useEffect(() => {
    if (
      formData.imageAdjustments &&
      formData.imageAdjustments[activeImageIndex]
    ) {
      setAdjustments(formData.imageAdjustments[activeImageIndex]);
    } else {
      resetAdjustments();
    }
  }, [activeImageIndex, formData.imageAdjustments]);

  // Handle value change for image adjustments
  const handleAdjustmentChange = (
    property: string,
    value: number | boolean
  ) => {
    setAdjustments((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  // Auto-enhance image - exact same functionality from photo-enhancer.tsx
  const autoEnhance = () => {
    // Apply a predefined set of adjustments that generally improve car photos
    setAdjustments({
      brightness: 105,
      contrast: 115,
      saturation: 110,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      exposure: 102,
      shadows: 10,
      highlights: -5,
      vignette: 15,
      sharpen: 20,
      rotate: adjustments.rotate,
      flipX: adjustments.flipX,
      flipY: adjustments.flipY,
      clarity: 15,
      temperature: 5,
      vibrance: 10,
      noise: 0,
      tint: 0,
    });
  };

  // Reset all adjustments
  const resetAdjustments = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      exposure: 100,
      shadows: 0,
      highlights: 0,
      vignette: 0,
      sharpen: 0,
      rotate: 0,
      flipX: false,
      flipY: false,
      clarity: 0,
      temperature: 0,
      vibrance: 0,
      noise: 0,
      tint: 0,
    });
  };

  // Compute the CSS filter string based on adjustments
  const getFilterStyle = () => {
    // Generate filter string with sharpness simulation
    const filterString = `
      brightness(${adjustments.brightness}%) 
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
      blur(${adjustments.blur}px)
      grayscale(${adjustments.grayscale}%)
      sepia(${adjustments.sepia}%)
      hue-rotate(${adjustments.hueRotate}deg)
      ${adjustments.sharpen > 0
        ? `contrast(${100 + adjustments.sharpen * 0.3}%) brightness(${100 + adjustments.sharpen * 0.1
        }%)`
        : ""
      }
    `;

    return filterString;
  };

  // Helper function to get filter style for a specific image
  const getFilterStyleForImage = (imageIndex: number) => {
    if (!formData.imageAdjustments || !formData.imageAdjustments[imageIndex]) {
      return "none";
    }

    const adj = formData.imageAdjustments[imageIndex];
    const filterString = `
      brightness(${adj.brightness}%) 
      contrast(${adj.contrast}%)
      saturate(${adj.saturation}%)
      blur(${adj.blur}px)
      grayscale(${adj.grayscale}%)
      sepia(${adj.sepia}%)
      hue-rotate(${adj.hueRotate}deg)
      ${adj.sharpen > 0
        ? `contrast(${100 + adj.sharpen * 0.3}%) brightness(${100 + adj.sharpen * 0.1
        }%)`
        : ""
      }
    `;
    return filterString;
  };

  // Select a different image to edit
  const selectImage = (index: number) => {
    if (formData.images[index]) {
      setActiveImage(formData.images[index]);
      setActiveImageIndex(index);
      setPreviewUrl(formData.imagePreviews[index]);
      resetAdjustments();
      setShowCrop(false);
    }
  };

  // Apply crop to the image
  const applyCrop = () => {
    if (!activeImage || !imageRef.current || !completedCrop) return;

    const image = imageRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const fileName = (activeImage instanceof File) ? activeImage.name : `img-${activeImageIndex}.jpg`;
          const fileType = (activeImage instanceof File) ? activeImage.type : (blob.type || "image/jpeg");

          const croppedFile = new File([blob], fileName, {
            type: fileType,
          });

          const newImages = [...formData.images];
          newImages[activeImageIndex] = croppedFile;

          const newPreviewUrl = URL.createObjectURL(blob);
          const newPreviews = [...formData.imagePreviews];
          newPreviews[activeImageIndex] = newPreviewUrl;

          updateFormData({
            images: newImages,
            imagePreviews: newPreviews,
          });

          setActiveImage(croppedFile);
          setPreviewUrl(newPreviewUrl);
          setShowCrop(false);
          setCrop(undefined);
          setCompletedCrop(undefined);
        }
      },
      (activeImage instanceof File ? activeImage.type : "image/jpeg"),
      1.0
    );
  };

  // Call external API directly to blur number plate (no internal /api route)
  const blurNumberPlate = async () => {
    if (!activeImage) {
      alert("Please select an image first");
      return;
    }

    setIsBlurringPlate(true);
    try {
      const externalUrl = "https://ojest.pl/detect/detect";
      const fd = new FormData();

      let baseFile: any = activeImage;
      if (!(activeImage instanceof File)) {
        try {
          // If it's a string URL, fetch it to get a blob/file for processing
          const response = await fetch(activeImage as string);
          const blob = await response.blob();
          baseFile = new File([blob], `img-${activeImageIndex}.jpg`, { type: blob.type || "image/jpeg" });
        } catch (fetchError) {
          console.error("Failed to fetch remote image for blurring:", fetchError);
          alert("Nie można edytować zdjęcia, które zostało już przesłane. Spróbuj edytować lokalne zdjęcie.");
          setIsBlurringPlate(false);
          return;
        }
      }

      const processedBaseFile = isHeicFile(baseFile) ? await convertHeicToJpeg(baseFile) : baseFile;
      const optimized = await compressImage(processedBaseFile, 600 * 1000, 1600, 0.4);
      fd.append("file", optimized as File, (optimized as File).name || "upload.jpg");

      const resp = await fetch(externalUrl, { method: "POST", mode: "cors", headers: { Accept: "application/json" }, body: fd });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      // Support both possible response shapes
      const base64 = data?.image_base64 || (data?.processed_image?.includes(",") ? data?.processed_image.split(",")[1] : data?.processed_image);
      if (!base64) throw new Error("No image returned by detector");

      const imageUrl = (data?.processed_image && data.processed_image.startsWith("data:"))
        ? data.processed_image
        : `data:image/jpeg;base64,${base64}`;

      // Update preview
      setPreviewUrl(imageUrl);

      // Convert base64 to File and update form state
      const byteString = atob(imageUrl.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: "image/jpeg" });
      const file = new File([blob], "blurred-plate.jpg", { type: "image/jpeg" });

      const newImages = [...formData.images];
      newImages[activeImageIndex] = file;
      const newPreviews = [...formData.imagePreviews];
      newPreviews[activeImageIndex] = imageUrl;

      updateFormData({ ...formData, images: newImages, imagePreviews: newPreviews });
      setActiveImage(file);
    } catch (error) {
      console.error("Error blurring number plate (external API):", error);
      alert("Failed to blur number plate. Please try again.");
    } finally {
      setIsBlurringPlate(false);
    }
  };

  // Save the current adjustments to the form data
  const saveAdjustments = () => {
    if (!activeImage) return;

    // Simply update the form data with current adjustments
    // The visual changes are already applied via CSS filters
    const updatedFormData = {
      ...formData,
      imageAdjustments: {
        ...formData.imageAdjustments,
        [activeImageIndex]: adjustments,
      },
    };

    updateFormData(updatedFormData);
    // Show a brief success message or feedback
    console.log("Adjustments saved for image", activeImageIndex + 1);
  };

  // Set an image as the main (first) image
  const setAsMain = (index: number) => {
    if (index === 0) return;

    // Create new arrays
    const newImages = [...formData.images];
    const newPreviews = [...formData.imagePreviews];

    // Handle adjustments reordering
    const currentAdjustments: any[] = [];
    for (let i = 0; i < formData.images.length; i++) {
      currentAdjustments.push(formData.imageAdjustments?.[i] || null);
    }

    // Move items to front
    const [movedImage] = newImages.splice(index, 1);
    newImages.unshift(movedImage);

    const [movedPreview] = newPreviews.splice(index, 1);
    newPreviews.unshift(movedPreview);

    const [movedAdj] = currentAdjustments.splice(index, 1);
    currentAdjustments.unshift(movedAdj);

    // Rebuild adjustments object
    const newAdjustmentsObj: Record<number, any> = {};
    currentAdjustments.forEach((adj, i) => {
      if (adj) newAdjustmentsObj[i] = adj;
    });

    // If the active image was the one moved, we need to find its new index (0)
    // If the active image was something else, its index might have shifted
    // Simplified: Reset active image to null or the new main image (0)
    if (index === activeImageIndex) {
      setActiveImageIndex(0);
    } else if (activeImageIndex < index) {
      // Index increased by 1 for items before the moved item? No.
      // Items before the moved item (0 to index-1) shifted right by 1?
      // Wait. 
      // Start: [0, 1, 2, 3, 4]
      // Move 3 to 0.
      // End: [3, 0, 1, 2, 4]
      // If active was 0, it is now 1.
      // If active was 1, it is now 2.
      // If active was 2, it is now 3.
      // If active was 4 (after), it stays 4.
      setActiveImageIndex(activeImageIndex + 1);
    }

    updateFormData({
      ...formData,
      images: newImages,
      imagePreviews: newPreviews,
      imageAdjustments: newAdjustmentsObj
    });
  };

  // Professional filter presets
  const filterPresets = {
    none: {
      name: "Brak",
      adjustments: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        exposure: 100,
        shadows: 0,
        highlights: 0,
        vignette: 0,
        sharpen: 0,
        clarity: 0,
        temperature: 0,
        vibrance: 0,
        noise: 0,
        tint: 0,
      },
    },
    showroom: {
      name: "Salon Samochodowy",
      adjustments: {
        brightness: 105,
        contrast: 115,
        saturation: 110,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        exposure: 102,
        shadows: 10,
        highlights: -5,
        vignette: 15,
        sharpen: 20,
        clarity: 15,
        temperature: 5,
        vibrance: 10,
        noise: 0,
        tint: 0,
      },
    },
    sportsCar: {
      name: "Auto Sportowe",
      adjustments: {
        brightness: 102,
        contrast: 125,
        saturation: 115,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        exposure: 105,
        shadows: 15,
        highlights: -10,
        vignette: 25,
        sharpen: 30,
        clarity: 25,
        temperature: 10,
        vibrance: 20,
        noise: 0,
        tint: 0,
      },
    },
    vintage: {
      name: "Klasyk",
      adjustments: {
        brightness: 98,
        contrast: 105,
        saturation: 85,
        blur: 0,
        grayscale: 0,
        sepia: 30,
        hueRotate: 10,
        exposure: 98,
        shadows: 15,
        highlights: 5,
        vignette: 35,
        sharpen: 0,
        clarity: -10,
        temperature: 15,
        vibrance: -10,
        noise: 10,
        tint: 10,
      },
    },
    luxury: {
      name: "Luksusowe",
      adjustments: {
        brightness: 102,
        contrast: 110,
        saturation: 95,
        blur: 0,
        grayscale: 15,
        sepia: 5,
        hueRotate: 0,
        exposure: 102,
        shadows: 20,
        highlights: -15,
        vignette: 30,
        sharpen: 15,
        clarity: 20,
        temperature: -5,
        vibrance: 5,
        noise: 0,
        tint: -5,
      },
    },
    dramatic: {
      name: "Dramatyczne",
      adjustments: {
        brightness: 95,
        contrast: 140,
        saturation: 90,
        blur: 0,
        grayscale: 25,
        sepia: 0,
        hueRotate: 0,
        exposure: 95,
        shadows: 35,
        highlights: -25,
        vignette: 45,
        sharpen: 25,
        clarity: 30,
        temperature: -15,
        vibrance: 10,
        noise: 5,
        tint: 0,
      },
    },
    neon: {
      name: "Noc Neonowa",
      adjustments: {
        brightness: 95,
        contrast: 120,
        saturation: 130,
        blur: 1,
        grayscale: 0,
        sepia: 0,
        hueRotate: 220,
        exposure: 105,
        shadows: 25,
        highlights: -15,
        vignette: 40,
        sharpen: 10,
        clarity: 15,
        temperature: -30,
        vibrance: 30,
        noise: 0,
        tint: 25,
      },
    },
    offroad: {
      name: "Off-Road",
      adjustments: {
        brightness: 105,
        contrast: 115,
        saturation: 120,
        blur: 0,
        grayscale: 0,
        sepia: 10,
        hueRotate: 0,
        exposure: 103,
        shadows: 20,
        highlights: -5,
        vignette: 20,
        sharpen: 25,
        clarity: 20,
        temperature: 15,
        vibrance: 15,
        noise: 5,
        tint: 5,
      },
    },
    blackWhite: {
      name: "Czarno Białe",
      adjustments: {
        brightness: 105,
        contrast: 125,
        saturation: 0,
        blur: 0,
        grayscale: 100,
        sepia: 0,
        hueRotate: 0,
        exposure: 105,
        shadows: 15,
        highlights: -15,
        vignette: 25,
        sharpen: 20,
        clarity: 25,
        temperature: 0,
        vibrance: 0,
        noise: 5,
        tint: 0,
      },
    },
    dealershipPro: {
      name: "Dealership Pro",
      adjustments: {
        brightness: 108,
        contrast: 118,
        saturation: 105,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        exposure: 105,
        shadows: 12,
        highlights: -10,
        vignette: 10,
        sharpen: 30,
        clarity: 25,
        temperature: 0,
        vibrance: 15,
        noise: 0,
        tint: 0,
      },
    },
    sunset: {
      name: "Zachód Słońca ",
      adjustments: {
        brightness: 100,
        contrast: 110,
        saturation: 115,
        blur: 0,
        grayscale: 0,
        sepia: 15,
        hueRotate: 10,
        exposure: 100,
        shadows: 15,
        highlights: -10,
        vignette: 25,
        sharpen: 15,
        clarity: 10,
        temperature: 30,
        vibrance: 20,
        noise: 0,
        tint: 15,
      },
    },
  };

  // Apply filter preset
  const applyFilterPreset = (presetKey: string) => {
    const preset = filterPresets[presetKey as keyof typeof filterPresets];
    if (preset) {
      setAdjustments((prev) => ({
        ...prev,
        ...preset.adjustments,
      }));
      setActiveFilter(presetKey);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-dark-main rounded-lg w-full transition-colors">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white">Krok 3: Zdjęcia Pojazdu</h2>
          {isUploading && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
              <span>PRZESYŁANIE...</span>
            </div>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Zarządzaj zdjęciami swojego auta. Pierwsze zdjęcie to zdjęcie główne.
        </p>

        {formData.images.length === 0 ? (
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-dark-card/50">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Załaduj zdjęcia (1-100)</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Dodaj zdjęcia auta tutaj. Możesz je edytować od razu po załadowaniu.</p>
              <label className="inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Wybierz zdjęcia
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Thumbnails */}
            <div className="bg-gray-50 dark:bg-dark-card/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-200 dark:text-white">Dodane zdjęcia</h3>
              <div className="mb-3">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold uppercase tracking-wider">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 5v14m-7-7h14" /></svg>
                  Dodaj zdjęcia
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-3 sm:grid-cols-2 gap-3">
                  {formData.imagePreviews?.map((preview, index) => (
                    <div
                      key={index}
                      className={`relative border-2 rounded-xl overflow-hidden aspect-square w-full cursor-pointer group transition-all ${draggingIndex === index ? "opacity-30" : ""
                        } ${activeImageIndex === index ? "border-blue-500 scale-[0.98] shadow-sm" : "border-transparent hover:border-gray-200"}`}
                      draggable={true}
                      onDragStart={handleThumbDragStart(index)}
                      onDragOver={handleThumbDragOver(index)}
                      onDragEnd={handleThumbDragEnd}
                      onDrop={handleThumbDrop(index)}
                      onClick={() => selectImage(index)}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={{
                          filter: getFilterStyleForImage(index),
                        }}
                      />
                      {index === 0 ? (
                        <span className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20 uppercase tracking-wide">
                          Główne
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAsMain(index);
                          }}
                          className="absolute top-2 left-2 bg-white/90 hover:bg-white text-blue-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Ustaw jako główne
                        </button>
                      )}

                      {/* Upload Progress Overlay */}
                      {(typeof formData.images[index] !== 'string') && (
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-10">
                          {uploadedUrls[index] ? (
                            // Just uploaded but not yet state-updated to string
                            <CheckCircle2 className="text-white w-8 h-8 drop-shadow-lg" />
                          ) : uploadProgress[index] === -1 ? (
                            <div className="flex flex-col items-center">
                              <div className="bg-red-500 rounded-full p-1 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                              </div>
                              <span className="text-white text-[10px] font-bold">Error 404</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-2"></div>
                              <span className="text-white text-[10px] font-medium tracking-wider">{uploadProgress[index] || 0}%</span>
                            </div>
                          )}
                        </div>
                      )}
                      {/* If it is a string (URL), it is uploaded. Show checkmark briefly or just clean view? 
                Let's show a small checkmark in corner to indicate safe.
            */}
                      {/* Success Indicator - only small badge */}
                      {(typeof formData.images[index] === 'string') && (
                        <div className="absolute bottom-1.5 right-1.5 bg-green-500 text-white rounded-full p-1 shadow-lg z-10 ring-2 ring-white">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newImages = formData.images.filter((_, i) => i !== index);
                          const newPreviews = formData.imagePreviews.filter(
                            (_, i) => i !== index
                          );
                          // Also remove adjustments if any
                          const newAdjustments = { ...formData.imageAdjustments };
                          // Shift keys? Complex. Simplification: Just remove key.
                          // Re-indexing keys is hard. Ideally adjustments array matches images array.
                          // But current structure is object with index keys. 
                          // We should probably just reset adjustments or handle re-indexing.
                          // For now, let's just delete the key.
                          if (newAdjustments[index]) delete newAdjustments[index];

                          updateFormData({
                            ...formData,
                            images: newImages,
                            imagePreviews: newPreviews,
                            imageAdjustments: newAdjustments // This is buggy for reordering/deleting but out of scope for upload task
                          });
                          if (index === activeImageIndex) {
                            setActiveImage(null);
                            setPreviewUrl(null);
                          }
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                </div>
              </div>

              {/* Upload Status Footer */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <span>{uploadedCount} z {totalImages} zdjęć przesłanych.</span>
                {isUploading && <span className="text-blue-500 animate-pulse flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div> Przesyłanie...</span>}
              </div>
            </div>

            {/* Image Editor Area */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-dark-main">
                  <h3 className="font-bold text-gray-900 dark:text-gray-200 dark:text-white">Edytor Zdjęć</h3>
                </div>
                <div
                  ref={containerRef}
                  className="relative w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-dark-main flex items-center justify-center mb-4"
                >
                  {activeImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {showCrop ? (
                        <ReactCrop
                          crop={crop}
                          onChange={(c) => setCrop(c)}
                          onComplete={(c) => setCompletedCrop(c)}
                          aspect={undefined}
                          className="max-w-full max-h-full"
                        >
                          <img
                            ref={imageRef}
                            src={
                              previewUrl ||
                              "/placeholder.svg?height=300&width=400"
                            }
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                            style={{ filter: getFilterStyle() }}
                          />
                        </ReactCrop>
                      ) : (
                        <img
                          ref={imageRef}
                          src={
                            previewUrl ||
                            "/placeholder.svg?height=300&width=400"
                          }
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                          style={{ filter: getFilterStyle() }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500">Wybierz zdjęcie do edycji</div>
                  )}
                </div>

                {/* Edit Controls */}
                <div className="space-y-4">
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setShowPresetsModal(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      disabled={!activeImage}
                    >
                      <Wand2 className="w-4 h-4" /> Auto Poprawianie
                    </button>

                    <button
                      onClick={blurNumberPlate}
                      className="flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors"
                      disabled={!activeImage || isBlurringPlate}
                    >
                      <Blur className="w-4 h-4" />
                      {isBlurringPlate ? "Ładowanie..." : "Zamaż Tablice Rejestracyjną"}
                    </button>
                    <button
                      onClick={() => setShowCrop(!showCrop)}
                      className={`flex items-center gap-1 ${showCrop ? "bg-green-600" : "bg-gray-600"
                        } text-white px-3 py-2 rounded-md hover:bg-opacity-90 transition-colors`}
                    >
                      <CropIcon className="w-4 h-4" />{" "}
                      {showCrop ? "Cofnij Przycinanie" : "Przytnij"}
                    </button>
                    {showCrop && completedCrop && (
                      <button
                        onClick={applyCrop}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Zastosuj Przytnięcie
                      </button>
                    )}
                    <button
                      onClick={resetAdjustments}
                      className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Save Adjustments Button */}
                  <button
                    onClick={saveAdjustments}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={!activeImage}
                  >
                    Zapisz zmiany
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={prevStep}
            className="text-gray-500 dark:text-gray-400 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold"
          >
            Wstecz
          </button>
          <button
            onClick={nextStep}
            disabled={isUploading}
            className="bg-blue-600 text-white font-bold px-12 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg dark:shadow-md dark:shadow-blue-900 shadow-blue-200  disabled:bg-blue-400"
          >
            {isUploading ? "Przesyłanie..." : "Następny Krok"}
          </button>
        </div>
      </div>

      {/* Presets Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-main rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white">Filtry i Ulepszenia</h3>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.keys(filterPresets).map((presetKey) => (
                <button
                  key={presetKey}
                  onClick={() => {
                    applyFilterPreset(presetKey);
                    setShowPresetsModal(false);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center group/preset ${activeFilter === presetKey
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/30"
                    : "border-gray-50 dark:border-gray-700/50 bg-white dark:bg-dark-card hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                >
                  <div className="w-full pb-[56.25%] relative mb-3 bg-gray-100 dark:bg-dark-main rounded-xl overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* This would ideally display a thumbnail preview of the effect */}
                      <div className="w-12 h-12 flex items-center justify-center">
                        {presetKey === "none" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                          </svg>
                        ) : (
                          <Wand2 className="w-full h-full text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover/preset:text-blue-600 transition-colors">
                    {
                      filterPresets[presetKey as keyof typeof filterPresets]
                        .name
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
