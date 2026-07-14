import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiTrash2,
  FiEye,
  FiFileText,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUser,
} from "react-icons/fi";
import { sellerOfferApi } from "../services/api";
import toast from "react-hot-toast";

const SellerOffers = () => {
  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    fetchOfferStats();
    fetchOffers();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchOfferStats = async () => {
    try {
      const response = await sellerOfferApi.getSellerOfferStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching offer stats:", error);
      toast.error("Failed to fetch offer statistics");
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        status: filterStatus || undefined,
      };

      const response = await sellerOfferApi.getAllSellerOffers(params);
      setOffers(response.data.offers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to fetch seller offers");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (offerId, newStatus) => {
    try {
      await sellerOfferApi.updateSellerOfferStatus(offerId, newStatus);
      toast.success("Offer status updated successfully");
      fetchOffers();
      fetchOfferStats();
    } catch (error) {
      console.error("Error updating offer status:", error);
      toast.error("Failed to update offer status");
    }
  };

  const handleDeleteOffer = async () => {
    try {
      await sellerOfferApi.deleteSellerOffer(offerToDelete._id);
      toast.success("Seller offer deleted successfully");
      setShowDeleteModal(false);
      setOfferToDelete(null);
      fetchOffers();
      fetchOfferStats();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const handleViewOffer = (offer) => {
    setSelectedOffer(offer);
    setShowOfferModal(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
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
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "withdrawn":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="h-4 w-4" />;
      case "accepted":
        return <FiCheckCircle className="h-4 w-4" />;
      case "rejected":
        return <FiXCircle className="h-4 w-4" />;
      case "withdrawn":
        return <FiXCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
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
        <div className="text-slate-400">Loading seller offers...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Seller Offers</h1>
          <p className="text-slate-400 mt-1">
            Manage all seller offers in the system
          </p>
        </div>
        <button
          onClick={fetchOffers}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <FiRefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Offers"
          value={stats.totalOffers?.toLocaleString() || "0"}
          icon={FiFileText}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={
            stats.offersByStatus?.find((s) => s._id === "pending")?.count || 0
          }
          icon={FiClock}
          color="yellow"
        />
        <StatCard
          title="Accepted"
          value={
            stats.offersByStatus?.find((s) => s._id === "accepted")?.count || 0
          }
          icon={FiCheckCircle}
          color="green"
        />
        <StatCard
          title="Avg Price"
          value={formatPrice(stats.averageOfferPrice)}
          icon={FiFileText}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
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

      {/* Offers Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <motion.div
            key={offer._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Offer #{offer._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-slate-400 text-md">
                  {offer.requestId?.make} {offer.requestId?.model}
                </p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(
                  offer.status
                )}`}
              >
                {getStatusIcon(offer.status)}
                <span>{offer.status}</span>
              </div>
            </div>

            {/* Offer Price */}
            <div className="mb-4 p-3 bg-slate-800/30 rounded-lg">
              <p className="text-slate-400 text-md">Offer Price</p>
              <p className="text-2xl font-bold text-green-400">
                {formatPrice(offer.price)}
              </p>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-2 mb-4 text-md">
              <div className="flex justify-between">
                <span className="text-slate-400">Year:</span>
                <span className="text-slate-200">{offer.year || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mileage:</span>
                <span className="text-slate-200">
                  {offer.mileage || "N/A"} km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Condition:</span>
                <span className="text-slate-200">
                  {offer.condition || "N/A"}
                </span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="mb-4 p-3 bg-slate-800/30 rounded-lg">
              <p className="text-slate-400 text-sm">Seller</p>
              <p className="text-slate-200 text-md font-medium">
                {offer.sellerId?.firstName} {offer.sellerId?.lastName}
              </p>
              <p className="text-slate-400 text-sm">{offer.sellerId?.email}</p>
            </div>

            {/* Buyer Request Info */}
            <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
              <p className="text-slate-400 text-sm">Buyer Request</p>
              <p className="text-slate-200 text-md">
                Budget: {formatPrice(offer.requestId?.budgetMin)} -{" "}
                {formatPrice(offer.requestId?.budgetMax)}
              </p>
              <p className="text-slate-400 text-sm">
                By: {offer.requestId?.buyerId?.firstName}{" "}
                {offer.requestId?.buyerId?.lastName}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <select
                value={offer.status}
                onChange={(e) => handleStatusChange(offer._id, e.target.value)}
                className="text-sm bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewOffer(offer)}
                  className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  title="View Details"
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => {
                    setOfferToDelete(offer);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete Offer"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">
                Created: {new Date(offer.createdAt).toLocaleDateString()}
              </p>
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
                      Delete Offer
                    </h3>
                    <div className="mt-2">
                      <p className="text-md text-slate-400">
                        Are you sure you want to delete this seller offer of{" "}
                        {formatPrice(offerToDelete?.price)}? This action cannot
                        be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteOffer}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-md"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOfferToDelete(null);
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

      {/* Offer Details Modal */}
      {showOfferModal && selectedOffer && (
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
                    Offer Details #{selectedOffer._id.slice(-6).toUpperCase()}
                  </h3>
                  <div
                    className={`px-3 py-1 rounded-full text-md font-medium border flex items-center space-x-1 ${getStatusColor(
                      selectedOffer.status
                    )}`}
                  >
                    {getStatusIcon(selectedOffer.status)}
                    <span>{selectedOffer.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Offer Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-200">
                      Offer Information
                    </h4>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <label className="block text-md font-medium text-slate-400">
                        Offer Price
                      </label>
                      <p className="text-2xl font-bold text-green-400">
                        {formatPrice(selectedOffer.price)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Year
                        </label>
                        <p className="text-slate-200">
                          {selectedOffer.year || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Mileage
                        </label>
                        <p className="text-slate-200">
                          {selectedOffer.mileage || "N/A"} km
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Condition
                        </label>
                        <p className="text-slate-200">
                          {selectedOffer.condition || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Fuel Type
                        </label>
                        <p className="text-slate-200">
                          {selectedOffer.fuelType || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-md font-medium text-slate-400">
                        Description
                      </label>
                      <p className="text-slate-200 text-md">
                        {selectedOffer.description || "No description provided"}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <label className="block text-md font-medium text-slate-400">
                        Seller Information
                      </label>
                      <p className="text-slate-200 font-semibold">
                        {selectedOffer.sellerId?.firstName}{" "}
                        {selectedOffer.sellerId?.lastName}
                      </p>
                      <p className="text-slate-400">
                        {selectedOffer.sellerId?.email}
                      </p>
                      <p className="text-slate-400 text-md">
                        Seller Type:{" "}
                        {selectedOffer.sellerId?.sellerType || "Individual"}
                      </p>
                    </div>
                  </div>

                  {/* Buyer Request Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-200">
                      Related Buyer Request
                    </h4>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <label className="block text-md font-medium text-slate-400">
                        Requested Vehicle
                      </label>
                      <p className="text-slate-200 font-semibold">
                        {selectedOffer.requestId?.make}{" "}
                        {selectedOffer.requestId?.model}
                      </p>
                      <p className="text-slate-400">
                        {selectedOffer.requestId?.year || "Any year"}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <label className="block text-md font-medium text-slate-400">
                        Buyer Budget
                      </label>
                      <p className="text-slate-200 font-semibold">
                        {formatPrice(selectedOffer.requestId?.budgetMin)} -{" "}
                        {formatPrice(selectedOffer.requestId?.budgetMax)}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <label className="block text-md font-medium text-slate-400">
                        Buyer Information
                      </label>
                      <p className="text-slate-200 font-semibold">
                        {selectedOffer.requestId?.buyerId?.firstName}{" "}
                        {selectedOffer.requestId?.buyerId?.lastName}
                      </p>
                      <p className="text-slate-400">
                        {selectedOffer.requestId?.buyerId?.email}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Offer Created
                        </label>
                        <p className="text-slate-200">
                          {new Date(
                            selectedOffer.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Last Updated
                        </label>
                        <p className="text-slate-200">
                          {new Date(
                            selectedOffer.updatedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {selectedOffer.rejectionReason && (
                      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <label className="block text-md font-medium text-red-400">
                          Rejection Reason
                        </label>
                        <p className="text-red-300 text-md">
                          {selectedOffer.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 px-6 py-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    setShowOfferModal(false);
                    setSelectedOffer(null);
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

export default SellerOffers;
