import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiTrash2,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";
import { MdPets } from "react-icons/md";
import { petApi } from "../services/api";
import toast from "react-hot-toast";

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMake, setFilterMake] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    fetchPetStats();
    fetchPets();
  }, [currentPage, searchTerm, filterMake, filterStatus, filterCondition]);

  const fetchPetStats = async () => {
    try {
      const response = await petApi.getPetStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching pet stats:", error);
      toast.error("Failed to fetch pet statistics");
    }
  };

  const fetchPets = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        make: filterMake || undefined,
        status: filterStatus || undefined,
        condition: filterCondition || undefined,
      };

      const response = await petApi.getAllPets(params);
      setPets(response.data.pets);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching pets:", error);
      toast.error("Failed to fetch pets");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (petId, newStatus) => {
    try {
      await petApi.updatePetStatus(petId, newStatus);
      toast.success("Pet status updated successfully");
      fetchPets();
      fetchPetStats();
    } catch (error) {
      console.error("Error updating pet status:", error);
      toast.error("Failed to update pet status");
    }
  };

  const handleDeletePet = async () => {
    try {
      await petApi.deletePet(petToDelete._id);
      toast.success("Pet deleted successfully");
      setShowDeleteModal(false);
      setPetToDelete(null);
      fetchPets();
      fetchPetStats();
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Failed to delete pet");
    }
  };

  const handleViewPet = (pet) => {
    setSelectedPet(pet);
    setShowPetModal(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterMake("");
    setFilterStatus("");
    setFilterCondition("");
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-md font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-200 mt-1">{value}</p>
        </div>
        <div
          className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading pets...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Pets Management</h1>
          <p className="text-slate-400 mt-1">Manage all pets in the system</p>
        </div>
        <button
          onClick={fetchPets}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <FiRefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pets"
          value={stats.totalPets?.toLocaleString() || "0"}
          icon={MdPets}
          color="blue"
        />
        <StatCard
          title="Approved"
          value={
            stats.petsByStatus?.find((s) => s._id === "Approved")?.count || 0
          }
          icon={MdPets}
          color="green"
        />
        <StatCard
          title="Pending"
          value={
            stats.petsByStatus?.find((s) => s._id === "Pending")?.count || 0
          }
          icon={MdPets}
          color="yellow"
        />
        <StatCard
          title="Top Breed"
          value={stats.petsByMake?.[0]?._id || "N/A"}
          icon={MdPets}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterMake}
            onChange={(e) => setFilterMake(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Breeds</option>
            {stats.petsByMake?.map((make) => (
              <option key={make._id} value={make._id}>
                {make._id}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Conditions</option>
            <option value="excellent">Excellent</option>
            <option value="very-good">Very Good</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>

          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FiFilter size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Pets Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pets.map((pet) => (
          <motion.div
            key={pet._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-200"
          >
            {/* Pet Image */}
            <div className="relative h-48 bg-slate-800">
              {pet.images && pet.images.length > 0 ? (
                <img
                  src={pet.images[0]}
                  alt={`${pet.make} ${pet.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MdPets className="h-16 w-16 text-slate-600" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    pet.status
                  )}`}
                >
                  {pet.status}
                </span>
              </div>

              {/* Price Badge */}
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 bg-slate-900/80 text-slate-200 rounded-lg text-md font-bold">
                  {formatPrice(pet.financialInfo?.priceNetto)}
                </span>
              </div>
            </div>

            {/* Pet Details */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-200 mb-1">
                {pet.make} {pet.model}
              </h3>
              <p className="text-slate-400 text-md mb-2">{pet.year}</p>

              <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                <span>{pet.petCondition?.overall || "N/A"}</span>
                <span>{pet.mileage || "N/A"} km</span>
              </div>

              <div className="text-sm text-slate-400 mb-4">
                <p>
                  Owner: {pet.createdBy?.firstName} {pet.createdBy?.lastName}
                </p>
                <p>Added: {new Date(pet.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <select
                  value={pet.status}
                  onChange={(e) => handleStatusChange(pet._id, e.target.value)}
                  className="text-sm bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewPet(pet)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    title="View Details"
                  >
                    <FiEye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setPetToDelete(pet);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete Pet"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum
                    ? "bg-blue-500 text-white"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-700">
              <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-slate-200">
                      Delete Pet
                    </h3>
                    <div className="mt-2">
                      <p className="text-md text-slate-400">
                        Are you sure you want to delete {petToDelete?.make}{" "}
                        {petToDelete?.model} ({petToDelete?.year})? This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeletePet}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-md"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPetToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Pet Details Modal */}
      {showPetModal && selectedPet && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-slate-700">
              <div className="bg-slate-800 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl leading-6 font-bold text-slate-200">
                    {selectedPet.make} {selectedPet.model} ({selectedPet.year})
                  </h3>
                  <div
                    className={`px-3 py-1 rounded-full text-md font-medium border ${getStatusColor(
                      selectedPet.status
                    )}`}
                  >
                    {selectedPet.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Images */}
                  <div>
                    {selectedPet.images && selectedPet.images.length > 0 ? (
                      <div className="space-y-4">
                        <img
                          src={selectedPet.images[0]}
                          alt={`${selectedPet.make} ${selectedPet.model}`}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        {selectedPet.images.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {selectedPet.images
                              .slice(1, 5)
                              .map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`${selectedPet.make} ${selectedPet.model}`}
                                  className="h-16 w-full object-cover rounded"
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                        <MdPets className="h-16 w-16 text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Price
                        </label>
                        <p className="text-lg font-bold text-green-400">
                          {formatPrice(selectedPet.financialInfo?.priceNetto)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Condition
                        </label>
                        <p className="text-slate-200">
                          {selectedPet.petCondition?.overall || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Mileage
                        </label>
                        <p className="text-slate-200">
                          {selectedPet.mileage || "N/A"} km
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          VIN
                        </label>
                        <p className="text-slate-200">
                          {selectedPet.vin || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Fuel Type
                        </label>
                        <p className="text-slate-200">
                          {selectedPet.fuelType || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Transmission
                        </label>
                        <p className="text-slate-200">
                          {selectedPet.transmission || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-md font-medium text-slate-400">
                        Owner
                      </label>
                      <p className="text-slate-200">
                        {selectedPet.createdBy?.firstName}{" "}
                        {selectedPet.createdBy?.lastName}
                      </p>
                      <p className="text-slate-400 text-md">
                        {selectedPet.createdBy?.email}
                      </p>
                    </div>

                    <div>
                      <label className="block text-md font-medium text-slate-400">
                        Description
                      </label>
                      <p className="text-slate-200 text-md">
                        {selectedPet.description || "No description available"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-md font-medium text-slate-400">
                        Added
                      </label>
                      <p className="text-slate-200">
                        {new Date(selectedPet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 px-6 py-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    setShowPetModal(false);
                    setSelectedPet(null);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pets;
