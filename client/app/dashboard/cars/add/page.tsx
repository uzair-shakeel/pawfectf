"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../../lib/i18n/LanguageContext";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { addPet, analyzePetImage, punctuateSpeechText } from "../../../../services/petService";
import { getUserById } from "../../../../services/userService";
import { useSpeciesBreeds } from "../../../../hooks/useSpeciesBreeds";
import { UploadCloud, X, Plus, Mic, MicOff, Sparkles, Loader2, Camera, ClipboardList, HeartPulse } from "lucide-react";
import Image from "next/image";
import CustomSelect from "../../../../components/website/CustomSelect";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function AddPetPage() {
  const { t, language } = useLanguage() as any;
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const { getSpecies, getBreedsForSpecies } = useSpeciesBreeds();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeInfo, setAnalyzeInfo] = useState("");
  const [listening, setListening] = useState(false);
  const [fixingVoice, setFixingVoice] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const analyzedFirstImage = useRef(false);
  const voiceBaseDescriptionRef = useRef("");
  const voiceSpokenRef = useRef("");
  const voiceSessionActiveRef = useRef(false);
  const descriptionRef = useRef("");
  const stopVoiceRequestedRef = useRef(false);

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    ageYears: "",
    ageMonths: "",
    gender: "Male",
    size: "Medium",
    coatLength: "Short",
    description: "",
    healthStatus: [] as string[],
    personality: [] as string[],
    specialNeeds: "",
    location: { type: "Point", coordinates: [52.2297, 21.0122] as [number, number] },
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [healthInput, setHealthInput] = useState("");
  const [personalityInput, setPersonalityInput] = useState("");

  useEffect(() => {
    if (userId) {
      getUserById(userId, getToken)
        .then((user) => {
          if (user?.location) setFormData((prev) => ({ ...prev, location: user.location }));
        })
        .catch(() => {});
    }
  }, [userId, getToken]);

  useEffect(() => {
    descriptionRef.current = formData.description;
  }, [formData.description]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  const runImageAnalysis = async (file: File) => {
    setAnalyzing(true);
    setAnalyzeInfo("");
    setError("");
    try {
      const result = await analyzePetImage(file, getToken);
      setFormData((prev) => ({
        ...prev,
        species: result.species || prev.species,
        breed: result.breed || prev.breed,
        gender: result.gender || prev.gender,
        size: result.size || prev.size,
      }));
      setAnalyzeInfo(
        t(
          "dashboard:addPet.analyzeSuccess",
          "AI scanned the photo - species, breed, gender and size were filled in. Check step 2."
        )
      );
    } catch (err: any) {
      setAnalyzeInfo("");
      setError(
        err?.message ||
          t("dashboard:addPet.analyzeError", "Could not analyze the photo. You can fill details manually.")
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    if (!newFiles.length) return;

    setImages((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    if (!analyzedFirstImage.current) {
      analyzedFirstImage.current = true;
      await runImageAnalysis(newFiles[0]);
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (images.length <= 1) {
      analyzedFirstImage.current = false;
      setAnalyzeInfo("");
    }
  };

  const speechSupported =
    typeof window !== "undefined" &&
    (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);

  const finishVoiceAndPunctuate = async () => {
    if (!voiceSessionActiveRef.current) return;
    voiceSessionActiveRef.current = false;
    setListening(false);

    const base = voiceBaseDescriptionRef.current || "";
    const spoken = (voiceSpokenRef.current || "").trim();
    voiceSpokenRef.current = "";
    if (!spoken) return;

    setFixingVoice(true);
    try {
      const lang = language === "en" ? "en-US" : "pl-PL";
      const fixed = await punctuateSpeechText(spoken, lang, getToken);
      const nextDescription = base ? `${base.trim()} ${fixed}`.trim() : fixed;
      descriptionRef.current = nextDescription;
      setFormData((prev) => ({ ...prev, description: nextDescription }));
    } finally {
      setFixingVoice(false);
      stopVoiceRequestedRef.current = false;
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError(
        t(
          "dashboard:addPet.voiceUnsupported",
          "Voice input is not supported in this browser. Try Chrome or Edge."
        )
      );
      return;
    }

    if (listening && recognitionRef.current) {
      stopVoiceRequestedRef.current = true;
      recognitionRef.current.stop();
      return;
    }

    if (fixingVoice) return;

    voiceBaseDescriptionRef.current = descriptionRef.current || formData.description || "";
    voiceSpokenRef.current = "";
    voiceSessionActiveRef.current = true;
    stopVoiceRequestedRef.current = false;

    const recognition: SpeechRecognitionLike = new SpeechRecognitionCtor();
    recognition.lang = language === "en" ? "en-US" : "pl-PL";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalChunk += event.results[i][0].transcript;
        }
      }
      finalChunk = finalChunk.trim();
      if (!finalChunk) return;

      voiceSpokenRef.current = `${voiceSpokenRef.current} ${finalChunk}`.trim();
      const base = voiceBaseDescriptionRef.current || "";
      const nextDescription = base
        ? `${base.trim()} ${voiceSpokenRef.current}`.trim()
        : voiceSpokenRef.current;
      descriptionRef.current = nextDescription;
      setFormData((prev) => ({ ...prev, description: nextDescription }));
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      if (err === "aborted") return;
      if (!stopVoiceRequestedRef.current && err === "no-speech") return;
      finishVoiceAndPunctuate();
    };

    recognition.onend = () => {
      if (voiceSessionActiveRef.current && !stopVoiceRequestedRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          /* fall through */
        }
      }
      finishVoiceAndPunctuate();
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch (err: any) {
      voiceSessionActiveRef.current = false;
      setError(err?.message || "Could not start voice input.");
    }
  };

  const addItem = (field: "healthStatus" | "personality", value: string, setter: (v: string) => void) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData((prev) => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setter("");
    }
  };

  const removeItem = (field: "healthStatus" | "personality", index: number) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.species || !formData.breed) {
      setError(t("dashboard:addPet.error", "Species and Breed are required."));
      window.scrollTo(0, 0);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("name", formData.name || `${formData.breed} Mix`);
      payload.append("species", formData.species);
      payload.append("breed", formData.breed);
      const totalMonths = (parseInt(formData.ageYears) || 0) * 12 + (parseInt(formData.ageMonths) || 0);
      payload.append("ageMonths", totalMonths.toString());
      payload.append("gender", formData.gender);
      payload.append("size", formData.size);
      payload.append("coatLength", formData.coatLength);
      payload.append("description", formData.description || `${formData.breed} looking for a loving home`);
      payload.append("location", JSON.stringify(formData.location));
      if (formData.specialNeeds) payload.append("specialNeeds", formData.specialNeeds);
      if (formData.healthStatus.length) payload.append("healthStatus", JSON.stringify(formData.healthStatus));
      if (formData.personality.length) payload.append("personality", JSON.stringify(formData.personality));

      images.forEach((file) => payload.append("images", file));

      payload.append("make", formData.species);
      payload.append("model", formData.breed);
      payload.append("year", new Date().getFullYear().toString());
      payload.append("fuel", "Other");
      payload.append("mileage", "0");
      payload.append("condition", "Used");
      payload.append("title", formData.name || formData.breed);

      await addPet(payload, getToken);
      router.push("/dashboard/cars?success=true");
    } catch (err: any) {
      setError(err?.message || t("dashboard:addPet.error", "Failed to list pet."));
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1.5 h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[15px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] dark:border-[#494952] dark:bg-[#303030] dark:text-[#e2e7e3] dark:placeholder:text-white/40 disabled:opacity-50";
  const labelClass = "text-sm font-semibold text-[#0F172A] dark:text-gray-200";
  const primaryBtn =
    "inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-6 text-sm font-bold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50";
  const ghostBtn =
    "inline-flex h-11 items-center justify-center px-4 text-sm font-semibold text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:hover:bg-dark-raised dark:hover:text-white";

  const steps = [
    {
      label: t("dashboard:addPet.steps.photos", "Photos"),
      short: t("dashboard:addPet.steps.photos", "Photos"),
      Icon: Camera,
    },
    {
      label: t("dashboard:addPet.steps.details", "Details"),
      short: t("dashboard:addPet.steps.details", "Details"),
      Icon: ClipboardList,
    },
    {
      label: t("dashboard:addPet.steps.healthBio", "Health & Bio"),
      short: t("dashboard:addPet.steps.healthShort", "Health"),
      Icon: HeartPulse,
    },
  ];
  const progressPct = ((step - 1) / (steps.length - 1)) * 100;

  const speciesOptions = [
    { value: "", label: t("dashboard:addPet.selectSpecies", "Select Species") },
    ...getSpecies().map((s) => ({ value: s, label: s })),
  ];
  const breedOptions = [
    { value: "", label: t("dashboard:addPet.selectBreed", "Select Breed") },
    ...getBreedsForSpecies(formData.species).map((b) => ({ value: b, label: b })),
  ];
  const yearOptions = [
    { value: "", label: "—" },
    ...Array.from({ length: 36 }, (_, i) => ({ value: String(i), label: String(i) })),
  ];
  const monthOptions = [
    { value: "", label: "—" },
    ...Array.from({ length: 12 }, (_, i) => ({ value: String(i), label: String(i) })),
  ];
  const genderOptions = [
    { value: "Male", label: t("dashboard:addPet.male", "Male") },
    { value: "Female", label: t("dashboard:addPet.female", "Female") },
  ];
  const sizeOptions = [
    { value: "Small", label: t("dashboard:addPet.small", "Small") },
    { value: "Medium", label: t("dashboard:addPet.medium", "Medium") },
    { value: "Large", label: t("dashboard:addPet.large", "Large") },
    { value: "Extra Large", label: t("dashboard:addPet.extraLarge", "Extra Large") },
  ];

  return (
    <div className="marketing-ui relative min-h-full">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.18),_transparent_50%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-3xl p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white md:text-[1.85rem]">
            {t("dashboard:addPet.title", "List a Pet for Adoption")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#64748B] dark:text-gray-400">
            {t(
              "dashboard:addPet.subtitle",
              "Provide detailed information to help them find a loving home."
            )}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card"
        >
          {/* Progress + steps */}
          <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-5 dark:border-dark-divider dark:bg-white/[0.04] sm:px-7 sm:py-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
                {t("dashboard:addPet.step", "Step")} {step}/{steps.length}
                <span className="ml-1.5 font-medium text-[#64748B] dark:text-gray-400">
                  · {steps[step - 1]?.label}
                </span>
              </p>
              <span className="text-xs font-bold tabular-nums text-[#2563EB]">
                {Math.round((step / steps.length) * 100)}%
              </span>
            </div>

            <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-[#303030]">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out"
                style={{ width: `${Math.max(progressPct, step === 1 ? 8 : progressPct)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {steps.map(({ label, short, Icon }, i) => {
                const s = i + 1;
                const done = step > s;
                const current = step === s;
                return (
                  <div
                    key={label}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition sm:flex-row sm:justify-center sm:gap-2.5 sm:px-3 ${
                      current
                        ? "border-[#2563EB] bg-[#EEF2FF] dark:bg-[#2563EB]/15"
                        : done
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/30"
                          : "border-[#E2E8F0] bg-white dark:border-[#303030] dark:bg-[#242424]"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        current
                          ? "bg-[#2563EB] text-white"
                          : done
                            ? "bg-emerald-500 text-white"
                            : "bg-[#F1F5F9] text-[#94A3B8] dark:bg-[#303030] dark:text-gray-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <span
                      className={`text-center text-[11px] font-bold leading-tight sm:text-left sm:text-xs ${
                        current
                          ? "text-[#2563EB]"
                          : done
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-[#94A3B8]"
                      }`}
                    >
                      <span className="sm:hidden">{short}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 px-4 py-6 sm:px-7 sm:py-7">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            {analyzeInfo && (
              <div className="flex items-start gap-3 rounded-xl border border-[#2563EB]/25 bg-[#EEF2FF] px-4 py-3.5 text-sm text-[#1E40AF] dark:border-[#2563EB]/30 dark:bg-[#2563EB]/15 dark:text-blue-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/15">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="pt-1 leading-relaxed">{analyzeInfo}</span>
              </div>
            )}

            {step === 1 && (
              <section>
                <div className="mb-5">
                  <h2 className="font-display text-lg font-bold text-[#0F172A] dark:text-white">
                    {t("dashboard:addPet.photoTitle", "Pet photos")}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#64748B] dark:text-gray-400">
                    {t(
                      "dashboard:addPet.analyzeHint",
                      "Upload a clear photo - AI will detect species, breed, gender and size for step 2."
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  <label
                    className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#2563EB]/45 bg-gradient-to-b from-[#EEF2FF] to-white text-[#2563EB] transition hover:border-[#2563EB] hover:from-[#DBEAFE] dark:from-[#2563EB]/15 dark:to-[#2563EB]/5 ${
                      analyzing ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {analyzing ? (
                      <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                    ) : (
                      <UploadCloud className="mb-2 h-8 w-8" />
                    )}
                    <span className="px-2 text-center text-sm font-bold">
                      {analyzing
                        ? t("dashboard:addPet.analyzing", "AI scanning...")
                        : t("dashboard:addPet.addPhoto", "Add Photo")}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={analyzing}
                    />
                  </label>

                  {previews.map((src, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-dark-divider"
                    >
                      <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" />
                      {analyzing && i === 0 && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/45 text-white backdrop-blur-[1px]">
                          <div className="absolute inset-x-0 h-10 animate-[aiScanY_1.8s_linear_infinite] bg-gradient-to-b from-transparent via-sky-300/50 to-transparent" />
                          <Sparkles className="h-6 w-6 animate-pulse" />
                          <span className="text-[11px] font-bold uppercase tracking-wide">
                            {t("dashboard:addPet.aiBadge", "AI scan")}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        disabled={analyzing}
                        className="absolute right-2 top-2 z-20 rounded-lg bg-[#0F172A]/75 p-1.5 text-white transition disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <style jsx>{`
                  @keyframes aiScanY {
                    0% {
                      top: -20%;
                    }
                    100% {
                      top: 110%;
                    }
                  }
                `}</style>
              </section>
            )}

            {step === 2 && (
              <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <h2 className="font-display text-lg font-bold text-[#0F172A] dark:text-white">
                    {t("dashboard:addPet.basicInfo", "Basic Info")}
                  </h2>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
                    {t(
                      "dashboard:addPet.basicInfoHint",
                      "Name, species and other details for the listing."
                    )}
                  </p>
                </div>

                <div>
                  <label className={labelClass}>{t("dashboard:addPet.petName", "Pet Name")}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Max"
                  />
                </div>

                <div>
                  <label className={labelClass}>{t("dashboard:addPet.species", "Species")} *</label>
                  <div className="mt-1.5">
                    <CustomSelect
                      variant="filter"
                      tone="light"
                      value={formData.species}
                      onChange={(v) => setFormData({ ...formData, species: v, breed: "" })}
                      options={speciesOptions}
                      ariaLabel={t("dashboard:addPet.species", "Species")}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t("dashboard:addPet.breed", "Breed")} *</label>
                  <div className="mt-1.5">
                    <CustomSelect
                      variant="filter"
                      tone="light"
                      value={formData.breed}
                      onChange={(v) => setFormData({ ...formData, breed: v })}
                      options={breedOptions}
                      disabled={!formData.species}
                      ariaLabel={t("dashboard:addPet.breed", "Breed")}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t("dashboard:addPet.age", "Age")}</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-3">
                    <div>
                      <CustomSelect
                        variant="filter"
                        tone="light"
                        value={formData.ageYears}
                        onChange={(v) => setFormData({ ...formData, ageYears: v })}
                        options={yearOptions}
                        ariaLabel={t("dashboard:addPet.years", "Years")}
                      />
                      <p className="mt-1.5 text-center text-sm text-[#64748B]">
                        {t("dashboard:addPet.years", "Years")}
                      </p>
                    </div>
                    <div>
                      <CustomSelect
                        variant="filter"
                        tone="light"
                        value={formData.ageMonths}
                        onChange={(v) => setFormData({ ...formData, ageMonths: v })}
                        options={monthOptions}
                        ariaLabel={t("dashboard:addPet.months", "Months")}
                      />
                      <p className="mt-1.5 text-center text-sm text-[#64748B]">
                        {t("dashboard:addPet.months", "Months")}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t("dashboard:addPet.gender", "Gender")}</label>
                  <div className="mt-1.5">
                    <CustomSelect
                      variant="filter"
                      tone="light"
                      value={formData.gender}
                      onChange={(v) => setFormData({ ...formData, gender: v })}
                      options={genderOptions}
                      ariaLabel={t("dashboard:addPet.gender", "Gender")}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t("dashboard:addPet.size", "Size")}</label>
                  <div className="mt-1.5">
                    <CustomSelect
                      variant="filter"
                      tone="light"
                      value={formData.size}
                      onChange={(v) => setFormData({ ...formData, size: v })}
                      options={sizeOptions}
                      ariaLabel={t("dashboard:addPet.size", "Size")}
                    />
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <h2 className="font-display text-lg font-bold text-[#0F172A] dark:text-white">
                    {t("dashboard:addPet.healthPersonality", "Health & Personality")}
                  </h2>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
                    {t(
                      "dashboard:addPet.healthHint",
                      "Tags and a short bio help adopters connect."
                    )}
                  </p>
                </div>

                <div>
                  <label className={labelClass}>{t("dashboard:addPet.healthTags", "Health Tags")}</label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="text"
                      value={healthInput}
                      onChange={(e) => setHealthInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addItem("healthStatus", healthInput, setHealthInput))
                      }
                      className={inputClass.replace("mt-1.5 ", "")}
                      placeholder="np. Odrobaczony"
                    />
                    <button
                      type="button"
                      onClick={() => addItem("healthStatus", healthInput, setHealthInput)}
                      className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.healthStatus.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                      >
                        {h}
                        <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => removeItem("healthStatus", i)} />
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t("dashboard:addPet.personalityTags", "Personality Tags")}</label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="text"
                      value={personalityInput}
                      onChange={(e) => setPersonalityInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addItem("personality", personalityInput, setPersonalityInput))
                      }
                      className={inputClass.replace("mt-1.5 ", "")}
                      placeholder="np. Towarzyski"
                    />
                    <button
                      type="button"
                      onClick={() => addItem("personality", personalityInput, setPersonalityInput)}
                      className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.personality.map((p, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300"
                      >
                        {p}
                        <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => removeItem("personality", i)} />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    {t("dashboard:addPet.specialNeeds", "Special Needs (Optional)")}
                  </label>
                  <textarea
                    value={formData.specialNeeds}
                    onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                    rows={2}
                    className={`${inputClass} !h-auto min-h-[80px] resize-none py-3`}
                    placeholder="Opisz medyczne potrzeby, wymagania itp."
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className={labelClass}>
                      {t("dashboard:addPet.descriptionBio", "Description / Bio")}
                    </label>
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      disabled={fixingVoice}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-60 ${
                        listening
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-[#EEF2FF] text-[#2563EB] hover:bg-[#DBEAFE] dark:bg-[#2563EB]/20 dark:text-blue-300"
                      }`}
                      title={t("dashboard:addPet.voiceHint", "Speak to fill the description")}
                    >
                      {fixingVoice ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : listening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                      {listening
                        ? t("dashboard:addPet.listening", "Listening...")
                        : fixingVoice
                          ? t("dashboard:addPet.fixingVoice", "Fixing text...")
                          : t("dashboard:addPet.voiceInput", "Voice")}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                      className={`${inputClass} !h-auto min-h-[140px] resize-none py-3 pr-12 ${
                        listening ? "border-red-300 ring-2 ring-red-300" : ""
                      }`}
                      placeholder="Opowiedz historie zwierzaka, jaki jest, jakie ma potrzeby...."
                      disabled={fixingVoice}
                    />
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      disabled={fixingVoice}
                      className={`absolute bottom-3 right-3 rounded-lg p-2 transition ${
                        listening
                          ? "animate-pulse bg-red-500 text-white"
                          : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#EEF2FF] hover:text-[#2563EB] dark:bg-dark-raised dark:text-gray-300"
                      }`}
                      aria-label={t("dashboard:addPet.voiceInput", "Voice")}
                    >
                      {fixingVoice ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : listening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {listening && (
                    <p className="mt-2 text-sm text-red-600">
                      {t(
                        "dashboard:addPet.listeningHelp",
                        "Speak now - your words will be added to the description."
                      )}
                    </p>
                  )}
                  {fixingVoice && (
                    <p className="mt-2 text-sm text-[#2563EB]">
                      {t(
                        "dashboard:addPet.fixingVoiceHelp",
                        "Adding punctuation to your spoken text..."
                      )}
                    </p>
                  )}
                  {!speechSupported && (
                    <p className="mt-2 text-sm text-[#94A3B8]">
                      {t(
                        "dashboard:addPet.voiceUnsupported",
                        "Voice input is not supported in this browser. Try Chrome or Edge."
                      )}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 dark:border-dark-divider dark:bg-white/[0.04] sm:px-7">
            {step > 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setStep(step - 1);
                }}
                className={ghostBtn}
              >
                {t("dashboard:addPet.back", "Back")}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  router.back();
                }}
                className={ghostBtn}
              >
                {t("dashboard:addPet.cancel", "Cancel")}
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={analyzing}
                onClick={(e) => {
                  e.preventDefault();
                  setStep(step + 1);
                }}
                className={primaryBtn}
              >
                {t("dashboard:addPet.nextStep", "Next Step")}
              </button>
            ) : (
              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading
                  ? t("dashboard:addPet.publishing", "Publishing...")
                  : t("dashboard:addPet.publishListing", "Publish Listing")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
