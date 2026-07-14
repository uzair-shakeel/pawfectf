"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import {
  BuyerRequestInput,
  createAdoptionRequest,
} from "../../../../services/adoptionRequestService";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { toast } from "react-hot-toast";

const AddBuyerRequestPage = () => {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [carData, setCarData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BuyerRequestInput>({
    defaultValues: {
      preferredCondition: "Any",
      preferredFeatures: [],
      type: "",
    },
  });

  // Watch for make changes to update models
  const selectedMake = watch("make");

  // Fetch car makes and models from the JSON file
  useEffect(() => {
    fetch("/data/carMakesModels.json")
      .then((response) => response.json())
      .then((data) => {
        setCarData(data);
        const makes = Object.keys(data.makesAndModels);
        setMakes(makes);
      })
      .catch((error) => {
        console.error("Error fetching car data:", error);
      });
  }, []);

  // Update models when make changes
  useEffect(() => {
    if (selectedMake && carData) {
      const availableModels = carData.makesAndModels[selectedMake] || [];
      setModels(availableModels);
      // Reset model when make changes
      setValue("model", "");
    }
  }, [selectedMake, carData, setValue]);

  const onSubmit = async (data: BuyerRequestInput) => {
    if (!userId) {
      toast.error("You must be logged in to create a request");
      return;
    }

    setIsSubmitting(true);

    try {
      const getTokenFn = async () => {
        try {
          const token = await getToken();
          console.log("Token available for create:", !!token);
          return token;
        } catch (error) {
          console.error("Error getting token for create:", error);
          return null;
        }
      };

      await createAdoptionRequest(data, getTokenFn);
      toast.success("Request created successfully!");
      router.push("/dashboard/buyer-requests");
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error(error.response?.data?.message || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const carFeatures = [
    "Air Conditioning",
    "Leather Seats",
    "Navigation System",
    "Backup Camera",
    "Bluetooth",
    "Sunroof",
    "Heated Seats",
    "Parking Sensors",
    "Cruise Control",
    "Keyless Entry",
  ];

  const vehicleTypes = [
    "Sedan",
    "SUV",
    "Truck",
    "Coupe",
    "Convertible",
    "Wagon",
    "Van",
    "Hatchback",
    "Pickup",
    "Minivan",
    "Crossover",
    "Luxury",
    "Sports",
    "Electric",
    "Hybrid",
    "Classic",
    "Off-road",
    "Camper/RV",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create Car Request</h1>
        <p className="text-gray-600 mb-6">
          Tell sellers what you're looking for and receive offers directly from
          them.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-md font-medium text-gray-700 mb-1"
            >
              Request Title *
            </label>
            <input
              id="title"
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., Looking for a family SUV in good condition"
            />
            {errors.title && (
              <p className="text-red-500 text-md mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-md font-medium text-gray-700 mb-1"
            >
              Detailed Description *
            </label>
            <textarea
              id="description"
              rows={5}
              {...register("description", {
                required: "Description is required",
              })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what you're looking for in detail. Include any specific requirements or preferences."
            />
            {errors.description && (
              <p className="text-red-500 text-md mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Car Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Make */}
            <div>
              <label
                htmlFor="make"
                className="block text-md font-medium text-gray-700 mb-1"
              >
                Make (Optional)
              </label>
              <select
                id="make"
                {...register("make")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Make</option>
                {makes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label
                htmlFor="model"
                className="block text-md font-medium text-gray-700 mb-1"
              >
                Model (Optional)
              </label>
              <select
                id="model"
                {...register("model")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedMake}
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-md font-medium text-gray-700 mb-1"
              >
                Vehicle Type (Optional)
              </label>
              <select
                id="type"
                {...register("type")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label
                htmlFor="budgetMin"
                className="block text-md font-medium text-gray-700 mb-1"
              >
                Budget Min (Optional)
              </label>
              <input
                id="budgetMin"
                type="number"
                {...register("budgetMin", {
                  min: { value: 0, message: "Budget must be positive" },
                })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum budget"
              />
              {errors.budgetMin && (
                <p className="text-red-500 text-md mt-1">
                  {errors.budgetMin.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="budgetMax"
                className="block text-md font-medium text-gray-700 mb-1"
              >
                Budget Max *
              </label>
              <input
                id="budgetMax"
                type="number"
                {...register("budgetMax", {
                  required: "Maximum budget is required",
                  min: { value: 0, message: "Budget must be positive" },
                })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maximum budget"
              />
              {errors.budgetMax && (
                <p className="text-red-500 text-md mt-1">
                  {errors.budgetMax.message}
                </p>
              )}
            </div>

            {/* Preferred Condition */}
            <div>
              <label
                htmlFor="preferredCondition"
                className="block text-md font-medium text-gray-700 mb-1"
              >
                Preferred Condition (Optional)
              </label>
              <select
                id="preferredCondition"
                {...register("preferredCondition")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Any">Any</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="Demo">Demo</option>
                <option value="Slightly Used">Slightly Used</option>
              </select>
            </div>

            {/* Preferred Features */}
            <div className="md:col-span-2">
              <label className="block text-md font-medium text-gray-700 mb-1">
                Preferred Features (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {carFeatures.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`feature-${feature}`}
                      value={feature}
                      {...register("preferredFeatures")}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`feature-${feature}`}
                      className="text-md text-gray-700"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Create Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBuyerRequestPage;
