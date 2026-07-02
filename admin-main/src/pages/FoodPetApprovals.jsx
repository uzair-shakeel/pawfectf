import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Clock, AlertTriangle, MapPin, User, Phone, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FoodPetApprovals = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingPets();
  }, []);

  const fetchPendingPets = async () => {
    try {
      // Mock data for now
      const mockPets = [
        {
          id: 1,
          name: 'Luna',
          species: 'Dog',
          breed: 'Golden Retriever',
          age: '2 years',
          gender: 'Female',
          size: 'Large',
          description: 'Luna is a gentle and loving golden retriever who was rescued from the streets. She needs consistent nutrition to recover her strength and find her forever home.',
          images: ['/placeholder.jpg'],
          status: 'pending_approval',
          urgency: 'high',
          foodNeed: {
            reason: 'Recovery food needed after surgery',
            specialDiet: 'Prescription recovery diet',
            estimatedCost: 800,
            duration: '3_months'
          },
          shelter: {
            name: 'Happy Paws Shelter',
            address: '123 Pet Street, Warsaw, Poland',
            contactPhone: '+48 123 456 789',
            contactEmail: 'contact@happypaws.org',
            licenseNumber: 'SHL-2024-001'
          },
          location: {
            city: 'Warsaw',
            address: '123 Pet Street, Warsaw',
            coordinates: [21.01178, 52.22977]
          },
          submittedBy: {
            id: 'user123',
            name: 'Anna Kowalski',
            email: 'anna@shelter.org',
            phone: '+48 987 654 321'
          },
          createdAt: new Date('2024-01-15'),
          submissionNotes: 'All documentation attached. Pet has been with us for 2 weeks.'
        },
        {
          id: 2,
          name: 'Max',
          species: 'Cat',
          breed: 'Persian',
          age: '5 years',
          gender: 'Male',
          size: 'Medium',
          description: 'Max is a senior Persian cat who needs special nutrition for his kidney condition. He is very gentle and loves to be petted.',
          images: ['/placeholder.jpg'],
          status: 'pending_approval',
          urgency: 'medium',
          foodNeed: {
            reason: 'Senior cat with kidney issues needs special diet',
            specialDiet: 'Prescription kidney diet, low protein',
            estimatedCost: 600,
            duration: '6_months'
          },
          shelter: {
            name: 'City Animal Care',
            address: '456 Care Avenue, Krakow, Poland',
            contactPhone: '+48 456 789 123',
            contactEmail: 'info@citycare.org',
            licenseNumber: 'SHL-2024-002'
          },
          location: {
            city: 'Krakow',
            address: '456 Care Avenue, Krakow',
            coordinates: [19.94497, 50.04932]
          },
          submittedBy: {
            id: 'user456',
            name: 'Piotr Nowak',
            email: 'piotr@citycare.org',
            phone: '+48 654 321 987'
          },
          createdAt: new Date('2024-01-14'),
          submissionNotes: 'Veterinary records and license attached.'
        }
      ];

      setPets(mockPets);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending pets:', error);
      toast.error('Failed to load pending approvals');
      setLoading(false);
    }
  };

  const handleApprove = async (petId) => {
    setActionLoading(true);
    try {
      // API call to approve pet
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      setPets(prev => prev.filter(pet => pet.id !== petId));
      toast.success('Pet approved successfully! It will now appear for donations.');
      setShowModal(false);
    } catch (error) {
      console.error('Error approving pet:', error);
      toast.error('Failed to approve pet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (petId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      // API call to reject pet
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      setPets(prev => prev.filter(pet => pet.id !== petId));
      toast.success('Pet rejected. The submitter has been notified.');
      setShowModal(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting pet:', error);
      toast.error('Failed to reject pet');
    } finally {
      setActionLoading(false);
    }
  };

  const openPetModal = (pet) => {
    setSelectedPet(pet);
    setShowModal(true);
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || colors.medium;
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Pet Approvals</h1>
        <p className="text-gray-600">Review and approve pets for food donation listings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pets.length}</p>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pets.filter(p => p.urgency === 'critical' || p.urgency === 'high').length}</p>
              <p className="text-sm text-gray-600">Urgent Cases</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">24h</p>
              <p className="text-sm text-gray-600">Avg Review Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Pets List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {pets.length === 0 ? (
          <div className="p-12 text-center">
            <Check className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pets are currently waiting for approval.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pets.map((pet) => (
              <div key={pet.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <img
                      src={pet.images[0] || '/placeholder.jpg'}
                      alt={pet.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(pet.urgency)}`}>
                          {pet.urgency} priority
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {pet.breed} • {pet.species} • {pet.age} • {pet.gender}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {pet.shelter.name}, {pet.location.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {pet.submittedBy.name}
                        </span>
                        <span>Submitted {formatDate(pet.createdAt)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{pet.description}</p>
                      
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800">
                          <span className="font-medium">Food Need:</span> {pet.foodNeed.reason}
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          Estimated cost: ₹{pet.foodNeed.estimatedCost} • 
                          {pet.foodNeed.specialDiet && ` Special diet: ${pet.foodNeed.specialDiet}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => openPetModal(pet)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </button>
                    <button
                      onClick={() => handleApprove(pet.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pet Details Modal */}
      {showModal && selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Review Pet Application</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Pet Information */}
              <div className="space-y-6">
                <div>
                  <img
                    src={selectedPet.images[0] || '/placeholder.jpg'}
                    alt={selectedPet.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Pet Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedPet.name}</div>
                    <div><span className="font-medium">Species:</span> {selectedPet.species}</div>
                    <div><span className="font-medium">Breed:</span> {selectedPet.breed}</div>
                    <div><span className="font-medium">Age:</span> {selectedPet.age}</div>
                    <div><span className="font-medium">Gender:</span> {selectedPet.gender}</div>
                    <div><span className="font-medium">Size:</span> {selectedPet.size}</div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                  <p className="text-sm text-gray-700">{selectedPet.description}</p>
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Food Need Information</h4>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                    <div><span className="font-medium">Reason:</span> {selectedPet.foodNeed.reason}</div>
                    <div><span className="font-medium">Estimated Cost:</span> ₹{selectedPet.foodNeed.estimatedCost}</div>
                    <div><span className="font-medium">Priority:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getUrgencyColor(selectedPet.urgency)}`}>
                        {selectedPet.urgency}
                      </span>
                    </div>
                    {selectedPet.foodNeed.specialDiet && (
                      <div><span className="font-medium">Special Diet:</span> {selectedPet.foodNeed.specialDiet}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Shelter Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedPet.shelter.name}</div>
                    <div><span className="font-medium">Address:</span> {selectedPet.shelter.address}</div>
                    <div><span className="font-medium">License:</span> {selectedPet.shelter.licenseNumber}</div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedPet.shelter.contactPhone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedPet.shelter.contactEmail}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Submitted By</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedPet.submittedBy.name}</div>
                    <div><span className="font-medium">Email:</span> {selectedPet.submittedBy.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedPet.submittedBy.phone}</div>
                    <div><span className="font-medium">Submitted:</span> {formatDate(selectedPet.createdAt)}</div>
                  </div>
                </div>
                
                {selectedPet.submissionNotes && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Submission Notes</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPet.submissionNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection (required if rejecting)..."
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedPet.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApprove(selectedPet.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodPetApprovals;