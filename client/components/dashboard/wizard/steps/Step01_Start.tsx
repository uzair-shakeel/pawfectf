"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Car, Info, Camera, ScanLine, ArrowRight, CheckCircle, Loader2, Shield } from "lucide-react";
import Image from "next/image";
import QuestionCard from "../shared/QuestionCard";
import { compressImage, isHeicFile, convertHeicToJpeg } from "../../../../lib/imageUtils";

interface Step01Props {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
}

export default function Step01_Start({ formData, updateFormData, nextStep }: Step01Props) {
    const [dragActive, setDragActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBlurringPlates, setIsBlurringPlates] = useState(false);
    const [blurError, setBlurError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Toggle blur plates - processes all images in realtime
    const toggleBlurPlates = async () => {
        setBlurError(null);
        const newBlurState = !(formData.blurNumberPlate || false);
        const images = formData.images || [];
        const originalImages = formData.originalImages || [...images];
        const imagePreviews = formData.imagePreviews || [];

        // If turning blur ON and we have images
        if (newBlurState && images.length > 0 && !formData.blurNumberPlate) {
            setIsBlurringPlates(true);
            try {
                const blurredImages: File[] = [];
                const blurredPreviews: string[] = [];

                for (let i = 0; i < images.length; i++) {
                    const file = images[i];
                    // Skip if already blurred
                    if (file.name?.includes("-blurred")) {
                        blurredImages.push(file);
                        blurredPreviews.push(imagePreviews[i]);
                        continue;
                    }

                    // Compress and blur
                    const compressed = await compressForAPI(file, 1000 * 1000, 1920, 0.5);
                    const blurred = await blurSingleImage(compressed);
                    blurredImages.push(blurred);
                    blurredPreviews.push(URL.createObjectURL(blurred));

                    // Revoke old preview URL to prevent memory leak
                    URL.revokeObjectURL(imagePreviews[i]);
                }

                updateFormData({
                    blurNumberPlate: true,
                    originalImages: originalImages, // Store originals
                    images: blurredImages,
                    imagePreviews: blurredPreviews,
                });
            } catch (error: any) {
                console.error("[toggleBlurPlates] Error:", error);
                setBlurError(error.message || "Failed to blur plates. Check console for details.");
                updateFormData({ blurNumberPlate: false });
            } finally {
                setIsBlurringPlates(false);
            }
        }
        // If turning blur OFF - restore originals
        else if (!newBlurState && formData.originalImages?.length > 0) {
            // Revoke blurred preview URLs
            imagePreviews.forEach((url: string) => URL.revokeObjectURL(url));

            // Restore original previews
            const originalPreviews = formData.originalImages.map((file: File) => URL.createObjectURL(file));

            updateFormData({
                blurNumberPlate: false,
                images: [...formData.originalImages],
                imagePreviews: originalPreviews,
            });
        }
        // Just toggle if no images
        else {
            updateFormData({ blurNumberPlate: newBlurState });
        }
    };

    // Compress image for API upload (similar to photo enhancer)
    const compressForAPI = async (file: File, targetBytes = 1000 * 1000, maxDimension = 1920, minQuality = 0.5): Promise<File> => {
        try {
            if (!file || file.size <= targetBytes) return file;
            const bitmap = await createImageBitmap(file);
            const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
            const w = Math.max(1, Math.round(bitmap.width * scale));
            const h = Math.max(1, Math.round(bitmap.height * scale));
            const canvas = document.createElement("canvas");
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return file;
            ctx.drawImage(bitmap, 0, 0, w, h);
            let quality = 0.9; let blob: Blob | null = null;
            for (let i = 0; i < 6; i++) {
                blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), file.type || "image/jpeg", quality));
                if (!blob) break;
                if (blob.size <= targetBytes || quality <= minQuality) break;
                quality -= 0.1;
            }
            if (blob && blob.size < file.size) {
                return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), { type: "image/jpeg", lastModified: Date.now() });
            }
            return file;
        } catch (e) {
            console.warn("Compression failed, sending original file", e);
            return file;
        }
    };

    // Get CSS filter style based on selected preset
    const getFilterStyle = (filterKey: string | undefined): React.CSSProperties => {
        const presets: Record<string, React.CSSProperties> = {
            none: {},
            showroom: {
                filter: "brightness(1.05) contrast(1.15) saturate(1.1)",
            },
            sports: {
                filter: "brightness(1.02) contrast(1.25) saturate(1.15)",
            },
        };
        return presets[filterKey || "none"] || {};
    };

    // Blur a single image using the external API (same as photo-enhancer)
    const blurSingleImage = async (file: File): Promise<File> => {
        const externalUrl = "https://ojest.pl/detect/detect";
        const fd = new FormData();

        // Handle HEIC conversion (same as photo-enhancer)
        let baseFile = file;
        const isHeic = baseFile && (baseFile.type === "image/heic" || baseFile.type === "image/heif" || /\.(heic|heif)$/i.test(baseFile.name));
        if (isHeic) {
            try {
                const bitmap = await createImageBitmap(baseFile);
                const canvas = document.createElement("canvas");
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(bitmap, 0, 0);
                    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9));
                    if (blob) {
                        baseFile = new File([blob], baseFile.name.replace(/\.(heic|heif)$/i, ".jpg") || "image.jpg", { type: "image/jpeg", lastModified: Date.now() });
                    }
                }
            } catch (_) {
                // Fallback: try heic2any
                try {
                    const g = globalThis as any;
                    if (!g.heic2any) {
                        await new Promise((resolve, reject) => {
                            const s = document.createElement("script");
                            s.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
                            s.onload = resolve;
                            s.onerror = () => reject(new Error("heic2any load failed"));
                            document.head.appendChild(s);
                        });
                    }
                    if (g.heic2any) {
                        const res = await g.heic2any({ blob: baseFile, toType: "image/jpeg", quality: 0.9 });
                        const out = Array.isArray(res) ? res[0] : res;
                        if (out) {
                            baseFile = new File([out], baseFile.name.replace(/\.(heic|heif)$/i, ".jpg") || "image.jpg", { type: "image/jpeg", lastModified: Date.now() });
                        }
                    }
                } catch (__) { }
            }
        }

        // Compress before sending
        const optimized = await compressForAPI(baseFile, 1000 * 1000, 1920, 0.5);
        fd.append("file", optimized, optimized.name || "upload.jpg");

        console.log("[blurSingleImage] Sending to:", externalUrl, optimized.name, optimized.size);

        const resp = await fetch(externalUrl, {
            method: "POST",
            mode: "cors",
            headers: { Accept: "application/json" },
            body: fd
        });

        if (!resp.ok) {
            throw new Error(`Blur API HTTP ${resp.status}`);
        }

        const data = await resp.json();

        // Support both response shapes (same as photo-enhancer)
        const base64 = data?.image_base64 || (data?.processed_image?.includes(",") ? data?.processed_image.split(",")[1] : data?.processed_image);
        if (!base64) {
            throw new Error("Blur API returned no image data");
        }

        const imageUrl = (data?.processed_image && data.processed_image.startsWith("data:"))
            ? data.processed_image
            : `data:image/jpeg;base64,${base64}`;

        // Convert base64 to File
        const byteString = atob(imageUrl.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: "image/jpeg" });
        return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp|heic|heif)$/i, "-blurred.jpg"), { type: "image/jpeg" });
    };

    // Handle file selection — compresses every image before storing, optionally blurs plates
    const handleFiles = async (files: FileList | File[]) => {
        const rawFiles = Array.from(files).filter(file =>
            (file.type.startsWith("image/") || isHeicFile(file)) &&
            file.size <= 30 * 1024 * 1024 // 30 MB hard limit
        );

        if (rawFiles.length === 0) return;

        setIsProcessing(true);

        try {
            const processedImages: File[] = [];
            const processedPreviews: string[] = [];
            const currentImages = formData.images || [];
            const currentOriginals = formData.originalImages || [];

            for (const raw of rawFiles) {
                // 1. Convert HEIC → JPEG if needed
                const converted = isHeicFile(raw) ? await convertHeicToJpeg(raw) : raw;
                // 2. Compress to ≤1 MB, max 1920px on the longest side
                let compressed = await compressImage(converted, 1_000_000, 1920, 0.5);

                // 3. Blur number plate if option is enabled
                if (formData.blurNumberPlate) {
                    setIsBlurringPlates(true);
                    compressed = await blurSingleImage(compressed);
                }

                processedImages.push(compressed);
                processedPreviews.push(URL.createObjectURL(compressed));
            }

            // Update both images and originalImages (for blur toggle restore)
            const newImages = [...currentImages, ...processedImages];
            const newOriginals = formData.blurNumberPlate
                ? [...currentOriginals, ...processedImages.map((f, i) => processedImages[i])] // Store blurred as original when blur is on
                : [...currentOriginals, ...processedImages]; // Store originals

            updateFormData({
                images: newImages,
                originalImages: newOriginals,
                imagePreviews: [...(formData.imagePreviews || []), ...processedPreviews],
            });
        } finally {
            setIsProcessing(false);
            setIsBlurringPlates(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...formData.images];
        const newPreviews = [...formData.imagePreviews];

        // Revoke URL to prevent memory leaks
        URL.revokeObjectURL(newPreviews[index]);

        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        updateFormData({
            images: newImages,
            imagePreviews: newPreviews
        });
    };

    const canProceed =
        formData.images?.length > 0 &&
        formData.conditionType;

    return (
        <div className="space-y-6">
            {/* 1. Upload Photos (Required) */}
            <QuestionCard
                title="Let's start with photos"
                subtitle="Upload at least one photo. Use good lighting for better AI detection."
            >
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isProcessing
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 cursor-wait"
                        : dragActive
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                        }`}
                    onDragEnter={(e) => { e.preventDefault(); if (!isProcessing) setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={handleDrop}
                    onClick={() => { if (!isProcessing) inputRef.current?.click(); }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept="image/*,.heic,.heif"
                        className="hidden"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    />

                    <div className="flex flex-col items-center justify-center cursor-pointer">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${isProcessing
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            }`}>
                            {isProcessing
                                ? <Loader2 className="h-8 w-8 animate-spin" />
                                : <Upload className="h-8 w-8" />}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            {isProcessing ? "Compressing images…" : "Click to upload or drag and drop"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isProcessing
                                ? "Please wait while we optimise your photos"
                                : "JPG, PNG, WEBP or HEIC (max 30 MB each)"}
                        </p>
                    </div>
                </div>

                {/* Blur Number Plate Option - Themed Card Style */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Privacy Protection</label>
                    <button
                        onClick={toggleBlurPlates}
                        disabled={isBlurringPlates}
                        className={`relative w-full p-4 rounded-xl border-2 text-left transition-all ${formData.blurNumberPlate
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                    >
                        <div className={`h-5 w-5 rounded-full border-2 absolute top-4 right-4 flex items-center justify-center transition-colors ${formData.blurNumberPlate ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                            }`}>
                            {formData.blurNumberPlate && <div className="h-2 w-2 bg-white rounded-full" />}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${formData.blurNumberPlate ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                                }`}>
                                {isBlurringPlates ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Shield className="h-5 w-5" />
                                )}
                            </div>
                            <div>
                                <h3 className={`font-bold ${formData.blurNumberPlate ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
                                    {isBlurringPlates ? "Blurring Plates..." : (formData.blurNumberPlate ? "Plate Blur Enabled" : "Blur Number Plates")}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {formData.blurNumberPlate
                                        ? "All number plates are hidden using AI detection"
                                        : "Automatically detect and blur all license plates"}
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Error message */}
                {blurError && (
                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                        <strong>Blur Failed:</strong> {blurError}
                    </div>
                )}

                {/* Processing indicator for blur */}
                {isBlurringPlates && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Blurring number plates with AI...</span>
                    </div>
                )}

                {/* Photo Style Presets */}
                {formData.images?.length > 0 && (
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Photo Style</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { key: "none", name: "Natural", desc: "No adjustments" },
                                { key: "showroom", name: "Showroom", desc: "Bright & vivid" },
                                { key: "sports", name: "Sport", desc: "Bold contrast" },
                            ].map((preset) => (
                                <button
                                    key={preset.key}
                                    onClick={() => updateFormData({ photoFilter: preset.key })}
                                    className={`relative p-3 rounded-xl border-2 text-left transition-all ${formData.photoFilter === preset.key || (!formData.photoFilter && preset.key === "none")
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        }`}
                                >
                                    <div className={`h-5 w-5 rounded-full border-2 absolute top-3 right-3 flex items-center justify-center transition-colors ${formData.photoFilter === preset.key || (!formData.photoFilter && preset.key === "none") ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                                        }`}>
                                        {(formData.photoFilter === preset.key || (!formData.photoFilter && preset.key === "none")) && <div className="h-2 w-2 bg-white rounded-full" />}
                                    </div>
                                    <div className={`text-sm font-bold mb-1 ${formData.photoFilter === preset.key || (!formData.photoFilter && preset.key === "none") ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
                                        {preset.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{preset.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Image Previews */}
                {formData.imagePreviews?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <AnimatePresence>
                            {formData.imagePreviews.map((preview: string, idx: number) => (
                                <motion.div
                                    key={preview}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative aspect-[4/3] rounded-lg overflow-hidden group shadow-sm bg-gray-100 dark:bg-gray-800"
                                >
                                    <Image
                                        src={preview}
                                        alt={`Preview ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        style={getFilterStyle(formData.photoFilter)}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-sm"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                    {idx === 0 && (
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur-sm">
                                            Main Photo
                                        </div>
                                    )}
                                    {formData.blurNumberPlate && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600/80 text-white text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur-sm flex items-center gap-1">
                                            <Shield className="h-3 w-3" /> Plate Hidden
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Add More Button (small) */}
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                        >
                            <Camera className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold">Add More</span>
                        </button>
                    </div>
                )}
            </QuestionCard>

            {/* 2. VIN & Basic Info - Only show after photos are uploaded */}
            <AnimatePresence>
                {formData.images?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* VIN Input */}
                        <QuestionCard title="VIN Number" subtitle="Enter VIN for automatic decoding (Recommended)">
                            <div className="relative">
                                <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    value={formData.vin || ""}
                                    onChange={(e) => updateFormData({ vin: e.target.value.toUpperCase() })}
                                    placeholder="Enter 17-character VIN"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase font-mono tracking-wider text-lg"
                                    maxLength={17}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {formData.vin?.length === 17 ? (
                                        <span className="text-green-500 flex items-center gap-1 text-sm font-medium animate-in fade-in slide-in-from-right-2">
                                            <CheckCircle className="h-4 w-4" /> Valid Format
                                        </span>
                                    ) : (
                                        formData.vin?.length > 0 && (
                                            <span className="text-gray-400 text-xs font-mono">
                                                {formData.vin.length}/17
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                <Info className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                                <p>Skip if unavailable. We can likely detect it from your photos later.</p>
                            </div>
                        </QuestionCard>

                        {/* Condition Type */}
                        <QuestionCard title="Condition">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Vehicle Condition</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {["New", "Used", "Nearly-new"].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => updateFormData({ conditionType: type })}
                                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${formData.conditionType === type
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                    }`}
                                            >
                                                <div className={`h-5 w-5 rounded-full border-2 absolute top-4 right-4 flex items-center justify-center transition-colors ${formData.conditionType === type ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                                                    }`}>
                                                    {formData.conditionType === type && <div className="h-2 w-2 bg-white rounded-full" />}
                                                </div>
                                                <Car className={`h-8 w-8 mb-3 transition-colors ${formData.conditionType === type ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
                                                    }`} />
                                                <h3 className="font-bold text-gray-900 dark:text-white">{type}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {type === "New" ? "0 km mileage, never registered" :
                                                        type === "Nearly-new" ? "Low mileage demo/display car" :
                                                            "Has previous owners"}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </QuestionCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Continue Button */}
            {/* Navigation - Static */}
            <div className="mt-8 flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={nextStep}
                    disabled={!canProceed}
                    className={`px-8 py-2.5 rounded-lg font-bold text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg ${canProceed
                        ? "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
                        : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50"
                        }`}
                >
                    Next Step <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            <div className="h-8" /> {/* Spacer */}
        </div>
    );
}
