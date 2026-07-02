import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Eye, Heart, Star } from 'lucide-react';

const FoodPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    suitableFor: 'all'
  });

  const [formData, setFormData] = useState({
    name: '',
    type: 'basic',
    description: '',
    pricing: {
      '1_day': 0,
      '3_days': 0,
      '1_week': 0,
      '2_weeks': 0,
      '1_month': 0,
      '3_months': 0,
      '6_months': 0
    },
    contents: [{ item: '', quantity: '', unit: '' }],
    suitableFor: [],
    animalSizes: [],
    features: [''],
    images: [],
    stock: -1
  });

  useEffect(() => {
    fetchPackages();
  }, [filters]);

  const fetchPackages = async () => {
    try {
      // Mock data for now
      const mockPackages = [
        {
          id: 1,
          name: 'Basic Dog Food Package',
          type: 'basic',
          description: 'Essential nutrition package for dogs of all sizes',
          pricing: {
            '1_day': 25,
            '3_days': 70,
            '1_week': 150,
            '2_weeks': 280,
            '1_month': 500,
            '3_months': 1400,
            '6_months': 2700
          },
          contents: [
            { item: 'Dry Dog Food', quantity: '2', unit: 'kg' },
            { item: 'Wet Dog Food', quantity: '6', unit: 'cans' },
            { item: 'Dog Treats', quantity: '1', unit: 'pack' }
          ],
          suitableFor: ['dog'],
          animalSizes: ['small', 'medium', 'large'],
          features: ['High protein', 'No artificial additives', 'Grain-free option'],
          images: ['/placeholder.jpg'],
          stock: 50,
          totalDonations: 125,
          popularityScore: 89,
          isActive: true,
          createdAt: new Date('2024-01-01')
        },
        {
          id: 2,
          name: 'Premium Cat Food Package',
          type: 'premium',
          description: 'High-quality nutrition package for cats with special dietary needs',
          pricing: {
            '1_day': 30,
            '3_days': 85,
            '1_week': 180,
            '2_weeks': 340,
            '1_month': 650,
            '3_months': 1800,
            '6_months': 3400
          },
          contents: [
            { item: 'Premium Dry Cat Food', quantity: '1.5', unit: 'kg' },
            { item: 'Wet Cat Food', quantity: '12', unit: 'pouches' },
            { item: 'Cat Treats', quantity: '2', unit: 'packs' },
            { item: 'Catnip', quantity: '1', unit: 'pack' }
          ],
          suitableFor: ['cat'],
          animalSizes: ['small', 'medium'],
          features: ['Vet recommended', 'Senior cat formula', 'Hairball control', 'Indoor formula'],
          images: ['/placeholder.jpg'],
          stock: 30,
          totalDonations: 87,
          popularityScore: 92,
          isActive: true,
          createdAt: new Date('2024-01-05')
        },
        {
          id: 3,
          name: 'Deluxe Multi-Pet Package',
          type: 'deluxe',
          description: 'Comprehensive nutrition package suitable for multiple pet types',
          pricing: {
            '1_day': 45,
            '3_days': 120,
            '1_week': 250,
            '2_weeks': 480,
            '1_month': 900,
            '3_months': 2600,
            '6_months': 5000
          },
          contents: [
            { item: 'Premium Pet Food Mix', quantity: '3', unit: 'kg' },
            { item: 'Wet Food Variety Pack', quantity: '18', unit: 'cans' },
            { item: 'Training Treats', quantity: '3', unit: 'packs' },
            { item: 'Vitamins & Supplements', quantity: '1', unit: 'bottle' }
          ],
          suitableFor: ['dog', 'cat'],
          animalSizes: ['small', 'medium', 'large', 'extra_large'],
          features: ['Multi-pet friendly', 'Complete nutrition', 'Includes supplements', 'Training treats'],
          images: ['/placeholder.jpg'],
          stock: 20,
          totalDonations: 45,
          popularityScore: 95,
          isActive: true,
          createdAt: new Date('2024-01-10')
        }
      ];

      // Apply filters
      let filteredPackages = mockPackages;
      
      if (filters.search) {
        filteredPackages = filteredPackages.filter(pkg => 
          pkg.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.type !== 'all') {
        filteredPackages = filteredPackages.filter(pkg => pkg.type === filters.type);
      }
      
      if (filters.suitableFor !== 'all') {
        filteredPackages = filteredPackages.filter(pkg => 
          pkg.suitableFor.includes(filters.suitableFor)
        );
      }

      setPackages(filteredPackages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      deluxe: 'bg-orange-100 text-orange-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.basic;
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    // Create package logic here
    console.log('Creating package:', formData);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setFormData(pkg);
    setEditMode(true);
    setShowCreateModal(true);
  };

  const handleDeletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'basic',
      description: '',
      pricing: {
        '1_day': 0,
        '3_days': 0,
        '1_week': 0,
        '2_weeks': 0,
        '1_month': 0,
        '3_months': 0,
        '6_months': 0
      },
      contents: [{ item: '', quantity: '', unit: '' }],
      suitableFor: [],
      animalSizes: [],
      features: [''],
      images: [],
      stock: -1
    });
    setEditMode(false);
    setSelectedPackage(null);
  };

  const addContent = () => {
    setFormData({
      ...formData,
      contents: [...formData.contents, { item: '', quantity: '', unit: '' }]
    });
  };

  const removeContent = (index) => {
    setFormData({
      ...formData,
      contents: formData.contents.filter((_, i) => i !== index)
    });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Packages</h1>
          <p className="text-gray-600">Manage food packages for donations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Package
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search packages..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="deluxe">Deluxe</option>
            </select>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filters.suitableFor}
              onChange={(e) => setFilters({ ...filters, suitableFor: e.target.value })}
            >
              <option value="all">All Animals</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="bird">Birds</option>
              <option value="rabbit">Rabbits</option>
            </select>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={pkg.images[0] || '/placeholder.jpg'}
                alt={pkg.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(pkg.type)}`}>
                  {pkg.type}
                </span>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {pkg.popularityScore}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Heart className="h-4 w-4 text-red-500" />
                  {pkg.totalDonations}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">1 day:</span>
                  <span className="font-medium">₹{pkg.pricing['1_day']}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">1 week:</span>
                  <span className="font-medium">₹{pkg.pricing['1_week']}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">1 month:</span>
                  <span className="font-medium">₹{pkg.pricing['1_month']}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {pkg.suitableFor.map((animal) => (
                  <span key={animal} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">
                    {animal}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Stock: {pkg.stock === -1 ? 'Unlimited' : pkg.stock}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-600">No food packages match your current filters.</p>
        </div>
      )}

      {/* Create/Edit Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editMode ? 'Edit Package' : 'Create New Package'}
              </h3>
            </div>

            <form onSubmit={handleCreatePackage} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="deluxe">Deluxe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Pricing (₹)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(formData.pricing).map((duration) => (
                    <div key={duration}>
                      <label className="text-xs text-gray-600 capitalize">
                        {duration.replace('_', ' ')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={formData.pricing[duration]}
                        onChange={(e) => setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, [duration]: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {editMode ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodPackages;