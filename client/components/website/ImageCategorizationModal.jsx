"use client";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Navigation, A11y } from "swiper/modules";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";

const categorySequence = [
  "exterior",
  "interior",
  "dashboard",
  "wheel",
  "engine",
  "documents",
  "keys",
];

const categoryOrder = {
  exterior: 0,
  interior: 1,
  dashboard: 2,
  wheel: 3,
  engine: 4,
  documents: 5,
  keys: 6,
};

const normalizeCategory = (raw) => {
  if (!raw) return "exterior";
  const lower = raw.toLowerCase().trim();

  // Check specific parts first to avoid "front engine" being caught as "front" (Exterior)
  if (lower.includes("seat") || lower.includes("steering") || lower.includes("interior")) return "interior";
  if (lower.includes("dashboard") || lower.includes("console") || lower.includes("odometer") || lower.includes("instrument")) return "dashboard";
  if (lower.includes("wheel") || lower.includes("tire") || lower.includes("rim")) return "wheel";
  if (lower.includes("engine") || lower.includes("hood") || lower.includes("under")) return "engine";
  if (lower.includes("key")) return "keys";
  if (lower.includes("document") || lower.includes("paper") || lower.includes("vin")) return "documents";

  // Check exterior last
  if (lower.includes("front") || lower.includes("back") || lower.includes("side") || lower.includes("exterior") || lower.includes("bumper") || lower.includes("door") || lower.includes("trunk")) return "exterior";

  return "exterior"; // Default
};

