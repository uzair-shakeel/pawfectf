import React, { useState, useEffect } from 'react';
import { Search, Eye, Heart, Clock, CheckCircle, Truck, X, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const FoodDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/food-donations`);
      const donationsData = response.data?.donations || response.data || [];
      setDonations(donationsData);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-900/30 text-yellow-400 border-yellow-800', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-blue-900/30 text-blue-400 border-blue-800', icon: CheckCircle, label: 'Confirmed' },
      preparing: { color: 'bg-purple-900/30 text-purple-400 border-purple-800', icon: Clock, label: 'Preparing' },
      delivered: { color: 'bg-green-900/30 text-green-400 border-green-800', icon: Truck, label: 'Delivered' },
      completed: { color: 'bg-green-900/30 text-green-400 border-green-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-900/30 text-red-400 border-red-800', icon: X, label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (donationId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/food-donations/${donationId}/status`, {
        status: newStatus
      });
      toast.success('Status updated successfully');
      fetchDonations();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredDonations = donations.filter(d => {
    const matchesSearch = !search ||
      d.petId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.donorId?.firstName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Food Donations</h1>
        <p className="text-gray-400">Manage and track all food donations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-md">Total Donations</p>
          <p className="text-2xl font-bold text-white">{donations.length}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-md">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{donations.filter(d => d.status === 'pending').length}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-md">Confirmed</p>
          <p className="text-2xl font-bold text-blue-400">{donations.filter(d => d.status === 'confirmed').length}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-md">Delivered</p>
          <p className="text-2xl font-bold text-green-400">{donations.filter(d => d.status === 'delivered' || d.status === 'completed').length}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by pet name or donor..."
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {filteredDonations.length === 0 ? (
          <div className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No donations {search || statusFilter !== 'all' ? 'found' : 'yet'}</h3>
            <p className="text-gray-400">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Food donations will appear here once users start donating.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredDonations.map((donation) => {
              const statusConfig = getStatusConfig(donation.status);
              const petName = donation.petId?.title || donation.petId?.name || 'Unknown Pet';
              const donorName = donation.donorId?.firstName
                ? `${donation.donorId.firstName} ${donation.donorId.lastName || ''}`.trim()
                : 'Anonymous';
              const petImage = donation.petId?.images?.[0] || '/placeholder.jpg';

              return (
                <div key={donation._id} className="p-6 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={petImage}
                        alt={petName}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => e.target.src = '/placeholder.jpg'}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{petName}</h3>
                          {donation.isUrgent && (
                            <span className="px-2 py-1 bg-red-900/30 text-red-400 text-sm font-medium rounded-full border border-red-800">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-md text-gray-400">
                          {donation.petId?.breed} • {donation.petId?.species}
                        </p>
                        <p className="text-md text-gray-400">
                          Donated by {donorName} • ₹{donation.payment?.amount || donation.foodPackage?.amount || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-md font-medium border ${statusConfig.color}`}>
                          <statusConfig.icon className="h-4 w-4" />
                          {statusConfig.label}
                        </div>
                        <p className="text-md text-gray-400 mt-1">
                          {formatDate(donation.createdAt)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedDonation(donation);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {donation.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(donation._id, 'confirmed')}
                            className="px-3 py-1 bg-blue-600 text-white text-md rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Confirm
                          </button>
                        )}

                        {donation.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(donation._id, 'preparing')}
                            className="px-3 py-1 bg-purple-600 text-white text-md rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Preparing
                          </button>
                        )}

                        {donation.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusUpdate(donation._id, 'delivered')}
                            className="px-3 py-1 bg-green-600 text-white text-md rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Donation Details Modal */}
      {showModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Donation Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Pet Information</h4>
                <div className="text-gray-300 space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedDonation.petId?.title || 'Unknown'}</p>
                  <p><span className="font-medium">Species:</span> {selectedDonation.petId?.species || 'Unknown'}</p>
                  {selectedDonation.petId?.breed && (
                    <p><span className="font-medium">Breed:</span> {selectedDonation.petId.breed}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Donor Information
                </h4>
                <div className="bg-gray-700/50 p-4 rounded-lg text-gray-300">
                  <p><span className="font-medium">Name:</span> {selectedDonation.donorId?.firstName
                    ? `${selectedDonation.donorId.firstName} ${selectedDonation.donorId.lastName || ''}`.trim()
                    : 'Anonymous'}</p>
                  {selectedDonation.donorId?.email && (
                    <p><span className="font-medium">Email:</span> {selectedDonation.donorId.email}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Donation Details</h4>
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                  <div>
                    <label className="text-md text-gray-400">Amount</label>
                    <p className="text-lg font-semibold">₹{selectedDonation.payment?.amount || selectedDonation.foodPackage?.amount || 0}</p>
                  </div>
                  <div>
                    <label className="text-md text-gray-400">Status</label>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-md border ${getStatusConfig(selectedDonation.status).color}`}>
                      {getStatusConfig(selectedDonation.status).label}
                    </div>
                  </div>
                  <div>
                    <label className="text-md text-gray-400">Package Type</label>
                    <p className="capitalize">{selectedDonation.foodPackage?.type || 'Standard'}</p>
                  </div>
                  <div>
                    <label className="text-md text-gray-400">Duration</label>
                    <p className="capitalize">{selectedDonation.foodPackage?.duration?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedDonation.donorMessage && (
                <div>
                  <h5 className="font-medium text-white mb-2">Donor Message</h5>
                  <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                    <p className="text-blue-300">{selectedDonation.donorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDonations;
