"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { addPet } from "../../../../services/petService";
import { getUserById } from "../../../../services/userService";
import { useSpeciesBreeds } from "../../../../hooks/useSpeciesBreeds";
import { UploadCloud, X, Plus } from "lucide-react";
import Image from "next/image";

export default function AddPetPage() {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const { getSpecies, getBreedsForSpecies } = useSpeciesBreeds();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    ageMonths: "",
    gender: "Male",
    size: "Medium",
    color: "",
    coatLength: "Short",
    // adoptionFee: "",
    description: "",
    healthStatus: [],
    personality: [],
    specialNeeds: "",
    location: { type: "Point", coordinates: [52.2297, 21.0122] }
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
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
      setError("Species and Breed are required.");
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
      payload.append("ageMonths", formData.ageMonths || "0");
      payload.append("gender", formData.gender);
      payload.append("size", formData.size);
      if (formData.color) payload.append("color", formData.color);
      payload.append("coatLength", formData.coatLength);
      // payload.append("adoptionFee", formData.adoptionFee || "0");
      payload.append("description", formData.description);
      payload.append("location", JSON.stringify(formData.location));
      if (formData.specialNeeds) payload.append("specialNeeds", formData.specialNeeds);
      if (formData.healthStatus.length) payload.append("healthStatus", JSON.stringify(formData.healthStatus));
      if (formData.personality.length) payload.append("personality", JSON.stringify(formData.personality));

      images.forEach(file => payload.append("images", file));

      // Required dummy fields for backend compatibility until backend is fully pet-migrated
      payload.append("make", formData.species);
      payload.append("model", formData.breed);
      payload.append("year", new Date().getFullYear().toString());
      payload.append("fuel", "Other");
      payload.append("mileage", "0");
      payload.append("condition", "Used");
      payload.append("title", formData.name || formData.breed);
      // payload.append("financialInfo", JSON.stringify({ priceNetto: Number(formData.adoptionFee || 0), currency: "PLN" }));

      await addPet(payload, getToken);
      router.push("/dashboard/cars?success=true");
    } catch (err: any) {
      setError(err?.message || "Failed to list pet.");
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-gray-50 dark:bg-dark-raised focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all";
  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">List a Pet for Adoption</h1>
        <p className="text-gray-500 mt-2">Provide detailed information to help them find a loving home.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-dark-card p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-dark-divider shadow-sm">

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex flex-col items-center relative z-10 w-1/3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 dark:bg-dark-raised'}`}>
                {s}
              </div>
              <span className={`text-xs font-bold ${step >= s ? 'text-blue-600' : 'text-gray-400'}`}>
                {s === 1 ? 'Photos' : s === 2 ? 'Details' : 'Health & Bio'}
              </span>
              {s < 3 && <div className={`absolute top-5 left-1/2 w-full h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-100 dark:bg-dark-raised'} -z-10`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Images */}
        {step === 1 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-dark-divider pb-2">Photos</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              <label className="flex-shrink-0 w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-2xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors text-blue-600 dark:text-blue-400">
                <UploadCloud className="w-8 h-8 mb-2" />
                <span className="text-xs font-bold">Add Photo</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {previews.map((src, i) => (
                <div key={i} className="flex-shrink-0 w-32 h-32 relative rounded-2xl overflow-hidden border border-gray-200 group">
                  <Image src={src} alt="Preview" fill className="object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-dark-divider pb-2">Basic Info</h2>
            </div>

            <div>
              <label className={labelClass}>Pet Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. Max" />
            </div>

            <div>
              <label className={labelClass}>Species *</label>
              <select required value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value, breed: "" })} className={inputClass}>
                <option value="">Select Species</option>
                {getSpecies().map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Breed *</label>
              <select required disabled={!formData.species} value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className={inputClass}>
                <option value="">Select Breed</option>
                {getBreedsForSpecies(formData.species).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Age (Months)</label>
              <input type="number" min="0" value={formData.ageMonths} onChange={e => setFormData({ ...formData, ageMonths: e.target.value })} className={inputClass} placeholder="e.g. 24" />
            </div>

            <div>
              <label className={labelClass}>Gender</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className={inputClass}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Size</label>
              <select value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} className={inputClass}>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Extra Large">Extra Large</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Color</label>
              <input type="text" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className={inputClass} placeholder="e.g. Golden" />
            </div>

            {/* <div>
            <label className={labelClass}>Adoption Fee (PLN)</label>
            <input type="number" min="0" value={formData.adoptionFee} onChange={e => setFormData({...formData, adoptionFee: e.target.value})} className={inputClass} placeholder="0 for free adoption" />
          </div> */}
          </section>
        )}

        {/* Step 3: Health & Personality */}
        {step === 3 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-dark-divider pb-2">Health & Personality</h2>
            </div>

            <div>
              <label className={labelClass}>Health Tags</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={healthInput} onChange={e => setHealthInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('healthStatus', healthInput, setHealthInput))} className={inputClass} placeholder="e.g. Vaccinated" />
                <button type="button" onClick={() => addItem('healthStatus', healthInput, setHealthInput)} className="px-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.healthStatus.map((h, i) => (
                  <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm flex items-center gap-1 border border-green-200">
                    {h} <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('healthStatus', i)} />
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Personality Tags</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={personalityInput} onChange={e => setPersonalityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('personality', personalityInput, setPersonalityInput))} className={inputClass} placeholder="e.g. Playful" />
                <button type="button" onClick={() => addItem('personality', personalityInput, setPersonalityInput)} className="px-4 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.personality.map((p, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm flex items-center gap-1 border border-purple-200">
                    {p} <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('personality', i)} />
                  </span>
                ))}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className={labelClass}>Special Needs (Optional)</label>
              <textarea value={formData.specialNeeds} onChange={e => setFormData({ ...formData, specialNeeds: e.target.value })} rows={2} className={inputClass} placeholder="Describe any medical conditions, dietary requirements, etc." />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className={labelClass}>Description / Bio</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={5} className={inputClass} placeholder="Tell potential adopters about this pet's story, habits, and what kind of home they need..." />
            </div>
          </section>
        )}

        <div className="pt-6 border-t border-gray-100 dark:border-dark-divider flex justify-between items-center">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Back
            </button>
          ) : (
            <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
              Next Step
            </button>
          ) : (
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50">
              {loading ? "Publishing..." : "Publish Listing"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
