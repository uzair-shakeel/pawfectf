import React, { useState, useEffect } from 'react';
import { Heart, Users, Award, TrendingUp } from 'lucide-react';

const FoodDonationStats = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    petsFed: 0,
    activeShelters: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock data for now
      const mockStats = {
        totalDonations: 1247,
        totalAmount: 45000,
        petsFed: 892,
        activeShelters: 89
      };
      setStats(mockStats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const statsData = [
    {
      icon: Heart,
      value: stats.totalDonations,
      label: 'Total Donations',
      color: 'text-red-600 bg-red-50 border-red-200',
      description: 'Food donations made to date'
    },
    {
      icon: TrendingUp,
      value: `₹${formatNumber(stats.totalAmount)}`,
      label: 'Amount Raised',
      color: 'text-green-600 bg-green-50 border-green-200',
      description: 'Total value of food donated'
    },
    {
      icon: Users,
      value: stats.petsFed,
      label: 'Pets Fed',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Animals that received food'
    },
    {
      icon: Award,
      value: stats.activeShelters,
      label: 'Partner Shelters',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      description: 'Verified shelter partners'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Impact in Numbers</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See the difference our community is making in the lives of pets across Poland
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border ${stat.color} mb-4`}>
                <stat.icon className="h-8 w-8" />
              </div>
              
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value)}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h3>
            <p className="text-gray-600">Live updates from our community</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recent donations */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">₹150 donated</p>
                  <p className="text-sm text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Anonymous user sponsored food for Luna in Warsaw</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">New shelter joined</p>
                  <p className="text-sm text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Happy Paws Shelter in Gdansk joined our network</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Goal reached!</p>
                  <p className="text-sm text-gray-500">1 hour ago</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Max the German Shepherd reached his food goal</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodDonationStats;