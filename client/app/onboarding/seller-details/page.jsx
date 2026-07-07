"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth/AuthContext";
import { getUserById, updateUserCustom } from "../../../services/userService";

// Simple client-side image compression using Canvas
// Converts any image to a resized JPEG to reduce payload size before upload
const compressImage = (file, {
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.7,
  outputType = "image/jpeg",
} = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Maintain aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Image compression failed"));
              const ext = outputType === "image/jpeg" ? "jpg" : outputType.split("/")[1] || "jpg";
              const compressedFile = new File(
                [blob],
                `${file.name.replace(/\.[^.]+$/, "")}-compressed.${ext}`,
                { type: outputType, lastModified: Date.now() }
              );
              resolve(compressedFile);
            },
            outputType,
            quality
          );
        };
        img.onerror = () => reject(new Error("Failed to load image for compression"));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file for compression"));
      reader.readAsDataURL(file);
    } catch (err) {
      reject(err);
    }
  });
};

const SellerDetailsPage = () => {
  const router = useRouter();
  const { userId, getToken, updateUserState } = useAuth();

  const [sellerType, setSellerType] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    phoneNumbers: [{ phone: "" }],
    description: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: "",
      website: "",
      linkedin: "",
    },
    image: null,
    brands: [],
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Fetch user data on page load
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!userId) throw new Error("User not authenticated");
        const userData = await getUserById(userId);
        setSellerType(userData.sellerType || null);
        setFormData((prev) => ({
          ...prev,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          companyName: userData.companyName || "",
          phoneNumbers: userData.phoneNumbers?.length
            ? userData.phoneNumbers.map((p) => ({ phone: p }))
            : [{ phone: "" }],
          description: userData.description || "",
          socialMedia: userData.socialMedia || prev.socialMedia,
          image: null,
        }));
        if (userData.image || userData.profilePicture) {
          setPreviewUrl(userData.image || userData.profilePicture);
        }
      } catch (err) {
        setError("Failed to load user data");
      }
    };

    if (userId) loadUser();
  }, [userId]);

  // Steps definition including seller type first
  const steps = useMemo(() => {
    const base = [
      {
        key: "sellerType",
        title: "Are you a private adopter or a shelter/rescue organization?",
        required: true,
      },
      { key: "image", title: "Upload a profile picture", optional: true },
      { key: "firstName", title: "What's your first name?", required: true },
      { key: "lastName", title: "And your last name?", required: true },
      sellerType === "company"
        ? { key: "companyName", title: "Organization or shelter name", required: true }
        : null,
      // sellerType === "company"
      //   ? { key: "brands", title: "Select animal types you specialize in", optional: true }
      //   : null,
      { key: "phone", title: "Your phone number", optional: true },
      { key: "description", title: "Write a short bio", optional: true },
      { key: "social", title: "Add your social links", optional: true },
    ].filter(Boolean);
    return base;
  }, [sellerType]);

  const current = steps[stepIndex];
  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100);

  const setValue = (path, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      if (path.startsWith("socialMedia.")) {
        const k = path.split(".")[1];
        next.socialMedia = { ...prev.socialMedia, [k]: value };
      } else if (path.startsWith("phoneNumbers.")) {
        const idx = parseInt(path.split(".")[1], 10);
        const list = [...prev.phoneNumbers];
        list[idx] = { phone: value };
        next.phoneNumbers = list;
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const canProceed = () => {
    if (!current) return false;
    if (current.key === "sellerType" && !sellerType) return false;
    if (current.key === "firstName" && !formData.firstName.trim()) return false;
    if (current.key === "lastName" && !formData.lastName.trim()) return false;
    if (current.key === "companyName" && !formData.companyName.trim())
      return false;
    return true;
  };

  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));
  const skip = () => next();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        sellerType,
        phoneNumbers: formData.phoneNumbers
          .map((p) => (typeof p === "string" ? p : p.phone))
          .filter(Boolean),
      };

      // Compress profile image (if any) before sending to API
      if (formData.image instanceof File) {
        try {
          const compressed = await compressImage(formData.image, {
            maxWidth: 1000,
            maxHeight: 1000,
            quality: 0.7,
            outputType: "image/jpeg",
          });
          dataToSend.image = compressed;
        } catch (compressionErr) {
          // If compression fails, fall back to original file
          console.warn("Image compression failed, using original file:", compressionErr);
          dataToSend.image = formData.image;
        }
      }

      const updatedUser = await updateUserCustom(dataToSend, getToken);
      if (updatedUser) {
        // Update the AuthContext with the new user data
        updateUserState(updatedUser.user);
        router.push("/dashboard/home");
      }
    } catch (err) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  // Always render; sellerType will be selected on step 1

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage: "url('/721.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-2xl ">
        <div className="bg-white/80 dark:bg-dark-main backdrop-blur-sm  rounded-2xl shadow ring-1 ring-black/5 p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-800 mb-2 transition-colors duration-300">
              <span>
                Step {stepIndex + 1} of {steps.length}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 dark:text-white  mb-4 text-center transition-colors duration-300">
            {current?.title}
          </h2>
          {current?.key === "sellerType" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Private seller */}
              <button
                type="button"
                onClick={() => setSellerType("private")}
                className={`p-4 rounded-xl border text-left transition
      ${sellerType === "private"
                    ? "border-blue-500 ring-1 ring-blue-500/30 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  }`}
              >
                <div
                  className={`font-medium transition-colors
        ${sellerType === "private"
                      ? "text-gray-900 dark:text-gray-200 dark:text-white"
                      : "text-gray-900 dark:text-gray-200 dark:text-gray-200"
                    }`}
                >
                  Private adopter
                </div>
                <div
                  className={`text-xs mt-1 transition-colors
        ${sellerType === "private"
                      ? "text-gray-600 dark:text-gray-300"
                      : "text-gray-600 dark:text-gray-400"
                    }`}
                >
                  Ideal for individuals looking to adopt a pet
                </div>
              </button>

              {/* Company */}
              <button
                type="button"
                onClick={() => setSellerType("company")}
                className={`p-4 rounded-xl border text-left transition
      ${sellerType === "company"
                    ? "border-blue-500 ring-1 ring-blue-500/30 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  }`}
              >
                <div
                  className={`font-medium transition-colors
        ${sellerType === "company"
                      ? "text-gray-900 dark:text-gray-200 dark:text-white"
                      : "text-gray-900 dark:text-gray-200 dark:text-gray-200"
                    }`}
                >
                  Shelter / Organization
                </div>
                <div
                  className={`text-xs mt-1 transition-colors
        ${sellerType === "company"
                      ? "text-gray-600 dark:text-gray-300"
                      : "text-gray-600 dark:text-gray-400"
                    }`}
                >
                  Great for shelters, rescues, and pet adoption organizations
                </div>
              </button>
            </div>

          )}

          {/* Field by step */}
          {current?.key === "image" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 ring-1 ring-black/5 overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No photo
                    </div>
                  )}
                </div>
                <label className="px-3 py-2 rounded-md bg-gray-900 text-white text-sm cursor-pointer">
                  Choose file
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setValue("image", null);
                    }}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white transition-colors duration-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500  transition-colors duration-300">
                You can skip this and add a photo later.
              </p>
            </div>
          )}

          {current?.key === "firstName" && (
            <div>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setValue("firstName", e.target.value)}
                placeholder="Your first name"
                className="w-full border border-gray-300 rounded-md py-2 px-3 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {current?.key === "lastName" && (
            <div>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setValue("lastName", e.target.value)}
                placeholder="Your last name"
                className="w-full border border-gray-300 dark:bg-gray-900 dark:text-white rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {current?.key === "companyName" && (
            <div>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setValue("companyName", e.target.value)}
                placeholder="Company name"
                className="w-full border border-gray-300 dark:bg-gray-900 dark:text-white rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}



          {current?.key === "phone" && (
            <div>
              <input
                type="tel"
                value={formData.phoneNumbers?.[0]?.phone || ""}
                onChange={(e) => setValue("phoneNumbers.0", e.target.value)}
                placeholder="Phone number"
                className="w-full dark:bg-gray-900 dark:text-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2 transition-colors duration-300">
                Optional. You can add more later in your profile.
              </p>
            </div>
          )}

          {current?.key === "description" && (
            <div>
              <textarea
                value={formData.description}
                onChange={(e) => setValue("description", e.target.value)}
                placeholder="Tell adopters a bit about you or your shelter"
                rows={4}
                className="w-full dark:bg-gray-900 dark:text-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {current?.key === "social" && (
            <div className="grid gap-3">
              {["instagram", "facebook", "website"].map((platform) => (
                <input
                  key={platform}
                  type="url"
                  value={formData.socialMedia?.[platform] || ""}
                  onChange={(e) =>
                    setValue(`socialMedia.${platform}`, e.target.value)
                  }
                  placeholder={`${platform} link`}
                  className="w-full dark:bg-gray-900 dark:text-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={stepIndex === 0}
              className={`px-4 py-2 rounded-md border text-black dark:text-white transition-colors duration-300 ${stepIndex === 0
                ? "opacity-40 cursor-not-allowed text-black"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              Back
            </button>

            <div className="flex items-center gap-2">
              {current?.optional && current.key !== "sellerType" && (
                <button
                  type="button"
                  onClick={skip}
                  className="px-4 py-2 rounded-md text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  Skip
                </button>
              )}

              {stepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={!canProceed()}
                  className={`px-6 py-2 rounded-md ${canProceed()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  {loading ? "Saving..." : "Finish"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetailsPage;
