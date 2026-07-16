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
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
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
  const swiperRef = useRef(null);
  const fullscreenSwiperRef = useRef(null);

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
    if (!fullscreen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setFullscreen(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (swiperRef.current) swiperRef.current.swiper.slidePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (swiperRef.current) swiperRef.current.swiper.slideNext();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen]);

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

  // Gallery mode logic from ojest
  let galleryMode = "full"; // default 1 main + 8 thumbs (for 9+ images)
  if (images.length < 5) {
    galleryMode = "single"; // just 1 main image
  } else if (images.length < 9) {
    galleryMode = "mini"; // 1 main + 4 thumbs
  }

  const maxThumbnailsToShow = galleryMode === "full" ? 8 : (galleryMode === "mini" ? 4 : 0);

  // Main gallery uses thumbnails on the right.
  const useThumbnailOffset = images.length > 1;
  const thumbnailSource = useThumbnailOffset ? images.slice(1) : images.slice(0);
  const thumbnailImages = [];

  if (thumbnailSource.length > 0 && maxThumbnailsToShow > 0) {
    // Fill thumbnails up to the allowed limit
    for (let i = 0; i < Math.min(maxThumbnailsToShow, thumbnailSource.length); i++) {
      thumbnailImages.push(thumbnailSource[i]);
    }

    // Fill remaining slots if needed to maintain grid shape
    let i = 0;
    while (thumbnailImages.length < maxThumbnailsToShow && thumbnailSource.length > 0) {
      thumbnailImages.push(thumbnailSource[i % thumbnailSource.length]);
      i++;
    }
  }

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

  ].filter(s => s.value);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-main">
      {/* Fullscreen viewer */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-dark-main overflow-y-auto overflow-x-hidden h-screen w-screen">
          {/* Top Navigation Bar */}
          <div className="w-full sticky top-0 left-0 z-[110]">
            <div className="max-w-[1600px] mx-auto px-4 md:px-20 py-3.5 flex justify-between items-center gap-0 md:gap-6">
              <div className="flex-1"></div>
              
              <div className="flex gap-2 items-center ml-auto flex-shrink-0">
                <button
                  onClick={() => { if (swiperRef.current) swiperRef.current.swiper.slidePrev(); }}
                  className="h-8 w-8 md:h-10 md:w-10 hidden md:block rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 md:w-[24px] md:h-[24px] mx-auto" />
                </button>

                <button
                  onClick={() => { if (swiperRef.current) swiperRef.current.swiper.slideNext(); }}
                  className="h-8 w-8 md:h-10 md:w-10 hidden md:block rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 md:w-[24px] md:h-[24px] mx-auto" />
                </button>

                <button
                  onClick={() => setFullscreen(false)}
                  className="h-10 w-10 md:h-8 md:w-8 md:h-9 md:w-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                  title="Close"
                >
                  <span className="text-xl font-light"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span>
                </button>
              </div>
            </div>
          </div>

          {/* Image Display */}
          <div className="max-w-[1600px] mx-auto  md:px-20 py-5">
            <div className="flex items-center justify-center my-1 relative h-[85vh] w-full overflow-hidden">
              <div className="flex items-center justify-center relative w-full h-full">
                <Swiper
                  ref={swiperRef}
                  modules={[Navigation, A11y]}
                  spaceBetween={0}
                  slidesPerView={1}
                  initialSlide={activeImg}
                  onSlideChange={(swiper) => setActiveImg(swiper.realIndex)}
                  grabCursor={true}
                  threshold={10}
                  allowTouchMove={true}
                  simulateTouch={false}
                  resistance={true}
                  resistanceRatio={0.8}
                  loop={true}
                  className="w-full h-full"
                  style={{ touchAction: 'pan-y' }}
                >
                  {images.map((img, index) => (
                    <SwiperSlide key={index} className="!flex !items-center !justify-center w-full h-full">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image src={img} alt={`${name} - Image ${index + 1}`} fill className="object-contain rounded-none md:rounded-2xl" sizes="100vw" priority unoptimized />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                </div>

      



                {/* Desktop: Bottom Right Counter */}
                <div className="block fixed bottom-4 right-4 text-white dark:text-white text-sm md:text-lg md:text-base font-medium z-[110] bg-gray-900/70 dark:bg-black/70 px-3 py-2 rounded">
                  {activeImg + 1} of {images.length}
                </div>

        {/* Top Navigation Bar */}
<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[110] md:hidden">
  <div className="flex items-center gap-6">
    <button
      onClick={() => swiperRef.current?.swiper.slidePrev()}
      className="h-10 w-10 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
      aria-label="Previous image"
    >
      <ChevronLeft className="w-7 h-7" />
    </button>

    <button
      onClick={() => swiperRef.current?.swiper.slideNext()}
      className="h-10 w-10 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
      aria-label="Next image"
    >
      <ChevronRight className="w-7 h-7" />
    </button>
  </div>
</div>
              
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto  py-8 lg:py-12">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> {t('petDetail.backToListings')}
        </button>

<div>
  {/* Desktop / tablet gallery: Dynamic layout based on image count */}
            <div className="hidden md:flex md:flex-row gap-2 bg-white dark:bg-dark-card overflow-hidden h-[380px] sm:h-[430px] md:h-[461px] lg:h-[520px] xl:h-[560px] 2xl:h-[600px]">
              {/* Main Image - Left Side */}
              <div className={`relative group h-full ${galleryMode === "single" ? "w-full" : "w-full md:w-[calc(100%-320px)]"}`}>
                <div
                  className="relative w-full h-full cursor-pointer"
                  onClick={() => setFullscreen(true)}
                >
                  <Image
                    src={images[activeImg] || images[0]}
                    alt={`${name} - Image ${activeImg + 1}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 70vw"
                    unoptimized={true}
                    onError={(e) => {
                      e.target.src = "/images/hamer1.png";
                    }}
                  />
                </div>

                

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-2 py-1 rounded-lg z-10">
                    {activeImg + 1} / {images.length}
                  </div>
                )}

                {/* Health badges */}
                {pet.healthStatus?.length > 0 && (
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap z-10">
                    {pet.healthStatus.slice(0, 3).map(h => (
                      <span key={h} className="text-sm font-semibold bg-green-500/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />{h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Grid - Right Side - Show conditionally based on count */}
              {galleryMode !== "single" && (
                <div className="w-full md:w-[320px] flex-shrink-0 h-full overflow-hidden">
                  <div className={`grid gap-2 h-full ${galleryMode === "mini" ? "grid-cols-1 grid-rows-4" : "grid-cols-2 grid-rows-4"}`}>
                    {thumbnailImages.map((img, index) => {
                      const realIndex = useThumbnailOffset ? index + 1 : index;
                      const isAllPhotosTile = index === (maxThumbnailsToShow - 1) && images.length > (useThumbnailOffset ? (maxThumbnailsToShow + 1) : maxThumbnailsToShow);

                      return (
                        <div
                          key={index}
                          className="relative overflow-hidden cursor-pointer transition-all duration-200 h-full w-full"
                          onClick={() => setActiveImg(realIndex)}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${realIndex + 1}`}
                            fill
                            className={`object-cover ${activeImg === realIndex ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                            loading="lazy"
                            sizes="(max-width: 768px) 25vw, 20vw"
                            unoptimized={true}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />

                          {isAllPhotosTile && (
                            <div
                              className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-70 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImg(0);
                              }}
                            >
                              <span className="text-white text-base md:text-lg font-semibold">
                                {`All Photos (${images.length})`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile gallery: horizontally scrollable carousel with PEEK effect */}
            <div
              className={`flex md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-x-touch min-h-[250px] w-full ${images.length > 1 ? "gap-[3px]" : ""}`}
              style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Slide 1: Main Image */}
              <div
                className={`snap-start shrink-0 ${images.length === 1 ? "w-full" : "w-[88vw]"} aspect-[4/3] relative overflow-hidden bg-white dark:bg-dark-card cursor-pointer`}
                onClick={() => setFullscreen(true)}
              >
                <Image
                  src={images[activeImg] || images[0]}
                  alt={`${name} - Image 1`}
                  fill
                  className="object-cover"
                  priority
                  sizes="88vw"
                  unoptimized={true}
                  onError={(e) => {
                    e.target.src = "/images/hamer1.png";
                  }}
                />

                

                {/* Health badges */}
                {pet.healthStatus?.length > 0 && (
                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-10">
                    {pet.healthStatus.slice(0, 3).map(h => (
                      <span key={h} className="text-sm font-semibold bg-green-500/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />{h}
                      </span>
                    ))}
                  </div>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-2 py-1 rounded-lg z-10">
                    {activeImg + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Slide 2 & 3: Thumbnail Grids (2x2) */}
              {[0, 1].map((gridIdx) => {
                const startIndex = gridIdx * 4;
                const gridThumbs = thumbnailImages.slice(startIndex, startIndex + 4);
                if (gridThumbs.length === 0) return null;

                const hasMoreImages = images.length > (useThumbnailOffset ? thumbnailImages.length + 1 : thumbnailImages.length);

                return (
                  <div
                    key={gridIdx}
                    className="snap-start shrink-0 w-[88vw] aspect-[4/3] grid grid-cols-2 grid-rows-2 gap-[2px] bg-white dark:bg-dark-card"
                  >
                    {gridThumbs.map((img, i) => {
                      const thumbIndexInThumbnailImages = startIndex + i;
                      const realIndex = useThumbnailOffset ? thumbIndexInThumbnailImages + 1 : thumbIndexInThumbnailImages;

                      const isLastVisibleThumb = thumbIndexInThumbnailImages === thumbnailImages.length - 1;
                      const isAllPhotosTile = isLastVisibleThumb && hasMoreImages;

                      return (
                        <div
                          key={i}
                          className="relative overflow-hidden cursor-pointer"
                          onClick={() => {
                            if (isAllPhotosTile) {
                              setActiveImg(0);
                            } else {
                              setActiveImg(realIndex);
                            }
                          }}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${realIndex + 1}`}
                            fill
                            className={`object-cover ${activeImg === realIndex ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                            loading="lazy"
                            sizes="44vw"
                            unoptimized={true}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />

                          {isAllPhotosTile && (
                            <div
                              className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-70 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImg(0);
                              }}
                            >
                              <span className="text-white text-base md:text-lg font-semibold">
                                {`All Photos (${images.length})`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

  </div>  
        <div className="grid grid-cols-1 px-4 lg:grid-cols-3 gap-8 py-8">
          <div className="lg:col-span-2 space-y-3">
            
            {/* Description + AI sections */}
            <div className="md:bg-white md:dark:bg-dark-card rounded-2xl pt-6 md:p-6 md:border border-gray-100 dark:border-dark-divider space-y-4">
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
            <div className="md:bg-white md:dark:bg-dark-card rounded-2xl md:p-6 pt-6  md:border border-gray-100 dark:border-dark-divider">
              <h2 className="text-lg pb-2 sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                {t('petDetail.details')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specs
                  .filter((s) => s.label !== "Location")
                  .map((s) => (
                    <div
                      key={s.label}
                      className="flex md:flex-col justify-between gap-0.5 border-b border-gray-100 dark:border-dark-divider pb-2"
                    >
                      <span className="text-md sm:text-sm text-gray-400 uppercase tracking-widest font-semibold">
                        {t(`petDetail.${s.label.toLowerCase().replace(/ /g, '')}`) || s.label}
                      </span>
                      <span className="text-lg sm:text-md font-medium text-gray-900 dark:text-gray-100">
                        {s.value}
                      </span>
                    </div>
                  ))}
              </div>

            </div>
          </div>

          {/* RIGHT: Contact card */}
          <div className="space-y-4">
            {/* Price + name sticky card */}
            <div className="md:bg-white md:dark:bg-dark-card rounded-2xl md:p-6 md:border border-gray-100 dark:border-dark-divider sticky top-4 space-y-4">
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
                {owner?.phoneNumbers?.length > 0 ? (
                  <a href={`tel:${owner.phoneNumbers[0]}`} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-md transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
                    <Phone className="w-4 h-4" /> {t('petDetail.callNow')}
                  </a>
                ) : (
                  <button onClick={startChat} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-md transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
                    <MessageCircle className="w-4 h-4" /> {t('petDetail.messageShelter')}
                  </button>
                )}
                {owner?.phoneNumbers?.length > 0 && (
                  <button onClick={startChat} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 dark:border-dark-divider text-gray-700 dark:text-gray-200 font-bold text-md hover:bg-gray-50 dark:hover:bg-dark-card transition-all">
                    <MessageCircle className="w-4 h-4" /> {t('petDetail.messageShelter')}
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
                    <p className="text-md font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">{ownerName}</p>
                    <p className="text-sm text-gray-400">{owner?.sellerType === "company" ? t('petDetail.shelter') : t('petDetail.privateOwner')}</p>
                  </div>
                  <span className="text-sm text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">{t('petDetail.viewProfile')}</span>
                </Link>

                {/* Social media links */}
                {owner?.socialMedia && (owner.socialMedia.facebook || owner.socialMedia.instagram || owner.socialMedia.website) && (
                  <div className="flex gap-2 pt-3 mx-auto border-t border-gray-50 dark:border-dark-raised">
                    {owner.socialMedia.website && <a href={owner.socialMedia.website.startsWith('http') ? owner.socialMedia.website : `https://${owner.socialMedia.website}`} target="_blank" rel="noopener noreferrer" title="Website" className="p-2 rounded-full bg-gray-100 dark:bg-dark-raised text-gray-600 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-dark-card transition"><FaGlobe className="w-6 h-6" /></a>}
                    {owner.socialMedia.facebook && <a href={owner.socialMedia.facebook.startsWith('http') ? owner.socialMedia.facebook : `https://${owner.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" title="Facebook" className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"><FaFacebook className="w-6 h-6" /></a>}
                    {owner.socialMedia.instagram && <a href={owner.socialMedia.instagram.startsWith('http') ? owner.socialMedia.instagram : `https://${owner.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" title="Instagram" className="p-2 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition"><FaInstagram className="w-6 h-6" /></a>}
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
