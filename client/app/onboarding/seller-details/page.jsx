"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Camera, Check, ImagePlus, Trash2, User, Upload } from "lucide-react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { getUserById, updateUserCustom } from "../../../services/userService";

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
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Image compression failed"));
              const ext = outputType === "image/jpeg" ? "jpg" : outputType.split("/")[1] || "jpg";
              resolve(
                new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-compressed.${ext}`, {
                  type: outputType,
                  lastModified: Date.now(),
                })
              );
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

const ALL_STEPS = [
  {
    key: "sellerType",
    title: "How will you use Rafraf?",
    subtitle: "Choose the account type that fits you best.",
    required: true,
  },
  {
    key: "image",
    title: "Add a profile photo",
    subtitle: "Help adopters recognize you. You can skip this for now.",
    optional: true,
  },
  {
    key: "firstName",
    title: "What's your first name?",
    subtitle: "This appears on your public profile.",
    required: true,
  },
  {
    key: "lastName",
    title: "And your last name?",
    subtitle: "Used with your first name on listings and messages.",
    required: true,
  },
  {
    key: "companyName",
    title: "Organization name",
    subtitle: "The shelter or rescue name people will see.",
    required: true,
    companyOnly: true,
  },
  {
    key: "phone",
    title: "Your phone number",
    subtitle: "Optional — useful for urgent adoption contact.",
    optional: true,
  },
  {
    key: "description",
    title: "Write a short bio",
    subtitle: "A few lines about you or your shelter.",
    optional: true,
  },
  {
    key: "social",
    title: "Add your social links",
    subtitle: "Optional links so people can learn more about you.",
    optional: true,
  },
];

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-base text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#2563EB] dark:border-dark-divider dark:bg-dark-raised dark:text-white";
const primaryBtn =
  "inline-flex h-12 min-w-[120px] items-center justify-center rounded-xl bg-[#2563EB] px-6 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50";
const secondaryBtn =
  "inline-flex h-12 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-divider dark:bg-dark-raised dark:text-white dark:hover:bg-dark-card";

const SellerDetailsPage = () => {
  const router = useRouter();
  const { userId, getToken, updateUserState } = useAuth();
  const fileInputRef = useRef(null);

  const [sellerType, setSellerType] = useState(null);
  const [stepKey, setStepKey] = useState("sellerType");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    phoneNumbers: [{ phone: "" }],
    description: "",
    socialMedia: { instagram: "", facebook: "", twitter: "", website: "", linkedin: "" },
    image: null,
    brands: [],
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = useMemo(
    () => ALL_STEPS.filter((s) => !s.companyOnly || sellerType === "company"),
    [sellerType]
  );

  const stepIndex = Math.max(0, steps.findIndex((s) => s.key === stepKey));
  const current = steps[stepIndex] || steps[0];
  const isLast = stepIndex >= steps.length - 1;
  const progressPercent = Math.round(((stepIndex + 1) / Math.max(steps.length, 1)) * 100);

  // Keep current step valid when company step appears/disappears
  useEffect(() => {
    if (steps.some((s) => s.key === stepKey)) return;
    const fallback =
      steps.find((s) => s.key === "phone") ||
      steps[steps.length - 1] ||
      ALL_STEPS[0];
    setStepKey(fallback.key);
  }, [steps, stepKey]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!userId) throw new Error("User not authenticated");
        const userData = await getUserById(userId);
        if (userData.sellerType) setSellerType(userData.sellerType);
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
      } catch {
        setError("Failed to load user data");
      }
    };
    if (userId) loadUser();
  }, [userId]);

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

  const applyImageFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const clearImage = () => {
    setPreviewUrl(null);
    setValue("image", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canProceed = () => {
    if (!current) return false;
    if (current.key === "sellerType" && !sellerType) return false;
    if (current.key === "firstName" && !formData.firstName.trim()) return false;
    if (current.key === "lastName" && !formData.lastName.trim()) return false;
    if (current.key === "companyName" && !formData.companyName.trim()) return false;
    return true;
  };

  const goNext = () => {
    if (!canProceed()) return;
    const i = steps.findIndex((s) => s.key === stepKey);
    if (i < steps.length - 1) setStepKey(steps[i + 1].key);
  };

  const goBack = () => {
    const i = steps.findIndex((s) => s.key === stepKey);
    if (i > 0) setStepKey(steps[i - 1].key);
  };

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
      if (formData.image instanceof File) {
        try {
          dataToSend.image = await compressImage(formData.image);
        } catch {
          dataToSend.image = formData.image;
        }
      }
      const updatedUser = await updateUserCustom(dataToSend, getToken);
      if (updatedUser) {
        updateUserState(updatedUser.user);
        router.push("/dashboard/home");
      }
    } catch (err) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const accountOptions = [
    {
      value: "private",
      icon: User,
      title: "Private adopter",
      description: "Ideal for individuals looking to adopt or re-home a pet.",
    },
    {
      value: "company",
      icon: Building2,
      title: "Shelter / Organization",
      description: "For shelters, rescues, and adoption organizations.",
    },
  ];

  return (
    <div className="marketing-ui flex min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <div className="relative hidden overflow-hidden lg:flex lg:w-[42%] xl:w-[45%]">
        <Image src="/auth-bg.png" alt="Rafraf" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-[#0F172A]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-[#0F172A]/20" />
        <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-10">
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo-white.png" alt="Rafraf" width={150} height={40} className="h-10 w-auto" />
          </Link>
          <div className="max-w-lg pb-2">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#93C5FD]">
              Profile setup
            </p>
            <h2 className="font-display text-[2.4rem] font-bold leading-[1.1] text-white xl:text-[3rem]">
              A few quick
              <br />
              steps to get
              <br />
              started
            </h2>
            <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-white/70">
              Tell us who you are so adopters and shelters can connect with confidence.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center overflow-y-auto px-4 py-10 sm:px-8 lg:w-[58%] xl:w-[55%]">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/">
              <Image src="/logo.png" alt="Rafraf" width={140} height={36} className="h-9 w-auto dark:hidden" />
              <Image src="/logo-white.png" alt="Rafraf" width={140} height={36} className="hidden h-9 w-auto dark:block" />
            </Link>
          </div>

          {/* Progress — keyed so it always remounts correctly */}
          <div className="mb-8" key={`progress-${stepKey}-${steps.length}`}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#0F172A] dark:text-white">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <span className="tabular-nums text-[#64748B] dark:text-gray-400">{progressPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-dark-raised">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-[width] duration-400 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div key={stepKey}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
              {current?.optional ? "Optional" : "Required"}
            </p>
            <h1 className="font-display text-[1.85rem] font-bold leading-tight md:text-[2.2rem]">
              {current?.title}
            </h1>
            {current?.subtitle && (
              <p className="mt-2 text-[15px] leading-relaxed text-[#64748B] dark:text-gray-400">
                {current.subtitle}
              </p>
            )}

            <div className="mt-8">
              {current?.key === "sellerType" && (
                <div className="grid gap-3">
                  {accountOptions.map(({ value, icon: Icon, title, description }) => {
                    const active = sellerType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSellerType(value)}
                        className={`flex items-start gap-4 border p-4 text-left transition ${
                          active
                            ? "border-[#2563EB] bg-[#EEF2FF] dark:bg-[#2563EB]/15"
                            : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] dark:border-dark-divider dark:bg-dark-card"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center ${
                            active ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#2563EB] dark:bg-dark-raised"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-3">
                            <span className="font-display text-lg font-bold">{title}</span>
                            {active && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white">
                                <Check className="h-3 w-3" strokeWidth={3} />
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-sm text-[#64748B] dark:text-gray-400">{description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {current?.key === "image" && (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => applyImageFile(e.target.files?.[0])}
                  />

                  {previewUrl ? (
                    <div className="border border-[#E2E8F0] bg-white p-6 dark:border-dark-divider dark:bg-dark-card">
                      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-[#2563EB]/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
                          <p className="font-display text-lg font-bold">Looking good</p>
                          <p className="text-sm text-[#64748B] dark:text-gray-400">
                            This photo will show on your profile and listings.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                            >
                              <ImagePlus className="h-4 w-4" />
                              Change photo
                            </button>
                            <button
                              type="button"
                              onClick={clearImage}
                              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 text-sm font-semibold text-[#64748B] hover:text-red-600 dark:border-dark-divider"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        applyImageFile(e.dataTransfer.files?.[0]);
                      }}
                      className={`group flex w-full flex-col items-center justify-center border-2 border-dashed px-6 py-12 text-center transition ${
                        dragOver
                          ? "border-[#2563EB] bg-[#EEF2FF] dark:bg-[#2563EB]/15"
                          : "border-[#CBD5E1] bg-white hover:border-[#2563EB] hover:bg-[#F8FAFC] dark:border-dark-divider dark:bg-dark-card dark:hover:bg-dark-raised"
                      }`}
                    >
                      <span
                        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full transition ${
                          dragOver
                            ? "bg-[#2563EB] text-white"
                            : "bg-[#EEF2FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white dark:bg-dark-raised"
                        }`}
                      >
                        {dragOver ? <Upload className="h-7 w-7" /> : <Camera className="h-7 w-7" />}
                      </span>
                      <span className="font-display text-xl font-bold text-[#0F172A] dark:text-white">
                        {dragOver ? "Drop photo here" : "Upload a photo"}
                      </span>
                      <span className="mt-2 max-w-xs text-sm leading-relaxed text-[#64748B] dark:text-gray-400">
                        Click to browse, or drag and drop an image here. JPG or PNG, up to 10MB.
                      </span>
                      <span className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white">
                        Choose file
                      </span>
                    </button>
                  )}
                </div>
              )}

              {current?.key === "firstName" && (
                <div>
                  <label className="text-sm font-semibold">First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setValue("firstName", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && goNext()}
                    placeholder="Alex"
                    className={fieldClass}
                    autoFocus
                  />
                </div>
              )}

              {current?.key === "lastName" && (
                <div>
                  <label className="text-sm font-semibold">Last name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setValue("lastName", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && goNext()}
                    placeholder="Smith"
                    className={fieldClass}
                    autoFocus
                  />
                </div>
              )}

              {current?.key === "companyName" && (
                <div>
                  <label className="text-sm font-semibold">Organization name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setValue("companyName", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && goNext()}
                    placeholder="Shelter name"
                    className={fieldClass}
                    autoFocus
                  />
                </div>
              )}

              {current?.key === "phone" && (
                <div>
                  <label className="text-sm font-semibold">Phone number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumbers?.[0]?.phone || ""}
                    onChange={(e) => setValue("phoneNumbers.0", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && goNext()}
                    placeholder="+48 123 456 789"
                    className={fieldClass}
                    autoFocus
                  />
                </div>
              )}

              {current?.key === "description" && (
                <div>
                  <label className="text-sm font-semibold">Bio</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setValue("description", e.target.value)}
                    placeholder="Tell adopters a bit about you or your shelter"
                    rows={4}
                    className={`${fieldClass} resize-none`}
                    autoFocus
                  />
                </div>
              )}

              {current?.key === "social" && (
                <div className="space-y-3.5">
                  {["instagram", "facebook", "website"].map((platform) => (
                    <div key={platform}>
                      <label className="text-sm font-semibold capitalize">{platform}</label>
                      <input
                        type="url"
                        value={formData.socialMedia?.[platform] || ""}
                        onChange={(e) => setValue(`socialMedia.${platform}`, e.target.value)}
                        placeholder={`https://${platform === "website" ? "yoursite.com" : `${platform}.com/...`}`}
                        className={fieldClass}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-3">
            <button type="button" onClick={goBack} disabled={stepIndex === 0} className={secondaryBtn}>
              Back
            </button>
            <div className="flex items-center gap-2">
              {current?.optional && (
                <button
                  type="button"
                  onClick={isLast ? handleSubmit : goNext}
                  className="px-4 text-sm font-semibold text-[#64748B] transition hover:text-[#0F172A] dark:hover:text-white"
                >
                  Skip
                </button>
              )}
              {isLast ? (
                <button type="button" onClick={handleSubmit} disabled={loading} className={primaryBtn}>
                  {loading ? "Saving..." : "Finish"}
                </button>
              ) : (
                <button type="button" onClick={goNext} disabled={!canProceed()} className={primaryBtn}>
                  Next
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
