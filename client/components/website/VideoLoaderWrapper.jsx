"use client";
import React, { useState, useEffect } from "react";
import VideoLoader from "./VideoLoader";

// Initial placeholder loader that displays immediately
const LoaderPlaceholder = () => (
  <div className="fixed inset-0 z-[9999] bg-white">
    {/* Simple top progress bar */}
    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200">
      <div className="h-full w-1/4 bg-black animate-pulse"></div>
    </div>
  </div>
);

const VideoLoaderWrapper = () => {
  const [mounted, setMounted] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Make sure component is mounted before rendering
  useEffect(() => {
    setMounted(true);

    // Check if loading-active class is present and if we're on home page
    const hasLoadingClass =
      document.documentElement.classList.contains("loading-active");
    const isHomePage =
      window.location.pathname === "/" || window.location.pathname === "";

    setShouldShow(hasLoadingClass && isHomePage);

    // Set up cleanup function
    return () => {
      // Make sure loading-active class is removed when this component unmounts
      document.documentElement.classList.remove("loading-active");
    };
  }, []);

  // Handle chunk loading errors
  useEffect(() => {
    const handleChunkError = (event) => {
      console.error("Chunk loading error:", event);
      if (retryCount < 3) {
        setRetryCount((prev) => prev + 1);
        // Retry after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    window.addEventListener("error", handleChunkError);
    return () => window.removeEventListener("error", handleChunkError);
  }, [retryCount]);

  if (!mounted) return <LoaderPlaceholder />;

  // Only show loader if loading-active class is present
  if (!shouldShow) {
    return null;
  }

  try {
    return <VideoLoader />;
  } catch (error) {
    console.error("Error loading VideoLoader:", error);
    return <LoaderPlaceholder />;
  }
};

export default VideoLoaderWrapper;
