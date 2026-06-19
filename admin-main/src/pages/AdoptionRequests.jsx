import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiTrash2, FiEye, FiShoppingCart, FiRefreshCw, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { adoptionRequestApi } from '../services/api';
import toast from 'react-hot-toast';

const AdoptionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequestStats();
    fetchRequests();
  }, [currentPage, searchTerm, filterStatus, filterSpecies]);

  const fetchRequestStats = async () => {
    try {
      const response = await adoptionRequestApi.getAdoptionRequestStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching request stats:', error);
      toast.error('Failed to fetch request statistics');
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        status: filterStatus || undefined,
        preferredSpecies: filterSpecies || undefined
      };

      const response = await adoptionRequestApi.getAllAdoptionRequests(params);
      setRequests(response.data.requests);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch adoption requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await adoptionRequestApi.updateAdoptionRequestStatus(requestId, newStatus);
      toast.success('Request status updated successfully');
      fetchRequests();
      fetchRequestStats();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const handleDeleteRequest = async () => {
    try {
      await adoptionRequestApi.deleteAdoptionRequest(requestToDelete._id);
      toast.success('Adoption request deleted successfully');
      setShowDeleteModal(false);
      setRequestToDelete(null);
      fetchRequests();
      fetchRequestStats();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterSpecies('');
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'fulfilled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case 'active':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'fulfilled':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'expired':
        return <FiClock className="h-4 w-4" />;
      case 'cancelled':
        return <FiXCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-200 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading adoption requests...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Adoption Requests</h1>
          <p className="text-slate-400 mt-1">Manage all adoption requests in the system</p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <FiRefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={stats.totalRequests?.toLocaleString() || '0'}
          icon={FiShoppingCart}
          color="blue"
        />
        <StatCard
          title="Active"
          value={stats.requestsByStatus?.find(s => s._id?.toLowerCase() === 'active')?.count || 0}
          icon={FiCheckCircle}
          color="green"
        />
        <StatCard
          title="Fulfilled"
          value={stats.requestsByStatus?.find(s => s._id?.toLowerCase() === 'fulfilled')?.count || 0}
          icon={FiCheckCircle}
          color="purple"
        />
        <StatCard
          title="Avg Budget"
          value={formatPrice(stats.budgetStats?.avgBudgetMax)}
          icon={FiShoppingCart}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search requests..."
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
            <option value="Active">Active</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Species</option>
            {stats.requestsByMake?.map((make) => (
              <option key={make._id} value={make._id}>{make._id}</option>
            ))}
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

      {/* Requests Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <motion.div
            key={request._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">
                  {request.preferredSpecies || 'Any Species'} {request.preferredBreed && `- ${request.preferredBreed}`}
                </h3>
                <p className="text-slate-400 text-sm">{request.preferredAgeGroup || 'Any Age'}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span>{request.status}</span>
              </div>
            </div>

            {/* Budget */}
            <div className="mb-4">
              <p className="text-slate-400 text-sm">Budget Range</p>
              <p className="text-slate-200 font-semibold">
                {formatPrice(request.minAdoptionFee)} - {formatPrice(request.maxAdoptionFee)}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Preferred Size:</span>
                <span className="text-slate-200">{request.preferredSize || 'Any'}</span>
              </div>
            </div>

            {/* Adopter Info */}
            <div className="mb-4 p-3 bg-slate-800/30 rounded-lg">
              <p className="text-slate-400 text-xs">Adopter</p>
              <p className="text-slate-200 text-sm font-medium">
                {request.adopterId?.firstName} {request.adopterId?.lastName}
              </p>
              <p className="text-slate-400 text-xs">{request.adopterId?.email}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <select
                value={request.status || 'Active'}
                onChange={(e) => handleStatusChange(request._id, e.target.value)}
                className="text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewRequest(request)}
                  className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  title="View Details"
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => {
                    setRequestToDelete(request);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete Request"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <p className="text-slate-400 text-xs">
                Created: {new Date(request.createdAt).toLocaleDateString()}
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
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-700">
              <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-slate-200">Delete Request</h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-400">
                        Are you sure you want to delete this adoption request for {requestToDelete?.preferredSpecies} {requestToDelete?.preferredBreed}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteRequest}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRequestToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-slate-700">
              <div className="bg-slate-800 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl leading-6 font-bold text-slate-200">
                    Request Details: {selectedRequest.preferredSpecies} {selectedRequest.preferredBreed}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span>{selectedRequest.status}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pet Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-200">Pet Requirements</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400">Species</label>
                        <p className="text-slate-200">{selectedRequest.preferredSpecies || 'Any'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400">Breed</label>
                        <p className="text-slate-200">{selectedRequest.preferredBreed || 'Any'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400">Age Group</label>
                        <p className="text-slate-200">{selectedRequest.preferredAgeGroup || 'Any'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400">Size</label>
                        <p className="text-slate-200">{selectedRequest.preferredSize || 'Any'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400">Description</label>
                      <p className="text-slate-200 text-sm">{selectedRequest.description || 'No specific requirements'}</p>
                    </div>
                  </div>

                  {/* Budget & Adopter Info */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-200">Budget & Contact</h4>
                    
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <label className="block text-sm font-medium text-slate-400">Budget Range</label>
                      <p className="text-lg font-bold text-green-400">
                        {formatPrice(selectedRequest.minAdoptionFee)} - {formatPrice(selectedRequest.maxAdoptionFee)}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <label className="block text-sm font-medium text-slate-400">Adopter Information</label>
                      <p className="text-slate-200 font-semibold">
                        {selectedRequest.adopterId?.firstName} {selectedRequest.adopterId?.lastName}
                      </p>
                      <p className="text-slate-400">{selectedRequest.adopterId?.email}</p>
                      <p className="text-slate-400 text-sm">
                        Member since: {new Date(selectedRequest.adopterId?.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400">Created</label>
                        <p className="text-slate-200">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 px-6 py-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedRequest(null);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
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

export default AdoptionRequests;
