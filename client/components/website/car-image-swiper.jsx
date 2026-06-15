"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function CarImageSwiper({ images = [], carId = "default" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isSeeMoreSlide = activeIndex === 3;

  // Early return if no images are provided
  if (!images || images.length === 0) {
    return (
      <div className="h-[230px] md:h-[250px] bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
  };

  return (
    <div
      className="h-[230px] md:h-[250px] relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: `.swiper-button-next-${carId}`,
          prevEl: `.swiper-button-prev-${carId}`,
        }}
        pagination={{
          clickable: true,
          type: "bullets",
          bulletClass:
            "swiper-pagination-bullet !w-2 !h-2 !bg-white/70 !opacity-100 !mx-1",
          bulletActiveClass: "!bg-white",
        }}
        onSlideChange={handleSlideChange}
        className="h-full w-full"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} className="relative h-full w-full">
            <Image
              src={image || "/placeholder.svg"}
              alt={`Car image ${index + 1}`}
              fill
              className="object-cover"
            />
            {index === 3 && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-sm font-medium">See More</span>
              </div>
            )}
          </SwiperSlide>
        ))}

        {/* Built-in pagination - will be rendered by Swiper */}
        <div className="swiper-pagination !bottom-2 !z-10"></div>
      </Swiper>

      {/* Navigation arrows - only visible on hover */}
      <div
        className={`swiper-button-prev-${carId} absolute left-2 top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <button className="h-8 w-8 bg-white/80 hidden md:flex items-center justify-center hover:bg-white rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
      <div
        className={`swiper-button-next-${carId} absolute right-2 top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200 ${
          isHovered && !isSeeMoreSlide ? "opacity-100" : "opacity-0"
        }`}
      >
        <button className="h-8 w-8 bg-white/80 hidden md:flex items-center justify-center hover:bg-white rounded-full">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default CarImageSwiper;