const capitalizeWord = (word) => {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export default function ImageCategorizationModal({
  isOpen,
  onClose,
  images = [],
  carId,
  clickedImageUrl = null,
  categorizedImages = [],
}) {
  const [organizedImages, setOrganizedImages] = useState({
    all: [],
    exterior: [],
    interior: [],
    dashboard: [],
    wheel: [],
    engine: [],
    documents: [],
    keys: [],
  });
  const [currentCategory, setCurrentCategory] = useState("all");
  const [showSlider, setShowSlider] = useState(false);
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({});

  const swiperRef = useRef(null);

  const processImagesFromDatabase = (categorizedImagesData) => {
    if (!categorizedImagesData || categorizedImagesData.length === 0) {
      const results = {
        all: [],
        exterior: [],
        interior: [],
        dashboard: [],
        wheel: [],
        engine: [],
        documents: [],
        keys: [],
      };

      images.forEach((img, index) => {
        const imageData = {
          url: img,
          category: "exterior",
          detected_label: "Unknown",
          confidence: 0,
          index: index,
        };
        results.all.push(imageData);
        results.exterior.push(imageData);
      });

      return results;
    }

    const results = {
      all: [],
      exterior: [],
      interior: [],
      dashboard: [],
      wheel: [],
      engine: [],
      documents: [],
      keys: [],
    };

    categorizedImagesData.forEach((imgData) => {
      const category = normalizeCategory(imgData.category || "exterior");
      const imageData = {
        url: imgData.url,
        category: category,
        detected_label: imgData.detected_label || "Unknown",
        confidence: imgData.confidence || 0,
        index: imgData.index !== undefined ? imgData.index : 0,
      };
      results.all.push(imageData);
      if (results[category]) {
        results[category].push(imageData);
      }
    });

    Object.keys(results).forEach((key) => {
      results[key] = results[key].sort((a, b) => {
        // Main Image (Index 0) always comes first
        if (a.index === 0) return -1;
        if (b.index === 0) return 1;

        const orderA = categoryOrder[normalizeCategory(a.category)] ?? 999;
        const orderB = categoryOrder[normalizeCategory(b.category)] ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.index - b.index;
      });
    });

    return results;
  };

  useEffect(() => {
    if (clickedImageUrl && organizedImages.all.length > 0 && !isProcessing) {
      const clickedImage = organizedImages.all.find(img => img.url === clickedImageUrl);
      if (clickedImage && !showSlider) {
        // ALWAYS use ALL images
        const allIndex = organizedImages.all.findIndex(
          (img) => img.url === clickedImageUrl
        );
        if (allIndex >= 0) {
          const category = clickedImage.category || "exterior";
          setCurrentCategory(category);
          setSliderImages(organizedImages.all);
          setSliderIndex(allIndex);
          setShowSlider(true);
        }
      }
    }
  }, [organizedImages.all.length, clickedImageUrl, isProcessing]);

  useEffect(() => {
    if (isOpen && images.length > 0) {
      setCurrentCategory("all");
      setSliderImages([]);
      setSliderIndex(0);
      setShowSlider(false);
      setZoomLevel(1);
      setIsProcessing(false);

      const results = processImagesFromDatabase(categorizedImages);
      setOrganizedImages(results);

      if (clickedImageUrl) {
        const clickedImage = results.all.find(
          (img) => img.url === clickedImageUrl
        );
        if (clickedImage) {
          const allIndex = results.all.findIndex(
            (img) => img.url === clickedImageUrl
          );
          if (allIndex >= 0) {
            const category = clickedImage.category || "exterior";
            setCurrentCategory(category);
            setSliderImages(results.all);
            setSliderIndex(allIndex);
            setShowSlider(true);
          } else {
            setCurrentCategory("all");
          }
        }
      }
    } else if (!isOpen) {
      setIsProcessing(false);
      setProcessingStatus({});
      // Clear slider images to free memory when modal closes
      setSliderImages([]);
      setShowSlider(false);
    }
  }, [isOpen, images.length, clickedImageUrl, categorizedImages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      // Navigate to correct slide without loop mode
      if (swiperRef.current.swiper.activeIndex !== sliderIndex) {
        swiperRef.current.swiper.slideTo(sliderIndex, 0);
      }
    }
  }, [sliderIndex, sliderImages]);

  const handleCategoryClick = (category) => {
    if (showSlider) {
      // In slider mode, jump to the first image of the selected category
      const targetImages = organizedImages[category] || [];
      if (targetImages.length > 0) {
        const firstImgUrl = targetImages[0].url;
        const indexInAll = organizedImages.all.findIndex(
          (img) => img.url === firstImgUrl
        );
        if (indexInAll !== -1) {
          setSliderIndex(indexInAll);
        }
        setCurrentCategory(category);
      } else {
        // If category has no images, close slider to show "No photos found" message
        setShowSlider(false);
        setCurrentCategory(category);
      }
    } else {
      // Grid mode: standard filtering
      setCurrentCategory(category);
    }
  };

  const handleImageClick = (image, category) => {
    // Always use ALL images for scanner-like continuous workflow
    const allImages = organizedImages.all;
    const index = allImages.findIndex((img) => img.url === image.url);

    setSliderImages(allImages);
    setSliderIndex(index >= 0 ? index : 0);
    setCurrentCategory(image.category || "exterior");
    setShowSlider(true);
  };

  const handleSwiperNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const handleSwiperPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleZoom = () => {
    if (!showSlider) return;
    if (swiperRef.current && swiperRef.current.swiper) {
      const swiper = swiperRef.current.swiper;
      const currentScale = swiper.zoom.scale;
      if (currentScale < 1.5) swiper.zoom.in(2);
      else if (currentScale < 2.5) swiper.zoom.in(3);
      else swiper.zoom.out();
    }
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
  };

  const handleClose = () => {
    setShowSlider(false);
    setZoomLevel(1);
    if (document.fullscreenElement) document.exitFullscreen();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (showSlider) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handleSwiperPrev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleSwiperNext();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showSlider, sliderIndex, currentCategory, sliderImages]);

  if (!isOpen) return null;

  const categories = [
    "all",
    "exterior",
    "interior",
    "dashboard",
    "wheel",
    "engine",
    "documents",
    "keys",
  ];

  const currentImages = organizedImages[currentCategory] || [];

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-dark-main overflow-y-auto overflow-x-hidden h-screen w-screen">
      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .modal-swiper { width: 100%; height: 100%; }
        .modal-swiper .swiper-slide { display: flex; align-items: center; justify-content: center; height: 100% !important; }
        .swiper-zoom-container > img { max-height: 85vh !important; width: auto !important; object-fit: contain; }
      `}} />

      <div className="w-full sticky top-0 left-0 z-[110] bg-white dark:bg-dark-main ">
        <div className="max-w-[1600px] mx-auto px-0 md:px-20 py-3.5 flex justify-between items-center gap-0 md:gap-6">
          <div
            className="flex gap-4 overflow-x-auto whitespace-nowrap flex-1 scrollbar-hide px-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`text-base md:text-sm font-medium pb-1.5 relative transition-colors whitespace-nowrap flex-shrink-0 ${currentCategory === cat
                  ? "text-gray-900 dark:text-white underline underline-offset-2"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                style={{ paddingTop: '1px' }}
              >
                {capitalizeWord(cat)}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center ml-auto flex-shrink-0 pr-4 md:pr-0">
            <button
              onClick={handleClose}
              className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
              title="Close"
            >
              <span className="text-xl font-light">×</span>
            </button>
          </div>
        </div>

        {/* Navigation Controls (Top layout for Desktop) */}
        {showSlider && (
          <div className="hidden md:flex max-w-[1600px] mx-auto px-4 md:px-20 pb-3 justify-center items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-3">
            {/* Compact Chevron Navigation */}
            <button
              onClick={handleSwiperPrev}
              className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
              aria-label="Previous image"
            >
              <IoIosArrowBack className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <button
              onClick={handleSwiperNext}
              className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
              aria-label="Next image"
            >
              <IoIosArrowForward className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Zoom & Fullscreen - Desktop only */}
            <div className="hidden md:flex gap-2 ml-2">
              <button
                onClick={handleZoom}
                className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                title="Zoom"
              >
                <span className="text-lg font-bold">+</span>
              </button>
              <button
                onClick={handleFullscreen}
                className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                title="Full Screen"
              >
                <span className="text-base">⛶</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto px-0 md:px-20 py-5">
        {isProcessing && (
          <div className="mb-5 text-center text-white">
            <div className="inline-block w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin mb-2"></div>
            <p className="text-sm">
              Processing image {processingStatus.current} of {processingStatus.total}...
            </p>
          </div>
        )}

        {!showSlider && (
          <>
            <div className="flex justify-end mb-4 px-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-900/50 px-3 py-1 rounded-full">
                {currentCategory === "all"
                  ? `Total: ${currentImages.length}`
                  : `${capitalizeWord(currentCategory)}: ${currentImages.length}`}
              </span>
            </div>

            {currentImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 p-3">
                {currentImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(image, currentCategory)}
                    className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg aspect-[3/2] relative group"
                  >
                    <img
                      src={image.url}
                      alt={image.detected_label || "Car image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.backgroundColor = '#f3f4f6';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-16 text-center border border-gray-200 dark:border-gray-800 m-3 my-auto">
                <div className="text-6xl mb-5 opacity-30">📷</div>
                <div className="text-xl text-gray-600 dark:text-gray-400">
                  No photos found in this category
                </div>
              </div>
            )}
          </>
        )}

        {showSlider && sliderImages.length > 0 && (
          <>
            <div className="flex items-center justify-center my-1 relative h-[85vh] w-full overflow-hidden">
              <div className="flex items-center justify-center relative w-full h-full">
                <Swiper
                  ref={swiperRef}
                  key={`slider-${sliderImages.length}`}
                  modules={[Zoom, Navigation, A11y]}
                  zoom={{ maxRatio: 2, toggle: true }}
                  spaceBetween={10}
                  slidesPerView={1}
                  grabCursor={true}
                  initialSlide={sliderIndex}
                  onSlideChange={(swiper) => {
                    const idx = swiper.activeIndex;
                    setSliderIndex(idx);
                    if (sliderImages[idx]) {
                      const newCat = sliderImages[idx].category;
                      if (newCat && newCat !== currentCategory) {
                        setCurrentCategory(newCat);
                      }
                    }
                  }}
                  className="modal-swiper !h-full !w-full"
                  cssMode={true}
                  resistance={true}
                  resistanceRatio={0.8}
                >
                  {sliderImages.map((img, index) => (
                    <SwiperSlide key={`${img.url}-${index}`}>
                      <div className="swiper-zoom-container">
                        <img
                          src={img.url}
                          alt={img.detected_label || "Gallery image"}
                          className="rounded-none md:rounded-2xl shadow-2xl bg-gray-100 dark:bg-gray-900"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.src = "/images/hamer1.png";
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Desktop: Bottom Right Counter */}
                <div className="fixed bottom-4 right-4 text-white dark:text-white text-lg md:text-base font-medium z-[110] bg-gray-900/70 dark:bg-black/70 px-3 py-2 rounded">
                  {sliderIndex + 1} of {sliderImages.length}
                </div>

                {/* Mobile: Bottom Centered Arrows */}
                <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-[110]">
                  <button
                    onClick={handleSwiperPrev}
                    className="h-12 w-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/80 text-white transition-all shadow-lg active:scale-95"
                    aria-label="Previous image"
                  >
                    <IoIosArrowBack className="w-6 h-6 -ml-1 text-white" />
                  </button>

                  <button
                    onClick={handleSwiperNext}
                    className="h-12 w-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/80 text-white transition-all shadow-lg active:scale-95"
                    aria-label="Next image"
                  >
                    <IoIosArrowForward className="w-6 h-6 ml-1 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}