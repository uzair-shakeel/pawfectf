"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { useAuth } from "../../../lib/auth/AuthContext";
import {
  getUserById,
  updateUserSellerType,
} from "../../../services/userService";

const SellerTypePage = () => {
  const router = useRouter();
  const { userId, getToken } = useAuth(); // Added getToken
  const [selectedType, setSelectedType] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);
  const [sellerType, setSellerType] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data on page load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(userId);
        console.log("Fetched user data:", userData);
        setSellerType(userData.sellerType || null);
        setSelectedType(userData.sellerType || null);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    if (userId) loadUser();
  }, [userId]);

  // Handle seller type selection and update
  const handleSellerTypeSelection = async (type) => {
    setLoading(true);
    try {
      // Update local state
      setSellerType(type);
      setSelectedType(type);

      // Update sellerType in the backend
      await updateUserSellerType(userId, type, getToken); // Pass getToken
      console.log(`Seller type updated to: ${type}`);

      // Redirect to the next page
      router.push("/onboarding/seller-details");
    } catch (err) {
      console.error("Error updating seller type:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const privateSeller = () => {
    handleSellerTypeSelection("private");
  };

  const companySeller = () => {
    handleSellerTypeSelection("company");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-4">
            How will you be using Rofrof?
          </h1>
          <p className="text-lg text-gray-600">
            Select the type of account that fits you best
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Seller Option */}
          <div
            className={`relative bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all duration-300 ${selectedType === "company"
              ? "ring-2 ring-blue-500"
              : hoveredType === "company"
                ? "shadow-xl"
                : ""
              }`}
            onClick={companySeller}
            onMouseEnter={() => setHoveredType("company")}
            onMouseLeave={() => setHoveredType(null)}
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                Shelter / Organization
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Perfect for animal shelters, rescue organizations, and breeders.
              Get access to bulk listings, analytics, and adoption management tools.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Bulk pet listing management
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Advanced adoption analytics
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Priority support
              </li>
            </ul>
          </div>

          {/* Private Seller Option */}
          <div
            className={`relative bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all duration-300 ${selectedType === "private"
              ? "ring-2 ring-blue-500"
              : hoveredType === "private"
                ? "shadow-xl"
                : ""
              }`}
            onClick={privateSeller}
            onMouseEnter={() => setHoveredType("private")}
            onMouseLeave={() => setHoveredType(null)}
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                Private Adopter
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Ideal for individuals looking to adopt or re-home a pet. Simple
              and straightforward process with all essential features.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Easy pet listing creation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Adoption request tracking
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Standard support
              </li>
            </ul>
          </div>
        </div>

        {loading && (
          <div className="text-center mt-6">
            <p className="text-gray-600">Updating seller type...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerTypePage;
