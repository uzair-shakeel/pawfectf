import React, { useState, useEffect } from 'react';
import { Search, Eye, Heart } from 'lucide-react';

const FoodDonations = () => {
  const [donations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Food Donations</h1>
        <p className="text-gray-400">Manage and track all food donations</p>
      </div>

      {/* Search */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by pet name or donor..."
            className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        {donations.length === 0 ? (
          <div className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No donations yet</h3>
            <p className="text-gray-400">Food donations will appear here once users start donating.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {donations.map((donation) => (
              <div key={donation.id} className="p-6 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={donation.petImage}
                      alt={donation.petName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-white">{donation.petName}</h3>
                      <p className="text-sm text-gray-400">
                        Donated by {donation.donorName} • ₹{donation.amount}
                      </p>
                    </div>
                  </div>

                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDonations;
