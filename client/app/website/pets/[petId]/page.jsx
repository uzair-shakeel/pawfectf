"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { getPetById } from "../../../../services/petService";
import { getDemoPetById } from "../../../../lib/demoPets";
import { getPublicUserInfo } from "../../../../services/userService";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { useLanguage } from "../../../../lib/i18n/LanguageContext";
import { optimizeCloudinaryUrl } from "../../../../lib/imageUtils";
import { toTelHref } from "../../../../lib/utils";
import { usePetImageTransition } from "../../../../lib/petImageTransition/PetImageTransitionContext";
import { ShieldCheck, MapPin, Heart, MessageCircle, Phone, ChevronLeft, ChevronRight, X, Maximize, Minimize, ZoomIn } from "lucide-react";
import { FaGlobe, FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import io from "socket.io-client";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const isProd = typeof window !== "undefined" ? window.location.hostname !== "localhost" : process.env.NODE_ENV === "production";
const SOCKET_BASE = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL || (isProd ? "https://rafraf.pl" : undefined);
const socket = io(SOCKET_BASE, { autoConnect: false });

const formatAge = (months) => {
  if (!months && months !== 0) return "Nieznany";
  if (months < 12) return `${months} miesiące`;
  const y = Math.floor(months / 12), m = months % 12;
  const getYearWord = (years) => {
    if (years === 1) return "rok";
    if (years >= 2 && years <= 4) return "Lata";
    return "Lat";
  };
  const yearWord = getYearWord(y);
  return m ? `${y} ${yearWord} ${m} miesiące` : `${y} ${yearWord}`;
};

const fmtUrl = (path, w = 1200) => {
  if (!path) return "/images/hamer1.png";
  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE}/${String(path).replace("\\", "/")}`;
  return optimizeCloudinaryUrl(url, w);
};

function clampFsPan(pan, imgEl, viewportEl, zoom) {
  if (zoom <= 1 || !imgEl || !viewportEl) return { x: 0, y: 0 };
  const vw = viewportEl.clientWidth;
  const vh = viewportEl.clientHeight;
  const bw = imgEl.offsetWidth;
  const bh = imgEl.offsetHeight;
  if (!bw || !bh) return { x: 0, y: 0 };
  const maxX = Math.max(0, (bw * zoom - vw) / 2);
  const maxY = Math.max(0, (bh * zoom - vh) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, pan.x)),
    y: Math.min(maxY, Math.max(-maxY, pan.y)),
  };
}

export default function PetDetailPage() {
  const { petId } = useParams();
  const router = useRouter();
  const { user, token, getToken: getAuthToken } = useAuth();
  const { t } = useLanguage();
  const {
    registerTarget,
    isTransitioningFor,
    peekImageIndex,
    confirmHandoff,
    startReturnTransition,
    phase: imageTransitionPhase,
    shellImageCount,
  } = usePetImageTransition();
  const [pet, setPet] = useState(null);
  const [owner, setOwner] = useState(null);
  const [city, setCity] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [fsZoom, setFsZoom] = useState(1);
  const [fsPan, setFsPan] = useState({ x: 0, y: 0 });
  const fsPanDragRef = useRef(null);
  const [error, setError] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationText, setApplicationText] = useState("Hi, I'm very interested in adopting this pet. Please let me know what the next steps are!");
  const fsSwiperRef = useRef(null);
  const fsRootRef = useRef(null);
  const fsViewportRef = useRef(null);
  const fsActiveImgRef = useRef(null);
  const desktopMainImageRef = useRef(null);
  const mobileMainImageRef = useRef(null);
  const desktopDragRef = useRef({ active: false, startX: 0, moved: false });
  const handoffDoneRef = useRef(false);
  const isMorphActive = isTransitioningFor(petId);


  useEffect(() => {
    if (!petId) return;
    (async () => {
      try {
        const demo = getDemoPetById(petId);
        const data = demo || await getPetById(petId, getAuthToken);
        const len = Array.isArray(data?.images) ? data.images.length : 0;
        const pending = peekImageIndex(petId);
        const startIdx =
          pending == null || !len
            ? 0
            : Math.min(Math.max(0, pending), len - 1);
        setActiveImg(startIdx);
        setPet(data);
        if (demo) {
          setOwner({ firstName: demo.shelter?.name || "Schronisko", sellerType: "shelter" });
          setCity(demo.location?.city || "");
          return;
        }
        try {
          const o = await getPublicUserInfo(data?.createdBy);
          setOwner(o);
        } catch { setOwner({ firstName: "Schronisko", sellerType: "private" }); }
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
    // peekImageIndex reads live transition payload once on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  // Shared card→detail image expand: register hero as soon as morph shell/content exists
  useEffect(() => {
    if (!petId) return undefined;
    // Don't wait for pet fetch — register placeholder during morph so spinner never shows through
    if (!pet && !isMorphActive) return undefined;

    const resolveTarget = () => {
      const isDesktop =
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 768px)").matches;
      const el = isDesktop
        ? desktopMainImageRef.current
        : mobileMainImageRef.current;
      if (!el) return () => {};
      return registerTarget(petId, el);
    };

    let cleanup = resolveTarget();
    const retry = requestAnimationFrame(() => {
      cleanup?.();
      cleanup = resolveTarget();
    });

    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      cleanup?.();
      cleanup = resolveTarget();
    };
    mql.addEventListener("change", onChange);

    return () => {
      cancelAnimationFrame(retry);
      cleanup?.();
      mql.removeEventListener("change", onChange);
    };
  }, [petId, pet, registerTarget, isMorphActive]);

  // When morph finishes, wait until real pet content + hero image painted, then drop cover
  useEffect(() => {
    if (imageTransitionPhase !== "done" || !isMorphActive || !pet) return;
    if (handoffDoneRef.current) return;

    const tryHandoff = () => {
      if (handoffDoneRef.current) return;
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const wrap = isDesktop
        ? desktopMainImageRef.current
        : mobileMainImageRef.current;
      const img = wrap?.querySelector?.("img");
      if (img && img.complete && img.naturalWidth > 0) {
        handoffDoneRef.current = true;
        confirmHandoff();
      }
    };

    tryHandoff();
    const t = setTimeout(tryHandoff, 40);
    const t2 = setTimeout(tryHandoff, 120);
    const t3 = setTimeout(() => {
      if (!handoffDoneRef.current) {
        handoffDoneRef.current = true;
        confirmHandoff();
      }
    }, 600);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [imageTransitionPhase, isMorphActive, confirmHandoff, activeImg, pet]);

  // Reset handoff latch when opening a different pet / new forward morph
  useEffect(() => {
    if (imageTransitionPhase === "waiting" || imageTransitionPhase === "morphing") {
      handoffDoneRef.current = false;
    }
  }, [imageTransitionPhase, petId]);

  const handleMainImageReady = () => {
    if (imageTransitionPhase === "done" && isMorphActive && pet) {
      if (handoffDoneRef.current) return;
      handoffDoneRef.current = true;
      confirmHandoff();
    }
  };

  useEffect(() => {
    if (user) { socket.auth = { userId: user?.id }; socket.connect(); return () => socket.disconnect(); }
  }, [user]);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => {
      fsSwiperRef.current?.slideTo(activeImg, 0);
    });
    setFsZoom(1);
    setFsPan({ x: 0, y: 0 });
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync slide when modal opens
  }, [fullscreen]);

  useEffect(() => {
    const swiper = fsSwiperRef.current;
    if (!swiper) return;
    swiper.allowTouchMove = fsZoom <= 1;
  }, [fsZoom, fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
          return;
        }
        setFullscreen(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (fsZoom > 1) {
          setFsPan((p) =>
            clampFsPan(
              { x: p.x + 48, y: p.y },
              fsActiveImgRef.current,
              fsViewportRef.current,
              fsZoom
            )
          );
        } else fsSwiperRef.current?.slidePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (fsZoom > 1) {
          setFsPan((p) =>
            clampFsPan(
              { x: p.x - 48, y: p.y },
              fsActiveImgRef.current,
              fsViewportRef.current,
              fsZoom
            )
          );
        } else fsSwiperRef.current?.slideNext();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen, fsZoom]);

  const resetFsView = () => {
    setFsZoom(1);
    setFsPan({ x: 0, y: 0 });
  };

  const applyFsPan = (nextPan) => {
    setFsPan(
      clampFsPan(
        nextPan,
        fsActiveImgRef.current,
        fsViewportRef.current,
        fsZoom
      )
    );
  };

  const toggleFsZoom = () => {
    if (fsZoom > 1) resetFsView();
    else {
      setFsZoom(2);
      setFsPan({ x: 0, y: 0 });
    }
  };

  const onFsImgPointerDown = (e) => {
    if (fsZoom <= 1) return;
    fsPanDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: fsPan.x,
      panY: fsPan.y,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onFsImgPointerMove = (e) => {
    const drag = fsPanDragRef.current;
    if (!drag || fsZoom <= 1) return;
    applyFsPan({
      x: drag.panX + e.clientX - drag.startX,
      y: drag.panY + e.clientY - drag.startY,
    });
  };

  const endFsPan = () => {
    fsPanDragRef.current = null;
    setFsPan((prev) =>
      clampFsPan(
        prev,
        fsActiveImgRef.current,
        fsViewportRef.current,
        fsZoom
      )
    );
  };

  const onFsViewportWheel = (e) => {
    if (fsZoom <= 1) return;
    e.preventDefault();
    setFsPan((prev) =>
      clampFsPan(
        { x: prev.x - e.deltaX, y: prev.y - e.deltaY },
        fsActiveImgRef.current,
        fsViewportRef.current,
        fsZoom
      )
    );
  };

  const toggleBrowserFullscreen = () => {
    const el = fsRootRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  };

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

  // Morph open: hero box must match the real gallery on the first frame
  // so the flight has one destination and never corrects mid-way.
  if (!pet && isMorphActive) {
    const shellSingle = !shellImageCount || shellImageCount < 2;
    return (
      <div className="min-h-screen bg-white dark:bg-dark-main">
        <div className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-8 lg:py-10">
          <div className="mb-6 h-6" />
          <div className="hidden md:flex md:flex-row gap-2 h-[380px] sm:h-[430px] md:h-[461px] lg:h-[520px] xl:h-[560px] 2xl:h-[600px]">
            <div
              className={`relative h-full ${
                shellSingle ? "w-full" : "w-full md:w-[calc(100%-320px)]"
              }`}
            >
              <div ref={desktopMainImageRef} className="relative h-full w-full" />
            </div>
          </div>
          <div className="relative md:hidden">
            <div
              ref={mobileMainImageRef}
              className="relative aspect-[4/3] w-full overflow-hidden bg-[#EEF2FF] dark:bg-dark-raised"
            />
          </div>
        </div>
      </div>
    );
  }

  // Normal navigation (no morph): keep spinner
  if (!pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
      </div>
    );
  }

  const images = (pet.images || []).map(img => fmtUrl(img, 1200));
  if (!images.length) images.push("/images/hamer1.png");

  // Gallery: 1 photo = hero only; 2+ = hero + 2 real thumbs on the right (Cars & Bids style)
  const galleryMode = images.length < 2 ? "single" : "side";

  const sideThumbIndices = [];
  if (galleryMode === "side") {
    for (let k = 1; k <= 2; k += 1) {
      const idx = (activeImg + k) % images.length;
      if (sideThumbIndices.includes(idx)) break;
      sideThumbIndices.push(idx);
    }
  }
  const visibleInGallery = new Set([activeImg, ...sideThumbIndices]);
  const hiddenPhotoCount = Math.max(0, images.length - visibleInGallery.size);

  const name = pet.name || pet.breed || pet.species || "Pet";
  // Fee display removed per user request
  // const adoptionFee = pet.adoptionFee ? `${Number(pet.adoptionFee).toLocaleString()} zł` : "Free";
  const ownerName = owner?.sellerType === "company" ? (owner?.companyName || "Schronisko") : `${owner?.firstName || ""} ${owner?.lastName || ""}`.trim() || "Schronisko";

  const translateSpecies = (species) => {
    if (species === "Dog") return "Pies";
    if (species === "Cat") return "Kot";
    return species;
  };

  const translateGender = (gender) => {
    if (gender === "Male") return "Samiec";
    if (gender === "Female") return "Suczka";
    return gender;
  };

  const translateHealth = (status) => {
    const map = {
      Vaccinated: "Zaszczepiony",
      Neutered: "Wykastrowany",
      Microchipped: "Czip",
      Good: "Zdrowy",
    };
    return map[status] || status;
  };

  const translateSize = (size) => {
    if (size === "Small") return "Mały";
    if (size === "Medium") return "Średni";
    if (size === "Large") return "Duży";
    if (size === "Extra Large") return "Bardzo duży";
    return size;
  };

  const translateAdoptionStatus = (status) => {
    if (status === "Available") return "Dostępny";
    if (status === "Adopted") return "Adoptowany";
    if (status === "Pending") return "W trakcie";
    return status;
  };

  const specs = [
    { label: t("petDetail.species", "Gatunek"), value: translateSpecies(pet.species) },
    { label: t("petDetail.breed", "Rasa"), value: pet.breed },
    { label: t("petDetail.age", "Wiek"), value: formatAge(pet.ageMonths) },
    { label: t("petDetail.gender", "Płeć"), value: translateGender(pet.gender) },
    { label: t("petDetail.size", "Rozmiar"), value: translateSize(pet.size) },
    { label: t("petDetail.color", "Kolor"), value: pet.color },
    { label: t("petDetail.adoptionStatus", "Status adopcji"), value: translateAdoptionStatus(pet.adoptionStatus) || "Dostępny" },
    { label: t("petDetail.location", "Lokalizacja"), value: city || "—" },
  ].filter((s) => s.value);

  return (
    <div className="marketing-ui min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      {fullscreen && typeof document !== "undefined" && createPortal(
        <div
          ref={fsRootRef}
          className="fixed inset-0 z-[10050] flex flex-col overflow-hidden bg-black"
        >
          <div className="z-[410] flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
            <span className="text-sm font-medium tabular-nums">
              {activeImg + 1} of {images.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFsZoom}
                className="flex h-9 w-9 items-center justify-center bg-white/10 transition hover:bg-white/20"
                aria-label="Zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleBrowserFullscreen}
                className="flex h-9 w-9 items-center justify-center bg-white/10 transition hover:bg-white/20"
                aria-label="Pełny ekran"
              >
                {typeof document !== "undefined" && document.fullscreenElement ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="flex h-9 w-9 items-center justify-center bg-[#2563EB] transition hover:bg-[#1D4ED8]"
                aria-label="Zamknij"
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (fsZoom > 1) return;
                  fsSwiperRef.current?.slidePrev();
                }}
                className="absolute left-3 top-1/2 z-[410] flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/10 text-white transition hover:bg-white/20 md:left-5"
                aria-label="Poprzednie zdjęcie"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (fsZoom > 1) return;
                  fsSwiperRef.current?.slideNext();
                }}
                className="absolute right-3 top-1/2 z-[410] flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/10 text-white transition hover:bg-white/20 md:right-5"
                aria-label="Następne zdjęcie"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </>
          )}

          <div
            ref={fsViewportRef}
            className="relative w-full overflow-hidden"
            style={{ height: "calc(100dvh - 3.5rem)" }}
            onWheel={onFsViewportWheel}
          >
            <Swiper
              modules={[Keyboard, A11y]}
              keyboard={{ enabled: fsZoom <= 1 }}
              spaceBetween={0}
              slidesPerView={1}
              initialSlide={activeImg}
              onSwiper={(swiper) => {
                fsSwiperRef.current = swiper;
                swiper.allowTouchMove = fsZoom <= 1;
              }}
              onSlideChange={(swiper) => {
                setActiveImg(swiper.activeIndex);
                resetFsView();
              }}
              grabCursor={fsZoom <= 1}
              className="pet-fs-swiper !h-full !w-full"
            >
              {images.map((img, index) => (
                <SwiperSlide key={`${img}-${index}`} className="!flex !h-full !items-center !justify-center">
                  <div
                    className="flex max-h-full max-w-full items-center justify-center"
                    style={
                      index === activeImg && fsZoom > 1
                        ? {
                            transform: `translate(${fsPan.x}px, ${fsPan.y}px)`,
                          }
                        : undefined
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={index === activeImg ? fsActiveImgRef : undefined}
                      src={img}
                      alt={`${name} - ${index + 1}`}
                      draggable={false}
                      className={`pet-fs-slide-img ${fsZoom > 1 && index === activeImg ? "pet-fs-slide-img--pan" : ""}`}
                      style={
                        index === activeImg && fsZoom > 1
                          ? {
                              transform: `scale(${fsZoom})`,
                              transformOrigin: "center center",
                            }
                          : undefined
                      }
                      onLoad={() => {
                        if (index !== activeImg || fsZoom <= 1) return;
                        setFsPan((prev) =>
                          clampFsPan(
                            prev,
                            fsActiveImgRef.current,
                            fsViewportRef.current,
                            fsZoom
                          )
                        );
                      }}
                      onPointerDown={onFsImgPointerDown}
                      onPointerMove={onFsImgPointerMove}
                      onPointerUp={endFsPan}
                      onPointerCancel={endFsPan}
                      onError={(e) => {
                        e.currentTarget.src = "/images/hamer1.png";
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>,
        document.body
      )}

      <div className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-8 lg:py-10">
        <button
          type="button"
          onClick={(e) => {
            const isDesktop = window.matchMedia("(min-width: 768px)").matches;
            const sourceEl = isDesktop
              ? desktopMainImageRef.current
              : mobileMainImageRef.current;
            const img = sourceEl?.querySelector?.("img");
            const imageSrc = img?.currentSrc || img?.src || images[activeImg];
            const returnHref = startReturnTransition({
              petId,
              imageSrc,
              sourceEl: sourceEl || img,
            });
            if (returnHref) {
              e.preventDefault();
              // Pop back onto the list that is already in history so it isn't
              // mounted again from scratch (that remount is what felt like a reload).
              if (window.history.length > 1) router.back();
              else router.push(returnHref, { scroll: false });
              return;
            }
            router.back();
          }}
          className="mb-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#64748B] transition hover:text-[#2563EB]"
        >
          <ChevronLeft className="h-4 w-4" /> {t("petDetail.backToListings")}
        </button>

<div>
  {/* Desktop / tablet gallery: Dynamic layout based on image count */}
            <div className="hidden md:flex md:flex-row gap-2 bg-white dark:bg-dark-card overflow-hidden h-[380px] sm:h-[430px] md:h-[461px] lg:h-[520px] xl:h-[560px] 2xl:h-[600px]">
              {/* Main Image - Left Side */}
              <div className={`relative group h-full select-none ${galleryMode === "single" ? "w-full" : "w-full md:w-[calc(100%-320px)]"}`}>
                <div
                  ref={desktopMainImageRef}
                  className={`relative h-full w-full ${images.length > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                  onPointerDown={(e) => {
                    if (images.length <= 1) return;
                    desktopDragRef.current = {
                      active: true,
                      startX: e.clientX,
                      moved: false,
                    };
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    const drag = desktopDragRef.current;
                    if (!drag.active) return;
                    if (Math.abs(e.clientX - drag.startX) > 8) drag.moved = true;
                  }}
                  onPointerUp={(e) => {
                    const drag = desktopDragRef.current;
                    if (!drag.active) {
                      setFullscreen(true);
                      return;
                    }
                    const dx = e.clientX - drag.startX;
                    desktopDragRef.current = { active: false, startX: 0, moved: false };
                    try {
                      e.currentTarget.releasePointerCapture?.(e.pointerId);
                    } catch (_) {}

                    if (Math.abs(dx) > 50) {
                      if (dx < 0) {
                        setActiveImg((i) => (i + 1) % images.length);
                      } else {
                        setActiveImg((i) => (i - 1 + images.length) % images.length);
                      }
                      return;
                    }
                    if (!drag.moved) setFullscreen(true);
                  }}
                  onPointerCancel={() => {
                    desktopDragRef.current = { active: false, startX: 0, moved: false };
                  }}
                >
                  <div className="relative h-full w-full bg-[#EEF2FF] dark:bg-dark-raised">
                  <Image
                    src={images[activeImg] || images[0]}
                    alt={`${name} - Image ${activeImg + 1}`}
                    fill
                    className="pointer-events-none object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, 70vw"
                    unoptimized={true}
                    onLoadingComplete={handleMainImageReady}
                    onError={(e) => {
                      e.target.src = "/images/hamer1.png";
                    }}
                    draggable={false}
                  />
                  </div>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImg((i) => (i - 1 + images.length) % images.length);
                      }}
                      className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-all hover:bg-black/80 group-hover:opacity-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImg((i) => (i + 1) % images.length);
                      }}
                      className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-all hover:bg-black/80 group-hover:opacity-100"
                    >
                      <ChevronRight className="h-5 w-5" />
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
                    {pet.healthStatus.slice(0, 3).map((h) => (
                      <span key={h} className="inline-flex items-center gap-1 bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white">
                        <ShieldCheck className="h-3 w-3" />{translateHealth(h)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Grid - Right Side - Show conditionally based on count */}
              {galleryMode === "side" && (
                <div className="w-full md:w-[320px] flex-shrink-0 h-full overflow-hidden">
                  <div
                    className={`grid h-full gap-2 ${
                      sideThumbIndices.length > 1 ? "grid-cols-1 grid-rows-2" : "grid-cols-1 grid-rows-1"
                    }`}
                  >
                    {sideThumbIndices.map((realIndex, index) => {
                      const isLast = index === sideThumbIndices.length - 1;
                      const showAllPhotosOverlay =
                        isLast && hiddenPhotoCount > 0;

                      return (
                        <div
                          key={`side-thumb-${realIndex}`}
                          className="relative h-full w-full cursor-pointer overflow-hidden transition-all duration-200"
                          onClick={() => {
                            if (showAllPhotosOverlay) {
                              setActiveImg(realIndex);
                              setFullscreen(true);
                              return;
                            }
                            setActiveImg(realIndex);
                          }}
                        >
                          <Image
                            src={images[realIndex]}
                            alt={`${name} - ${realIndex + 1}`}
                            fill
                            className={`object-cover ${
                              activeImg === realIndex
                                ? "opacity-100"
                                : "opacity-70 hover:opacity-100"
                            }`}
                            loading="lazy"
                            sizes="320px"
                            unoptimized
                            onError={(e) => {
                              e.target.src = "/images/hamer1.png";
                            }}
                          />

                          {showAllPhotosOverlay && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 transition hover:bg-black/70">
                              <span className="text-base font-semibold text-white md:text-lg">
                                All Photos ({images.length})
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

            {/* Mobile gallery: full-width swipe slider */}
            <div className="relative overflow-hidden md:hidden">
              <div
                className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-x-touch scrollbar-hide"
                style={{ touchAction: "pan-x pan-y", WebkitOverflowScrolling: "touch" }}
                onScroll={(e) => {
                  if (images.length <= 1) return;
                  const el = e.currentTarget;
                  const slide = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
                  const next = Math.min(Math.max(slide, 0), images.length - 1);
                  if (next !== activeImg) setActiveImg(next);
                }}
              >
                {images.map((img, index) => (
                  <div
                    key={index}
                    ref={index === 0 ? mobileMainImageRef : undefined}
                    className="relative aspect-[4/3] w-full min-w-full shrink-0 snap-start overflow-hidden bg-[#EEF2FF] dark:bg-dark-raised"
                    onClick={() => {
                      setActiveImg(index);
                      setFullscreen(true);
                    }}
                  >
                    <Image
                      src={img}
                      alt={`${name} - ${index + 1}`}
                      fill
                      className="object-contain"
                      priority={index === 0}
                      sizes="100vw"
                      unoptimized
                      onLoadingComplete={index === 0 ? handleMainImageReady : undefined}
                      onError={(e) => {
                        e.target.src = "/images/hamer1.png";
                      }}
                    />
                  </div>
                ))}
              </div>

              {pet.healthStatus?.length > 0 && (
                <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                  {pet.healthStatus.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-1 bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {translateHealth(h)}
                    </span>
                  ))}
                </div>
              )}

              {images.length > 1 && (
                <>
                  <div className="absolute bottom-3 right-3 z-10 bg-[#0F172A]/70 px-2 py-1 text-xs font-semibold text-white">
                    {activeImg + 1} / {images.length}
                  </div>
                  <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition ${
                          i === activeImg ? "w-4 bg-white" : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

  </div>  
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h1 className="font-display text-[2.1rem] font-bold leading-tight text-[#0F172A] dark:text-white md:text-[3rem]">
              {name}
            </h1>
            <p className="mt-2 text-[15px] text-[#64748B]">
              {[pet.breed, translateSpecies(pet.species), city].filter(Boolean).join(" · ")}
            </p>

            <section className="mt-8 border-t border-[#E2E8F0] pt-6 dark:border-dark-divider">
              <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
                {t("petDetail.details")}
              </h2>
              <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {specs.map((s) => (
                  <div key={s.label} className="border-b border-[#E2E8F0] pb-3 dark:border-dark-divider">
                    <dt className="text-[13px] text-[#64748B]">{s.label}</dt>
                    <dd className="mt-1 text-[16px] font-semibold text-[#0F172A] dark:text-white">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-8 border-t border-[#E2E8F0] pt-6 dark:border-dark-divider">
              <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
                {t("petDetail.about")} {name}
              </h2>
              {pet.description && (
                <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#475569] dark:text-white/70">
                  {pet.description}
                </p>
              )}
              {pet.aiSections?.length > 0 && pet.aiSections.map((s, i) => (
                <div key={i} className="mt-5">
                  <h3 className="font-semibold text-[#0F172A] dark:text-white">{s.heading}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-[#64748B]">{s.content}</p>
                </div>
              ))}
              {pet.personality?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-[#0F172A] dark:text-white">{t("petDetail.personality")}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pet.personality.map((p) => (
                      <span key={p} className="bg-[#EEF2FF] px-3 py-1.5 text-sm font-medium text-[#2563EB] dark:bg-white/10 dark:text-[#93C5FD]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {pet.specialNeeds && (
                <div className="mt-6 border-l-2 border-[#2563EB] bg-[#EEF2FF] px-4 py-3 dark:bg-white/5">
                  <p className="text-sm font-semibold text-[#2563EB]">{t("petDetail.specialNeeds")}</p>
                  <p className="mt-1 text-[15px] text-[#0F172A] dark:text-white/80">{pet.specialNeeds}</p>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 bg-white p-6 dark:bg-dark-card">
              <h2 className="font-display text-[1.75rem] font-bold text-[#0F172A] dark:text-white">{name}</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                {[pet.breed, translateSpecies(pet.species)].filter(Boolean).join(" · ")}
              </p>
              {city && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-[#64748B]">
                  <MapPin className="h-4 w-4 text-[#2563EB]" />
                  {city}
                </p>
              )}

              {pet.healthStatus?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {pet.healthStatus.map((h) => (
                    <span key={h} className="inline-flex items-center gap-1 bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB] dark:bg-white/10 dark:text-[#93C5FD]">
                      <ShieldCheck className="h-3 w-3" />{translateHealth(h)}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-3">
                {owner?.phoneNumbers?.length > 0 ? (
                  <a
                    href={toTelHref(owner.phoneNumbers[0])}
                    className="flex h-12 w-full items-center justify-center gap-2 bg-[#2563EB] text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
                  >
                    <Phone className="h-4 w-4" /> {t("petDetail.callNow")}
                  </a>
                ) : (
                  <button
                    onClick={startChat}
                    className="flex h-12 w-full items-center justify-center gap-2 bg-[#2563EB] text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
                  >
                    <MessageCircle className="h-4 w-4" /> {t("petDetail.messageShelter")}
                  </button>
                )}
                {owner?.phoneNumbers?.length > 0 && (
                  <button
                    onClick={startChat}
                    className="flex h-12 w-full items-center justify-center gap-2 border border-[#0F172A] text-sm font-bold text-[#0F172A] transition hover:bg-[#0F172A] hover:text-white dark:border-white/40 dark:text-white"
                  >
                    <MessageCircle className="h-4 w-4" /> {t("petDetail.messageShelter")}
                  </button>
                )}
              </div>

              <Link
                href={`/website/profile?id=${pet.createdBy}`}
                className="mt-6 flex items-center gap-3 border-t border-[#E2E8F0] pt-5 dark:border-dark-divider"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-[#EEF2FF] dark:bg-white/10">
                  {owner?.image ? (
                    <Image src={owner.image} alt={ownerName} fill className="object-cover" sizes="48px" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold text-[#2563EB]">
                      {ownerName[0]}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#0F172A] dark:text-white">{ownerName}</p>
                  <p className="text-sm text-[#64748B]">
                    {owner?.sellerType === "company" ? t("petDetail.shelter") : t("petDetail.privateOwner")}
                  </p>
                </div>
              </Link>

              {owner?.socialMedia && (owner.socialMedia.facebook || owner.socialMedia.instagram || owner.socialMedia.website) && (
                <div className="mt-4 flex gap-2">
                  {owner.socialMedia.website && (
                    <a href={owner.socialMedia.website.startsWith("http") ? owner.socialMedia.website : `https://${owner.socialMedia.website}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center bg-[#F4F7FB] text-[#64748B] dark:bg-white/10">
                      <FaGlobe className="h-4 w-4" />
                    </a>
                  )}
                  {owner.socialMedia.facebook && (
                    <a href={owner.socialMedia.facebook.startsWith("http") ? owner.socialMedia.facebook : `https://${owner.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-white/10">
                      <FaFacebook className="h-4 w-4" />
                    </a>
                  )}
                  {owner.socialMedia.instagram && (
                    <a href={owner.socialMedia.instagram.startsWith("http") ? owner.socialMedia.instagram : `https://${owner.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center bg-[#EEF2FF] text-[#2563EB] dark:bg-white/10">
                      <FaInstagram className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4">
          <div className="w-full max-w-lg bg-white p-6 dark:bg-dark-card">
            <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">{t("petDetail.adoptionApplication")}</h2>
            <p className="mt-2 text-[15px] text-[#64748B]">{t("petDetail.applicationSubtitle")} {name}.</p>
            <label className="mt-5 block text-sm font-semibold text-[#0F172A] dark:text-white">{t("petDetail.messageToShelter")}</label>
            <textarea
              value={applicationText}
              onChange={(e) => setApplicationText(e.target.value)}
              rows={4}
              className="mt-2 w-full border border-[#E2E8F0] bg-[#F4F7FB] p-3 text-sm outline-none focus:border-[#2563EB] dark:border-dark-divider dark:bg-dark-raised"
              placeholder={t("petDetail.messagePlaceholder")}
            />
            <div className="mt-5 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="h-12 flex-1 border border-[#0F172A] text-sm font-bold text-[#0F172A] dark:border-white/40 dark:text-white">
                {t("petDetail.cancel")}
              </button>
              <button onClick={submitApplication} className="flex h-12 flex-1 items-center justify-center gap-2 bg-[#2563EB] text-sm font-bold text-white hover:bg-[#1D4ED8]">
                <Heart className="h-4 w-4" /> {t("petDetail.submitApplication")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
