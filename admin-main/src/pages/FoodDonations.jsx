import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Clock, Truck, X, Heart, MapPin, Calendar, User } from 'lucide-react';

const FoodDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: 'all'
  });
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [filters]);

  const fetchDonations = async () => {
    try {
      // Mock data for now
      const mockDonations = [
        {
          id: 1,
          petName: 'Luna',
          petId: 'pet_1',
          petSpecies: 'Dog',
          petBreed: 'Golden Retriever',
          petImage: '/avatar.jpg',
          donorName: 'Maria Kowalski',
          donorEmail: 'maria@example.com',
          amount: 150,
          packageType: 'Premium',
          duration: '1_week',
          status: 'confirmed',
          paymentStatus: 'paid',
          deliveryType: 'shelter_direct',
          deliveryAddress: 'Happy Paws Shelter, Warsaw',
          donorMessage: 'I hope Luna gets the nutrition she needs!',
          shelterResponse: 'Thank you for your kindness! Luna is doing great.',
          createdAt: new Date('2024-01-15'),
          scheduledDate: new Date('2024-01-17'),
          isUrgent: true
        },
        {
          id: 2,
          petName: 'Max',
          petId: 'pet_2',
          petSpecies: 'Cat',
          petBreed: 'Persian',
          petImage: '/avatar.jpg',
          donorName: 'Anonymous',
          donorEmail: null,
          amount: 200,
          packageType: 'Deluxe',
          duration: '2_weeks',
          status: 'delivered',
          paymentStatus: 'paid',
          deliveryType: 'delivery',
          deliveryAddress: '123 Pet Street, Krakow',
          donorMessage: '',
          shelterResponse: 'Food delivered successfully. Max loves it!',
          createdAt: new Date('2024-01-10'),
          scheduledDate: new Date('2024-01-12'),
          deliveredAt: new Date('2024-01-12'),
          isUrgent: false
        },
        {
          id: 3,
          petName: 'Bella',
          petId: 'pet_3',
          petSpecies: 'Dog',
          petBreed: 'German Shepherd',
          petImage: '/avatar.jpg',
          donorName: 'John Smith',
          donorEmail: 'john@example.com',
          amount: 100,
          packageType: 'Basic',
          duration: '3_days',
          status: 'preparing',
          paymentStatus: 'paid',
          deliveryType: 'pickup',
          deliveryAddress: 'City Animal Shelter, Gdansk',
          donorMessage: 'Get well soon, Bella!',
          shelterResponse: '',
          createdAt: new Date('2024-01-14'),
          scheduledDate: new Date('2024-01-16'),
          isUrgent: false
        }
      ];

      // Apply filters
      let filteredDonations = mockDonations;
      
      if (filters.status !== 'all') {
        filteredDonations = filteredDonations.filter(d => d.status === filters.status);
      }
      
      if (filters.search) {
        filteredDonations = filteredDonations.filter(d => 
          d.petName.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.donorName.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setDonations(filteredDonations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Pending'
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      preparing: {
        color: 'bg-purple-100 text-purple-800',
        icon: Clock,
        label: 'Preparing'
      },
      delivered: {
        color: 'bg-green-100 text-green-800',
        icon: Truck,
        label: 'Delivered'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800',
        icon: X,
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusUpdate = async (donationId, newStatus) => {
    // Update status logic here
    setDonations(prev => prev.map(d => 
      d.id === donationId ? { ...d, status: newStatus } : d
    ));
  };

  const openDonationModal = (donation) => {
    setSelectedDonation(donation);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Donations</h1>
        <p className="text-gray-600">Manage and track all food donations</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by pet name or donor..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {donations.length === 0 ? (
          <div className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No donations found</h3>
            <p className="text-gray-600">No food donations match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {donations.map((donation) => {
              const statusConfig = getStatusConfig(donation.status);
              return (
                <div key={donation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={donation.petImage}
                        alt={donation.petName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{donation.petName}</h3>
                          {donation.isUrgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {donation.petBreed} • {donation.petSpecies}
                        </p>
                        <p className="text-sm text-gray-500">
                          Donated by {donation.donorName} • ₹{donation.amount}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                          <statusConfig.icon className="h-4 w-4" />
                          {statusConfig.label}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(donation.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDonationModal(donation)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {donation.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(donation.id, 'confirmed')}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        
                        {donation.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(donation.id, 'preparing')}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Start Preparing
                          </button>
                        )}
                        
                        {donation.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusUpdate(donation.id, 'delivered')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Mark Delivered
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Donation Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Pet Information */}
              <div className="flex items-center gap-4">
                <img
                  src={selectedDonation.petImage}
                  alt={selectedDonation.petName}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xl font-semibold">{selectedDonation.petName}</h4>
                  <p className="text-gray-600">{selectedDonation.petBreed} • {selectedDonation.petSpecies}</p>
                </div>
              </div>

              {/* Donation Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-lg font-semibold">₹{selectedDonation.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Package Type</label>
                  <p>{selectedDonation.packageType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <p>{selectedDonation.duration.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getStatusConfig(selectedDonation.status).color}`}>
                    {getStatusConfig(selectedDonation.status).label}
                  </div>
                </div>
              </div>

              {/* Donor Information */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Donor Information
                </h5>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Name:</strong> {selectedDonation.donorName}</p>
                  {selectedDonation.donorEmail && (
                    <p><strong>Email:</strong> {selectedDonation.donorEmail}</p>
                  )}
                </div>
              </div>

              {/* Delivery Information */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery Information
                </h5>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Type:</strong> {selectedDonation.deliveryType.replace('_', ' ')}</p>
                  <p><strong>Address:</strong> {selectedDonation.deliveryAddress}</p>
                  <p><strong>Scheduled:</strong> {formatDate(selectedDonation.scheduledDate)}</p>
                  {selectedDonation.deliveredAt && (
                    <p><strong>Delivered:</strong> {formatDate(selectedDonation.deliveredAt)}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              {(selectedDonation.donorMessage || selectedDonation.shelterResponse) && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Messages</h5>
                  {selectedDonation.donorMessage && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-3">
                      <p className="font-medium text-blue-900">Donor Message:</p>
                      <p className="text-blue-800">{selectedDonation.donorMessage}</p>
                    </div>
                  )}
                  {selectedDonation.shelterResponse && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-medium text-green-900">Shelter Response:</p>
                      <p className="text-green-800">{selectedDonation.shelterResponse}</p>
                    </div>
                  )}
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