"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../lib/auth/AuthContext";
import { getPetById, updatePet } from "../../../../../services/petService";

export default function EditCarPage() {
  const { carId } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    isFeatured: false,
    financialInfo: {
      priceNetto: "",
    },
  });

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const carData = await getPetById(carId);

        setFormData({
          title: carData.title || "",
          description: carData.description || "",
          make: carData.make || "",
          model: carData.model || "",
          year: carData.year || "",
          mileage: carData.mileage || "",
          isFeatured: carData.isFeatured || false,
          financialInfo: {
            priceNetto: carData.financialInfo?.priceNetto || "",
          },
        });
      } catch (err) {
        setError(err.message || "Failed to fetch car details");
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCar();
    }
  }, [carId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updateData = new FormData();
      updateData.append("title", formData.title);
      updateData.append("description", formData.description);
      updateData.append("make", formData.make);
      updateData.append("model", formData.model);
      updateData.append("year", formData.year);
      updateData.append("mileage", formData.mileage);
      // Ensure boolean is sent as string for reliable backend parsing
      updateData.append("isFeatured", String(formData.isFeatured));
      updateData.append("financialInfo[priceNetto]", formData.financialInfo.priceNetto);

      await updatePet(carId, updateData, getToken);
      alert("Car updated successfully!");
      router.push("/dashboard/cars");
    } catch (err) {
      setError(err.message || "Failed to update car");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading car details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 dark:bg-dark-main">
      <h1 className="text-3xl font-bold mb-6">Edit Car</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.financialInfo.priceNetto}
                onChange={(e) => setFormData({
                  ...formData,
                  financialInfo: { ...formData.financialInfo, priceNetto: e.target.value }
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Featured Car Checkbox */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                Mark as Featured Car
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Featured cars will be highlighted and shown prominently on the website
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push("/dashboard/cars")}
            className="px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Car"}
          </button>
        </div>
      </form>
    </div>
  );
}