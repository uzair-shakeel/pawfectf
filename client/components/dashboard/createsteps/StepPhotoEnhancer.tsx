"use client";
import { useState } from "react";
import ImageEditor from "../ImageEditor";

interface StepPhotoEnhancerProps {
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: any) => void;
  formData: any;
}

const StepPhotoEnhancer: React.FC<StepPhotoEnhancerProps> = ({
  nextStep,
  prevStep,
  updateFormData,
  formData,
}) => {
  // Handle image updates from the ImageEditor component
  const handleImageUpdate = (newImages: File[], newImagePreviews: string[]) => {
    updateFormData({
      ...formData,
      images: newImages,
      imagePreviews: newImagePreviews,
    });
  };

  // Handle image removal from the ImageEditor component
  const handleImageRemove = (index: number) => {
    updateFormData({
      ...formData,
      images: formData.images.filter((_: any, i: number) => i !== index),
      imagePreviews: formData.imagePreviews.filter(
        (_: any, i: number) => i !== index
      ),
    });
  };

  return (
    <div className="bg-white rounded-lg w-full">
      <h2 className="text-xl font-bold mb-4">Step 2: Enhance Your Images</h2>
      <div className="mb-6">
        <ImageEditor
          images={formData.images || []}
          imagePreviews={formData.imagePreviews || []}
          onUpdate={handleImageUpdate}
          onRemove={handleImageRemove}
          maxImages={10}
        />
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepPhotoEnhancer;
 