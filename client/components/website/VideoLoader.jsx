"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VideoLoader = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Make sure the loader shows for at least 5 seconds for better user experience
    // Make sure the loader shows for at least 5 seconds for better user experience
    const minimumLoadingTime = 500; // 5 seconds
    const startTime = Date.now();

    // Create more realistic loading simulation
    let speed = 10; // Initial speed - faster at start
    let currentProgress = 0;

    const interval = setInterval(() => {
      // Simulate real loading behavior with varying speeds
      if (currentProgress < 30) speed = 10;
      else if (currentProgress < 60) speed = 8;
      else if (currentProgress < 80) speed = 4;
      else if (currentProgress < 90) speed = 2;
      else speed = 1;

      // Add some randomness to make it feel more natural
      const increment = Math.random() * speed + speed / 2;

      currentProgress += increment;

      if (currentProgress >= 100) {
        clearInterval(interval);
        currentProgress = 100;

        // Make sure we've shown the loader for at least the minimum time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

        // Add a delay before hiding the loader
        setTimeout(() => {
          setLoading(false);
          // Dispatch event to notify that loading is complete
          window.dispatchEvent(new Event("loaderComplete"));

          // Make sure the loading-active class is removed
          document.documentElement.classList.remove("loading-active");
        }, remainingTime + 500); // Extra 500ms for smooth transition
      }

      setProgress(currentProgress);
    }, 200);

    // Detect when page is fully loaded
    const handleLoad = () => {
      // When the page is loaded, quickly finish the loading animation
      const quickFinish = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(quickFinish);

            // Make sure we've shown the loader for at least the minimum time
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

            setTimeout(() => {
              setLoading(false);
              // Dispatch event to notify that loading is complete
              window.dispatchEvent(new Event("loaderComplete"));

              // Make sure the loading-active class is removed
              document.documentElement.classList.remove("loading-active");
            }, remainingTime + 500); // Extra 500ms for smooth transition
            return 100;
          }
          return newProgress;
        });
      }, 50);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  // Play the video once when mounted
  useEffect(() => {
    if (videoRef.current) {
      // Set video to not loop
      videoRef.current.loop = false;

      // Play video
      videoRef.current.play().catch((error) => {
        console.error("Video play error:", error);
        setVideoError(true);
      });

      // Handle video loading errors
      videoRef.current.addEventListener("error", () => {
        setVideoError(true);
      });

      // Handle video end - freeze on last frame
      videoRef.current.addEventListener("ended", () => {
        // When video ends, get the current time and set it again to prevent reset
        const currentTime = videoRef.current.duration;
        if (currentTime) {
          // Set to slightly before end to avoid potential black frame
          videoRef.current.currentTime = currentTime - 0.01;
        }
      });
    }

    // Clean up event listeners
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("error", () => {
          setVideoError(true);
        });
        videoRef.current.removeEventListener("ended", () => {});
      }
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[9999] bg-white pointer-events-auto"
          style={{ pointerEvents: loading ? "auto" : "none" }}
          onAnimationComplete={() => {
            if (!loading) {
              // Extra safety to ensure the loading-active class is removed
              document.documentElement.classList.remove("loading-active");
            }
          }}
        >
          <div className="relative w-full h-full">
            {/* Top progress bar */}
            <div className="absolute top-0 left-0 right-0 z-10 h-1.5 bg-gray-200">
              <motion.div
                className="h-full bg-black rounded-r-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </div>

            {/* Full-screen Video */}
            {!videoError ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain md:object-cover"
                src="/Horse bodybuilder-02.mp4"
                muted
                playsInline
              ></video>
            ) : (
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                {/* Simple loading indicator for video error case */}
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoLoader;
