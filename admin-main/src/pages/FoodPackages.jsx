import React, { useState } from 'react';
import { Plus, Search, Package } from 'lucide-react';

const FoodPackages = () => {
  const [packages] = useState([]);
  const [search, setSearch] = useState('');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Food Packages</h1>
          <p className="text-gray-400">Manage food packages for donations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Create Package
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search packages..."
            className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-12 text-center">
          <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No packages yet</h3>
          <p className="text-gray-400">Create your first food package to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">{pkg.name}</h3>
              <p className="text-gray-400 text-md mb-4">{pkg.description}</p>
              <div className="text-blue-400 font-medium">₹{pkg.pricing['1_month']}/month</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodPackages;
