import React from "react";
import { FaCar, FaGasPump } from "react-icons/fa";
import { FaDeviantart } from "react-icons/fa";
import { PiEngineBold } from "react-icons/pi";
import { FaRegImage } from "react-icons/fa6";
import { optimizeCloudinaryUrl } from "../../lib/imageUtils";

const CarCard = () => {
  const formatCarImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500";
    let finalUrl;
    if (typeof imagePath === "string" && /^(https?:)?\/\//i.test(imagePath)) {
      finalUrl = imagePath;
    } else {
      finalUrl = `${API_BASE}/${String(imagePath).replace("\\", "/")}`;
    }
    return optimizeCloudinaryUrl(finalUrl, 800);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 w-full">
      {/* Image Section */}
      <div className="relative">
        <img
          src={formatCarImage("https://via.placeholder.com/300")} // Replace with actual image source
          alt="Car"
          className="w-full h-52 object-cover"
        />
        {/* Tags */}
        <div className="absolute top-2 left-2 flex gap-2">
          <span className="bg-black bg-opacity-60 text-white text-xs flex items-center px-2 py-1 rounded-lg">
            <FaRegImage className="mr-1" />
            6
          </span>
        </div>
        <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-lg">
          2024
        </span>
      </div>

      {/* Car Details */}
      <div className="p-4">
        <span className="text-blue-500 text-sm font-medium">Sedan</span>
        <h2 className="text-lg font-semibold mt-1">2017 BMW X1 xDrive 20d xLine</h2>

        {/* Car Specs */}
        <div className="flex items-center text-gray-600 text-sm gap-4 mt-2">
          <div className="flex items-center">
            <PiEngineBold className="mr-1 text-gray-500" />
            1.8 L
          </div>
          <div className="flex items-center">
            <FaGasPump className="mr-1 text-gray-500" />
            Diesel
          </div>
          <div className="flex items-center">
            <FaDeviantart className="mr-1 text-gray-500" />
            Automatic
          </div>
        </div>

        {/* Pricing */}
        <div className="text-2xl font-medium text-blue-600 mt-2">$2250</div>

        {/* User Info & Button */}
        <div className="flex items-center justify-between mt-4 gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <span className="ml-2 font-medium text-gray-700">Kathryn Murphy</span>
          </div>
          <button className="flex items-center gap-1 px-2 py-2 text-blue-600 font-medium border border-blue-600 rounded-lg hover:bg-blue-50">
            View details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
