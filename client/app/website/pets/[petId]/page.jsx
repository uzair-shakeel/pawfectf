"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { getPetById } from "../../../../services/petService";
import { getPublicUserInfo } from "../../../../services/userService";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { useLanguage } from "../../../../lib/i18n/LanguageContext";
import { optimizeCloudinaryUrl } from "../../../../lib/imageUtils";
import { ShieldCheck, MapPin, Heart, MessageCircle, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { FaGlobe, FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import io from "socket.io-client";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const isProd = typeof window !== "undefined" ? window.location.hostname !== "localhost" : process.env.NODE_ENV === "production";
const SOCKET_BASE = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL || (isProd ? "https://rafraf.pl" : undefined);
const socket = io(SOCKET_BASE, { autoConnect: false });

const formatAge = (months) => {
  if (!months && months !== 0) return "Unknown";
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
  const y = Math.floor(months / 12), m = months % 12;
  return m ? `${y}y ${m}m` : `${y} year${y !== 1 ? "s" : ""}`;
};

const fmtUrl = (path, w = 1200) => {
  if (!path) return "/images/hamer1.png";
  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE}/${String(path).replace("\\", "/")}`;
  return optimizeCloudinaryUrl(url, w);
};

export default function PetDetailPage() {
  const { petId } = useParams();
  const router = useRouter();
  const { user, token, getToken: getAuthToken } = useAuth();
  const { t } = useLanguage();
  const [pet, setPet] = useState(null);
  const [owner, setOwner] = useState(null);
  const [city, setCity] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationText, setApplicationText] = useState("Hi, I'm very interested in adopting this pet. Please let me know what the next steps are!");

  useEffect(() => {
    if (!petId) return;
    (async () => {
      try {
        const data = await getPetById(petId);
        setPet(data);
        try {
          const o = await getPublicUserInfo(data?.createdBy);
          setOwner(o);
        } catch { setOwner({ firstName: "Shelter", sellerType: "private" }); }
        const coords = data?.location?.coordinates;
        if (coords) {
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords[1]}&lon=${coords[0]}&format=json`);
            const d = await r.json();
            setCity(d.address?.city || d.address?.town || d.address?.village || "");
          } catch { }
        }
      } catch { setError("Failed to load pet details."); }
    })();
  }, [petId]);

  useEffect(() => {
    if (user) { socket.auth = { userId: user?.id }; socket.connect(); return () => socket.disconnect(); }
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (!fullscreen) return;
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") setActiveImg(i => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActiveImg(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen, pet]);

  const startChat = async () => {
    if (!user) { router.push("/sign-in"); return; }
    try {
      const authToken = token || getAuthToken() || localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/chat/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify({ petId, ownerId: pet?.createdBy }),
      });
      const d = await res.json();
      if (!res.ok) { alert(d?.message || "Failed to start chat."); return; }
      const c = Array.isArray(d) ? d[0] : d?.chat || d;
      const chatId = c?._id || null;
      router.push(chatId ? `/dashboard/messages?chatId=${encodeURIComponent(chatId)}` : "/dashboard/messages");
    } catch { alert("Failed to start chat."); }
  };

  const submitApplication = async () => {
    if (!user) { router.push("/sign-in"); return; }
    try {
      const authToken = token || getAuthToken() || localStorage.getItem("token");
      // Step 1: create or retrieve the chat
      const res = await fetch(`${API_BASE}/chat/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify({ petId, ownerId: pet?.createdBy }),
      });
      const d = await res.json();
      if (!res.ok) { alert(d?.message || "Failed to start chat."); return; }
      const c = Array.isArray(d) ? d[0] : d?.chat || d;
      const chatId = c?._id || null;

      // Step 2: send the application message via REST (socket not available here)
      if (chatId && applicationText.trim()) {
        await fetch(`${API_BASE}/chat/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
          body: JSON.stringify({ content: applicationText, senderId: user?.id || user?._id }),
        });
      }
      setIsModalOpen(false);
      router.push(chatId ? `/dashboard/messages?chatId=${encodeURIComponent(chatId)}` : "/dashboard/messages");
    } catch { alert("Failed to submit application."); }
  };

  if (error) return <div className="flex items-center justify-center min-h-screen"><p className="text-red-500 text-xl">{error}</p></div>;
  if (!pet) return <div className="flex items-center justify-center min-h-screen"><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" /></div>;

  const images = (pet.images || []).map(img => fmtUrl(img, 1200));
  if (!images.length) images.push("/images/hamer1.png");

  const name = pet.name || pet.breed || pet.species || "Pet";
  // Fee display removed per user request
  // const adoptionFee = pet.adoptionFee ? `${Number(pet.adoptionFee).toLocaleString()} zł` : "Free";
  const ownerName = owner?.sellerType === "company" ? (owner?.companyName || "Shelter") : `${owner?.firstName || ""} ${owner?.lastName || ""}`.trim() || "Shelter";

  const specs = [
    { label: "Species", value: pet.species },
    { label: "Breed", value: pet.breed },
    { label: "Age", value: formatAge(pet.ageMonths) },
    { label: "Gender", value: pet.gender },
    { label: "Size", value: pet.size },
    { label: "Color", value: pet.color },
    { label: "Coat Length", value: pet.coatLength },
    { label: "Adoption Status", value: pet.adoptionStatus || "Available" },
    { label: "Location", value: city || "—" },
    { label: "Listed by", value: ownerName },
  ].filter(s => s.value);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-main">
      {/* Fullscreen viewer */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setFullscreen(false)}>
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-3">✕</button>
          <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }} className="absolute left-4 text-white bg-black/50 rounded-full p-3"><ChevronLeft className="w-6 h-6" /></button>
          <div className="relative w-full max-w-4xl h-[80vh]" onClick={e => e.stopPropagation()}>
            <Image src={images[activeImg]} alt={name} fill className="object-contain" sizes="100vw" priority unoptimized />
          </div>
          <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }} className="absolute right-4 text-white bg-black/50 rounded-full p-3"><ChevronRight className="w-6 h-6" /></button>
          <div className="absolute bottom-4 text-white text-md">{activeImg + 1} / {images.length}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> {t('petDetail.backToListings')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Gallery */}
          <div className="lg:col-span-2 space-y-3">
            {/* Main image */}
            <div className="relative h-[340px] md:h-[500px] rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setFullscreen(true)}>
              <Image src={images[activeImg]} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" sizes="(max-width: 1024px) 100vw, 66vw" priority />
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-2 py-1 rounded-lg">{activeImg + 1} / {images.length}</div>
              {pet.healthStatus?.length > 0 && (
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  {pet.healthStatus.slice(0, 3).map(h => (
                    <span key={h} className="text-sm font-semibold bg-green-500/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />{h}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {images.slice(0, 12).map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`relative h-16 w-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? "border-blue-500 scale-[1.03]" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <Image src={fmtUrl(pet.images?.[i], 200)} alt="" fill className="object-cover" sizes="96px" />
                  </button>
                ))}
              </div>
            )}

            {/* Description + AI sections */}
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-divider space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('petDetail.about')} {name}</h2>
              {pet.description && <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{pet.description}</p>}
              {pet.aiSections?.length > 0 && pet.aiSections.map((s, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{s.heading}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-md leading-relaxed">{s.content}</p>
                </div>
              ))}
              {pet.personality?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('petDetail.personality')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {pet.personality.map(p => <span key={p} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-md font-medium">{p}</span>)}
                  </div>
                </div>
              )}
              {pet.specialNeeds && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="text-md font-semibold text-amber-800 dark:text-amber-300">{t('petDetail.specialNeeds')}</p>
                  <p className="text-md text-amber-700 dark:text-amber-400 mt-1">{pet.specialNeeds}</p>
                </div>
              )}
            </div>

            {/* Specs table */}
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 sm:p-6 border border-gray-100 dark:border-dark-divider">
              <h2 className="text-lg pb-2 sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('petDetail.details')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specs.map(s => (
                  <div key={s.label} className="flex md:flex-col justify-between gap-0.5 border-b border-gray-100 dark:border-dark-divider pb-2">
                    <span className="text-md sm:text-sm text-gray-400 uppercase tracking-widest font-semibold">{t(`petDetail.${s.label.toLowerCase().replace(/ /g, '')}`) || s.label}</span>
                    <span className="text-lg sm:text-md font-medium text-gray-900 dark:text-gray-100">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Contact card */}
          <div className="space-y-4">
            {/* Price + name sticky card */}
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-divider sticky top-4 space-y-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">{name}</h1>
                {pet.breed && pet.species && <p className="text-gray-500 dark:text-gray-400 text-md mt-1">{pet.breed} · {pet.species}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-md text-gray-500 dark:text-gray-400">{city || t('petDetail.locationNotSet')}</span>
                </div>
              </div>

              {/* Fee section removed per user request */}
              {/* <div className="bg-gray-50 dark:bg-dark-raised rounded-xl p-4">
                <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-1">Adoption Fee</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{adoptionFee}</p>
              </div> */}

              {/* Health badges */}
              {pet.healthStatus?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pet.healthStatus.map(h => (
                    <span key={h} className="flex items-center gap-1 text-sm font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 px-2 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" />{h}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA buttons */}
              <div className="space-y-2">
                <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-md transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
                  <Heart className="w-4 h-4" /> {t('petDetail.applyToAdopt')}
                </button>
                <button onClick={startChat} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 dark:border-dark-divider text-gray-700 dark:text-gray-200 font-bold text-md hover:bg-gray-50 dark:hover:bg-dark-card transition-all">
                  <MessageCircle className="w-4 h-4" /> {t('petDetail.messageShelter')}
                </button>
                {owner?.phoneNumbers?.length > 0 && (
                  <button onClick={() => setShowPhone(v => !v)} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 dark:border-dark-divider text-gray-700 dark:text-gray-200 font-bold text-md hover:bg-gray-50 dark:hover:bg-dark-card transition-all">
                    <Phone className="w-4 h-4" /> {showPhone ? owner.phoneNumbers[0] : t('petDetail.showPhone')}
                  </button>
                )}
              </div>

              {/* Owner Info & Socials */}
              <div className="border border-gray-100 dark:border-dark-divider rounded-xl p-4 flex flex-col gap-3">
                <Link href={`/website/profile?id=${pet.createdBy}`} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-dark-raised overflow-hidden relative flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                    {owner?.image ? <Image src={owner.image} alt={ownerName} fill className="object-cover" sizes="48px" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">{ownerName[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-md font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors truncate">{ownerName}</p>
                    <p className="text-sm text-gray-400">{owner?.sellerType === "company" ? t('petDetail.shelter') : t('petDetail.privateOwner')}</p>
                  </div>
                  <span className="text-sm text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">{t('petDetail.viewProfile')}</span>
                </Link>

                {/* Social media links */}
                {owner?.socialMedia && (owner.socialMedia.facebook || owner.socialMedia.instagram || owner.socialMedia.website) && (
                  <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-dark-raised">
                    {owner.socialMedia.website && <a href={owner.socialMedia.website.startsWith('http') ? owner.socialMedia.website : `https://${owner.socialMedia.website}`} target="_blank" rel="noopener noreferrer" title="Website" className="p-2 rounded-full bg-gray-100 dark:bg-dark-raised text-gray-600 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-dark-card transition"><FaGlobe className="w-4 h-4" /></a>}
                    {owner.socialMedia.facebook && <a href={owner.socialMedia.facebook.startsWith('http') ? owner.socialMedia.facebook : `https://${owner.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" title="Facebook" className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"><FaFacebook className="w-4 h-4" /></a>}
                    {owner.socialMedia.instagram && <a href={owner.socialMedia.instagram.startsWith('http') ? owner.socialMedia.instagram : `https://${owner.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" title="Instagram" className="p-2 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition"><FaInstagram className="w-4 h-4" /></a>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-dark-divider">
            <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">{t('petDetail.adoptionApplication')}</h2>
            <p className="text-gray-500 text-md mb-6">{t('petDetail.applicationSubtitle')} {name}.</p>

            <div className="mb-6">
              <label className="block text-md font-bold text-gray-700 dark:text-gray-300 mb-2">{t('petDetail.messageToShelter')}</label>
              <textarea
                value={applicationText}
                onChange={(e) => setApplicationText(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-divider bg-gray-50 dark:bg-dark-raised focus:ring-2 focus:ring-blue-500 outline-none text-md resize-none"
                placeholder={t('petDetail.messagePlaceholder')}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-dark-raised dark:text-gray-300 dark:hover:bg-dark-card transition-colors">
                {t('petDetail.cancel')}
              </button>
              <button onClick={submitApplication} className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                <Heart className="w-4 h-4" /> {t('petDetail.submitApplication')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
