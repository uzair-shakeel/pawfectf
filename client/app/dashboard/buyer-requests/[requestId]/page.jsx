"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { getAdoptionRequestById } from "../../../../services/adoptionRequestService";
import { toast } from "react-hot-toast";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiInfo,
  FiMapPin,
  FiTag,
  FiCheck,
} from "react-icons/fi";
import { TbCar } from "react-icons/tb";

const BuyerRequestDetailPage = ({ params }) => {
  const { requestId } = React.use(params);
  const router = useRouter();
  const { userId, getToken } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBuyer, setIsBuyer] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (userId) {
      fetchRequest();
    }
  }, [userId, requestId]);

  const fetchRequest = async () => {
    try {
      const data = await getAdoptionRequestById(requestId);
      setRequest(data);
      // Check if the current user is the buyer who created this request
      setIsBuyer(data.buyerId === userId);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching request:", error);
      toast.error("Failed to load buyer request");
      router.push("/dashboard/buyer-requests");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDaysLeft = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex justify-center p-6 items-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Request not found</p>
          <Link
            href="/dashboard/buyer-requests"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Buyer Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6  max-w-7xl">
      <div className="mb-6">
        <Link
          href={
            isBuyer
              ? "/dashboard/buyer-requests"
              : "/dashboard/seller-opportunities"
          }
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          {isBuyer ? "Back to My Requests" : "Back to Buyer Requests"}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
                request.status === "Active"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : request.status === "Fulfilled"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : request.status === "Expired"
                  ? "bg-orange-100 text-orange-800 border-orange-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              {request.status}
            </span>
            {request.status === "Active" && (
              <span className="ml-3 text-sm text-gray-600 flex items-center">
                <FiClock className="mr-1" />
                {calculateDaysLeft(request.expiryDate)} days left
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">
            Posted {formatDate(request.createdAt)}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          {request.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center">
            <FiDollarSign className="text-gray-400 mr-3 text-xl" />
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-semibold text-green-600">
                {request.budgetMin
                  ? `$${request.budgetMin.toLocaleString()} - $${request.budgetMax.toLocaleString()}`
                  : `Up to $${request.budgetMax.toLocaleString()}`}
              </p>
            </div>
          </div>

          {request.make && request.model && (
            <div className="flex items-center">
              <TbCar className="text-gray-400 mr-3 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-semibold">
                  {request.make} {request.model}
                </p>
              </div>
            </div>
          )}

          {request.type && (
            <div className="flex items-center">
              <FiTag className="text-gray-400 mr-3 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Vehicle Type</p>
                <p className="font-semibold">{request.type}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="font-semibold text-lg mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {request.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-semibold text-lg mb-4 pb-2 border-b">
              Vehicle Details
            </h2>
            <div className="space-y-4">
              {request.preferredCondition &&
                request.preferredCondition !== "Any" && (
                  <div className="flex items-start">
                    <FiInfo className="mr-3 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Preferred Condition
                      </p>
                      <p className="font-medium">
                        {request.preferredCondition}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-4 pb-2 border-b">
              Preferred Features
            </h2>
            {request.preferredFeatures &&
            request.preferredFeatures.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {request.preferredFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <FiCheck className="mr-2 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specific features requested</p>
            )}
          </div>
        </div>

        {!isBuyer && (
          <div className="mt-8 pt-6 border-t">
            <Link
              href={`/dashboard/seller-opportunities/${requestId}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Make an Offer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerRequestDetailPage;
