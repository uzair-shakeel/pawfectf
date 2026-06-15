"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MdPhotoFilter,
  MdArrowBack,
  MdAutoFixHigh,
  MdCrop,
} from "react-icons/md";
import { FaEdit, FaTrash, FaCar } from "react-icons/fa";
import { FiUpload, FiDownload, FiRefreshCw } from "react-icons/fi";

/**
 * ImageEditor component that provides a UI for editing car images
 * with integrated photo enhancement features
 */
export default function ImageEditor({
  images,
  imagePreviews,
  onUpdate,
  onRemove,
  maxImages = 10,
}) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  });
  const [showBlurBox, setShowBlurBox] = useState(false);
  const [blurBoxCoordinates, setBlurBoxCoordinates] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 50,
  });
  const [isDraggingBlurBox, setIsDraggingBlurBox] = useState(false);
  const [blurBoxDragStartPosition, setBlurBoxDragStartPosition] = useState({
    x: 0,
    y: 0,
  });
  const blurBoxRef = useRef(null);
  const [isBlurringPlate, setIsBlurringPlate] = useState(false);
  const [plateBlurError, setPlateBlurError] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Check if there are any edited images when component mounts
  useEffect(() => {
    const checkForEditedImages = () => {
      try {
        const storedData = localStorage.getItem("carFormData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);

          // If we have edited images, update the form data
          if (
            parsedData.editComplete &&
            parsedData.images &&
            parsedData.imagePreviews
          ) {
            onUpdate(parsedData.images, parsedData.imagePreviews);

            // Clear the edit complete flag
            const updatedData = { ...parsedData, editComplete: false };
            localStorage.setItem("carFormData", JSON.stringify(updatedData));
          }
        }
      } catch (error) {
        console.error("Error checking for edited images:", error);
      }
    };

    checkForEditedImages();
  }, [onUpdate]);

  // Handle image upload
  const handleImageUpload = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length + images.length > maxImages) {
        alert(`You can upload a maximum of ${maxImages} images.`);
        return;
      }

      // Generate previews
      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file)
      );

      // Update parent component
      onUpdate(
        [...images, ...selectedFiles],
        [...imagePreviews, ...newPreviews]
      );
    }
  };

  // Handle editing an image
  const handleEditImage = (index) => {
    setSelectedImageIndex(index);
    setShowEnhancer(true);
  };

  // Apply filters to the selected image
  const applyFilters = () => {
    if (selectedImageIndex === null) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      // Apply filters
      ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`;
      ctx.drawImage(img, 0, 0);

      // Convert to blob and create new file
      canvas.toBlob((blob) => {
        const file = new File(
          [blob],
          `edited-car-image-${selectedImageIndex}.png`,
          { type: "image/png" }
        );

        // Update the image and preview
        const newImages = [...images];
        const newPreviews = [...imagePreviews];
        newImages[selectedImageIndex] = file;
        newPreviews[selectedImageIndex] = URL.createObjectURL(file);

        onUpdate(newImages, newPreviews);
      }, "image/png");
    };
    img.src = imagePreviews[selectedImageIndex];
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
    });
  };

  // Handle blur box for license plate
  const handleBlurBoxMouseDown = (e) => {
    if (!showBlurBox) return;
    setIsDraggingBlurBox(true);
    setBlurBoxDragStartPosition({
      x: e.clientX - blurBoxCoordinates.x,
      y: e.clientY - blurBoxCoordinates.y,
    });
  };

  const handleBlurBoxMouseMove = (e) => {
    if (!isDraggingBlurBox) return;
    setBlurBoxCoordinates({
      ...blurBoxCoordinates,
      x: e.clientX - blurBoxDragStartPosition.x,
      y: e.clientY - blurBoxDragStartPosition.y,
    });
  };

  const handleBlurBoxMouseUp = () => {
    setIsDraggingBlurBox(false);
  };

  // Blur license plate
  const blurLicensePlate = () => {
    if (selectedImageIndex === null) return;
    setIsBlurringPlate(true);
    setShowBlurBox(true);
  };

  // Open full photo enhancer
  const openFullEnhancer = (index) => {
    // Store the current form data in localStorage
    const formData = {
      images,
      imagePreviews,
      currentEditingImageIndex: index,
    };

    localStorage.setItem("carFormData", JSON.stringify(formData));

    // Navigate to the photo enhancer page
    router.push("/dashboard/photo-enhancer");
  };

  // Auto Enhance logic (showroom preset)
  const autoEnhance = () => {
    setFilters({
      brightness: 105,
      contrast: 115,
      saturation: 110,
      blur: 0,
    });
    // Immediately apply the changes
    applyFilters();
  };

  // Crop logic (simple 3:2 aspect ratio crop)
  const handleCrop = () => {
    setShowCropModal(true);
  };

  // Crop modal logic (minimal, 3:2 aspect ratio)
  const applyCrop = () => {
    if (selectedImageIndex === null) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // 3:2 aspect ratio
      const aspect = 3 / 2;
      let cropWidth = img.width;
      let cropHeight = Math.round(cropWidth / aspect);
      if (cropHeight > img.height) {
        cropHeight = img.height;
        cropWidth = Math.round(cropHeight * aspect);
      }
      const cropX = Math.round((img.width - cropWidth) / 2);
      const cropY = Math.round((img.height - cropHeight) / 2);
      const canvas = document.createElement("canvas");
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );
      canvas.toBlob((blob) => {
        const file = new File(
          [blob],
          `cropped-car-image-${selectedImageIndex}.png`,
          { type: "image/png" }
        );
        const newImages = [...images];
        const newPreviews = [...imagePreviews];
        newImages[selectedImageIndex] = file;
        newPreviews[selectedImageIndex] = URL.createObjectURL(file);
        onUpdate(newImages, newPreviews);
        setShowCropModal(false);
      }, "image/png");
    };
    img.src = imagePreviews[selectedImageIndex];
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-gray-700">
          Upload Images (1-{maxImages})
        </label>
        <div className="text-xs text-blue-500">
          Upload images and enhance them with our built-in editor
        </div>
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="text-base text-gray-500 file:mr-4 file:py-2 file:px-7 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 file:duration-300 border border-gray-300 p-1 w-auto rounded-md"
      />

      {imagePreviews?.length > 0 && (
        <div className="grid grid-cols-5 gap-2 mt-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditImage(index)}
                  className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  title="Quick Edit"
                >
                  <FaEdit />
                </button>
                <button
                  type="button"
                  onClick={() => openFullEnhancer(index)}
                  className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  title="Advanced Edit"
                >
                  <MdPhotoFilter />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  title="Remove"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Photo Enhancer Modal */}
      {showEnhancer && selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Quick Photo Editor</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => openFullEnhancer(selectedImageIndex)}
                  className="text-purple-500 hover:text-purple-700 flex items-center gap-1"
                >
                  <MdPhotoFilter /> Advanced Editor
                </button>
                <button
                  onClick={() => setShowEnhancer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={imagePreviews[selectedImageIndex]}
                  alt="Selected image"
                  className="w-full h-auto rounded-lg"
                  style={{
                    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`,
                  }}
                />
              </div>
              {/* Controls: Only 3 buttons */}
              <div className="flex flex-col gap-4 justify-center items-center">
                <button
                  onClick={autoEnhance}
                  className="bg-blue-500 text-white px-6 py-3 rounded flex items-center gap-2 text-lg w-full justify-center"
                >
                  <MdAutoFixHigh /> Auto Enhance
                </button>
                <button
                  onClick={blurLicensePlate}
                  className="bg-green-500 text-white px-6 py-3 rounded flex items-center gap-2 text-lg w-full justify-center"
                  disabled={isBlurringPlate}
                >
                  <FaCar /> {isBlurringPlate ? "Blurring..." : "Blur Plate"}
                </button>
                <button
                  onClick={handleCrop}
                  className="bg-purple-500 text-white px-6 py-3 rounded flex items-center gap-2 text-lg w-full justify-center"
                >
                  <MdCrop /> Crop
                </button>
              </div>
            </div>
            {/* Crop Modal */}
            {showCropModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                  <h3 className="text-lg font-semibold mb-4">Crop Image (3:2)</h3>
                  <img
                    src={imagePreviews[selectedImageIndex]}
                    alt="Crop Preview"
                    className="w-full object-contain mb-4"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowCropModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyCrop}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Apply Crop
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Blur Plate Error */}
            {plateBlurError && (
              <div className="mt-4 text-red-500 text-sm">{plateBlurError}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 