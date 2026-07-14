import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Users, Clock } from 'lucide-react';

const FoodDonationWidget = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    activeDonations: 0,
    urgentCases: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonationData();
  }, []);

  const fetchDonationData = async () => {
    try {
      // Mock data for now
      const mockStats = {
        totalDonations: 247,
        totalAmount: 15420,
        activeDonations: 89,
        urgentCases: 12
      };

      const mockRecentDonations = [
        {
          id: 1,
          petName: 'Luna',
          amount: 150,
          donorName: 'Anonymous',
          time: '5 min ago',
          status: 'confirmed'
        },
        {
          id: 2,
          petName: 'Max',
          amount: 200,
          donorName: 'Maria K.',
          time: '15 min ago',
          status: 'delivered'
        },
        {
          id: 3,
          petName: 'Bella',
          amount: 100,
          donorName: 'John D.',
          time: '1 hour ago',
          status: 'preparing'
        }
      ];

      setStats(mockStats);
      setRecentDonations(mockRecentDonations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching donation data:', error);
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statCards = [
    {
      title: 'Total Donations',
      value: stats.totalDonations,
      icon: Heart,
      color: 'text-red-600 bg-red-50',
      change: '+12%'
    },
    {
      title: 'Amount Raised',
      value: formatAmount(stats.totalAmount),
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50',
      change: '+8%'
    },
    {
      title: 'Active Donations',
      value: stats.activeDonations,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      change: '+5%'
    },
    {
      title: 'Urgent Cases',
      value: stats.urgentCases,
      icon: Clock,
      color: 'text-orange-600 bg-orange-50',
      change: '-2%'
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-600" />
          Food Donations Overview
        </h3>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-md text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Recent Donations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Recent Donations</h4>
            <button className="text-md text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="space-y-3">
            {recentDonations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatAmount(donation.amount)} for {donation.petName}
                    </p>
                    <p className="text-md text-gray-600">
                      by {donation.donorName} • {donation.time}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(donation.status)}`}>
                  {donation.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
              Manage Donations
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Food Packages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDonationWidget;