"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../../lib/i18n/LanguageContext";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { addPet, analyzePetImage, punctuateSpeechText } from "../../../../services/petService";
import { getUserById } from "../../../../services/userService";
import { useSpeciesBreeds } from "../../../../hooks/useSpeciesBreeds";
import { UploadCloud, X, Plus, Mic, MicOff, Sparkles, Loader2, ScanSearch } from "lucide-react";
import Image from "next/image";

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
    location: { type: "Point", coordinates: [52.2297, 21.0122] as [number, number] }
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [healthInput, setHealthInput] = useState("");
  const [personalityInput, setPersonalityInput] = useState("");

  useEffect(() => {
    if (userId) {
      getUserById(userId, getToken).then(user => {
        if (user?.location) setFormData(prev => ({ ...prev, location: user.location }));
      }).catch(() => { });
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
      setFormData(prev => ({
        ...prev,
        species: result.species || prev.species,
        breed: result.breed || prev.breed,
        gender: result.gender || prev.gender,
        size: result.size || prev.size,
      }));
      setAnalyzeInfo(
        t(
          "dashboard:addPet.analyzeSuccess",
          "AI scanned the photo — species, breed, gender and size were filled in. Check step 2."
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

    setImages(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    if (!analyzedFirstImage.current) {
      analyzedFirstImage.current = true;
      await runImageAnalysis(newFiles[0]);
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
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
      setFormData(prev => ({ ...prev, description: nextDescription }));
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
      setFormData(prev => ({ ...prev, description: nextDescription }));
    };

    recognition.onerror = (event: any) => {
      // Ignore benign auto-stop errors; still finalize if user stopped or we got speech
      const err = event?.error;
      if (err === "aborted") return;
      if (!stopVoiceRequestedRef.current && err === "no-speech") {
        // Keep listening session open if browser fires no-speech mid-way
        return;
      }
      finishVoiceAndPunctuate();
    };

    recognition.onend = () => {
      // Some browsers end recognition mid-session; restart unless user stopped
      if (voiceSessionActiveRef.current && !stopVoiceRequestedRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          /* fall through to finalize */
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

  const addItem = (field: 'healthStatus' | 'personality', value: string, setter: (v: string) => void) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setter("");
    }
  };

  const removeItem = (field: 'healthStatus' | 'personality', index: number) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
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

      images.forEach(file => payload.append("images", file));

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

  const inputClass = "w-full p-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-gray-50 dark:bg-dark-raised focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all";
  const labelClass = "block text-md font-bold text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t("dashboard:addPet.title", "List a Pet for Adoption")}</h1>
        <p className="text-gray-500 mt-2">{t("dashboard:addPet.subtitle", "Provide detailed information to help them find a loving home.")}</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {analyzeInfo && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl flex items-start gap-2">
          <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{analyzeInfo}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-dark-divider shadow-sm">

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex flex-col items-center relative z-10 w-1/3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-md mb-2 transition-colors ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 dark:bg-dark-raised'}`}>
                {s}
              </div>
              <span className={`text-sm font-bold ${step >= s ? 'text-blue-600' : 'text-gray-400'}`}>
                {s === 1 ? t("dashboard:addPet.steps.photos", "Photos") : s === 2 ? t("dashboard:addPet.steps.details", "Details") : t("dashboard:addPet.steps.healthBio", "Health & Bio")}
              </span>
              {s < 3 && <div className={`absolute top-5 left-1/2 w-full h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-100 dark:bg-dark-raised'} -z-10`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Images */}
        {step === 1 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-dark-divider pb-2">
              {t("dashboard:addPet.steps.photos", "Photos")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t(
                "dashboard:addPet.analyzeHint",
                "Upload a clear photo — AI will detect species, breed, gender and size for step 2."
              )}
            </p>

       

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              <label className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-2xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors text-blue-600 dark:text-blue-400 ${analyzing ? "opacity-60 pointer-events-none" : ""}`}>
                {analyzing ? (
                  <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8 mb-2" />
                )}
                <span className="text-sm font-semibold text-center px-2">
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
                  className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-divider group"
                >
                  <Image
                    src={src}
                    alt={`Preview ${i + 1}`}
                    fill
                    className="object-cover"
                  />

                  {analyzing && i === 0 && (
                    <div className="absolute inset-0 z-10 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 text-white">
                      <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-sky-300/50 to-transparent animate-[aiScanY_1.8s_linear_infinite]" />
                      <Sparkles className="w-6 h-6 animate-pulse" />
                      <span className="text-[11px] font-bold tracking-wide uppercase">
                        {t("dashboard:addPet.aiBadge", "AI scan")}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    disabled={analyzing}
                    className="absolute top-2 right-2 z-20 bg-black/60 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition disabled:opacity-40"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <style jsx>{`
              @keyframes aiScan {
                0% { transform: translateX(-120%); }
                100% { transform: translateX(320%); }
              }
              @keyframes aiBar {
                0% { transform: translateX(-120%); }
                100% { transform: translateX(220%); }
              }
              @keyframes aiScanY {
                0% { top: -20%; }
                100% { top: 110%; }
              }
            `}</style>
          </section>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-dark-divider pb-2">{t("dashboard:addPet.basicInfo", "Basic Info")}</h2>
            </div>

            <div>
              <label className={labelClass}>{t("dashboard:addPet.petName", "Pet Name")}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. Max" />
            </div>

            <div>
              <label className={labelClass}>{t("dashboard:addPet.species", "Species")} *</label>
              <select required value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value, breed: "" })} className={inputClass}>
                <option value="">{t("dashboard:addPet.selectSpecies", "Select Species")}</option>
                {getSpecies().map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t("dashboard:addPet.breed", "Breed")} *</label>
              <select required disabled={!formData.species} value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className={inputClass}>
                <option value="">{t("dashboard:addPet.selectBreed", "Select Breed")}</option>
                {getBreedsForSpecies(formData.species).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t("dashboard:addPet.age", "Age")}</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select value={formData.ageYears} onChange={e => setFormData({ ...formData, ageYears: e.target.value })} className={inputClass}>
                    <option value="">—</option>
                    {Array.from({ length: 36 }, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-center text-sm text-gray-500 dark:text-gray-400">{t("dashboard:addPet.years", "Years")}</p>
                </div>
                <div>
                  <select value={formData.ageMonths} onChange={e => setFormData({ ...formData, ageMonths: e.target.value })} className={inputClass}>
                    <option value="">—</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-center text-sm text-gray-500 dark:text-gray-400">{t("dashboard:addPet.months", "Months")}</p>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("dashboard:addPet.gender", "Gender")}</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className={inputClass}>
                <option value="Male">{t("dashboard:addPet.male", "Male")}</option>
                <option value="Female">{t("dashboard:addPet.female", "Female")}</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>{t("dashboard:addPet.size", "Size")}</label>
              <select value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} className={inputClass}>
                <option value="Small">{t("dashboard:addPet.small", "Small")}</option>
                <option value="Medium">{t("dashboard:addPet.medium", "Medium")}</option>
                <option value="Large">{t("dashboard:addPet.large", "Large")}</option>
                <option value="Extra Large">{t("dashboard:addPet.extraLarge", "Extra Large")}</option>
              </select>
            </div>
          </section>
        )}

        {/* Step 3: Health & Personality */}
        {step === 3 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-dark-divider pb-2">{t("dashboard:addPet.healthPersonality", "Health & Personality")}</h2>
            </div>

            <div>
              <label className={labelClass}>{t("dashboard:addPet.healthTags", "Health Tags")}</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={healthInput} onChange={e => setHealthInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('healthStatus', healthInput, setHealthInput))} className={inputClass} placeholder="np. Odrobaczony" />
                <button type="button" onClick={() => addItem('healthStatus', healthInput, setHealthInput)} className="px-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.healthStatus.map((h, i) => (
                  <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-md flex items-center gap-1 border border-green-200">
                    {h} <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('healthStatus', i)} />
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("dashboard:addPet.personalityTags", "Personality Tags")}</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={personalityInput} onChange={e => setPersonalityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('personality', personalityInput, setPersonalityInput))} className={inputClass} placeholder="np. Towarzyski" />
                <button type="button" onClick={() => addItem('personality', personalityInput, setPersonalityInput)} className="px-4 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.personality.map((p, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-md flex items-center gap-1 border border-purple-200">
                    {p} <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('personality', i)} />
                  </span>
                ))}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className={labelClass}>{t("dashboard:addPet.specialNeeds", "Special Needs (Optional)")}</label>
              <textarea value={formData.specialNeeds} onChange={e => setFormData({ ...formData, specialNeeds: e.target.value })} rows={2} className={inputClass} placeholder="Opisz medyczne potrzeby, wymagania itp." />
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-md font-bold text-gray-700 dark:text-gray-300">
                  {t("dashboard:addPet.descriptionBio", "Description / Bio")}
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={fixingVoice}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60 ${
                    listening
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
                  title={t("dashboard:addPet.voiceHint", "Speak to fill the description")}
                >
                  {fixingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
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
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className={`${inputClass} ${listening ? "ring-2 ring-red-400 border-red-300" : ""} pr-12`}
                  placeholder="Opowiedz historie zwierzaka, jaki jest, jakie ma potrzeby...."
                  disabled={fixingVoice}
                />
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={fixingVoice}
                  className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${
                    listening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-200 dark:bg-dark-raised text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700"
                  }`}
                  aria-label={t("dashboard:addPet.voiceInput", "Voice")}
                >
                  {fixingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              {listening && (
                <p className="mt-2 text-sm text-red-600">
                  {t("dashboard:addPet.listeningHelp", "Speak now — your words will be added to the description.")}
                </p>
              )}
              {fixingVoice && (
                <p className="mt-2 text-sm text-blue-600">
                  {t("dashboard:addPet.fixingVoiceHelp", "Adding punctuation to your spoken text...")}
                </p>
              )}
              {!speechSupported && (
                <p className="mt-2 text-sm text-gray-400">
                  {t("dashboard:addPet.voiceUnsupported", "Voice input is not supported in this browser. Try Chrome or Edge.")}
                </p>
              )}
            </div>
          </section>
        )}

        <div className="pt-6 border-t border-gray-100 dark:border-dark-divider flex justify-between items-center">
          {step > 1 ? (
            <button type="button" onClick={(e) => { e.preventDefault(); setStep(step - 1); }} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              {t("dashboard:addPet.back", "Back")}
            </button>
          ) : (
            <button type="button" onClick={(e) => { e.preventDefault(); router.back(); }} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              {t("dashboard:addPet.cancel", "Cancel")}
            </button>
          )}

          {step < 3 ? (
            <button type="button" disabled={analyzing} onClick={(e) => { e.preventDefault(); setStep(step + 1); }} className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50">
              {t("dashboard:addPet.nextStep", "Next Step")}
            </button>
          ) : (
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50">
              {loading ? t("dashboard:addPet.publishing", "Publishing...") : t("dashboard:addPet.publishListing", "Publish Listing")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
