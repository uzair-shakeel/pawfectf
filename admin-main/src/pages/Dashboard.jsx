import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardApi } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiTarget,
} from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import FoodDonationWidget from '../components/dashboard/FoodDonationWidget';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getDashboardData();
      console.log('Dashboard API response:', response);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        users: { totalUsers: 0, activeUsers: 0, blockedUsers: 0, newUsersPerMonth: [] },
        pets: { totalPets: 0, petsByStatus: [], petsByMake: [] },
        adoptionRequests: { totalRequests: 0, requestsByStatus: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Failed to load dashboard data</div>
      </div>
    );
  }

  const { users = {}, pets = {}, adoptionRequests = {} } = dashboardData;

  // Helper function to generate month labels
  const generateMonthLabels = () => {
    const labels = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    return labels;
  };

  const monthLabels = generateMonthLabels();

  // Helper function to format monthly data
  const formatMonthlyData = (data) => {
    const monthlyData = new Array(12).fill(0);
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        if (item && item._id && typeof item._id.month === 'number') {
          const monthIndex = item._id.month - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex] = item.count || 0;
          }
        }
      });
    }
    return monthlyData;
  };

  // Chart data configurations
  const growthChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'New Users',
        data: formatMonthlyData(users.newUsersPerMonth || []),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'New Pets',
        data: formatMonthlyData(pets.newPetsPerMonth || []),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'New Requests',
        data: formatMonthlyData(adoptionRequests.newRequestsPerMonth || []),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const petStatusData = {
    labels: (pets.petsByStatus || []).map(item => item._id || 'Unknown'),
    datasets: [
      {
        data: (pets.petsByStatus || []).map(item => item.count || 0),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const requestStatusData = {
    labels: (adoptionRequests.requestsByStatus || []).map(item => item._id || 'Unknown'),
    datasets: [
      {
        data: (adoptionRequests.requestsByStatus || []).map(item => item.count || 0),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Active - Green
          'rgba(59, 130, 246, 0.8)', // Fulfilled - Blue
          'rgba(239, 68, 68, 0.8)', // Expired - Red
          'rgba(107, 114, 128, 0.8)', // Cancelled - Gray
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
          'rgb(107, 114, 128)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgb(148, 163, 184)',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(148, 163, 184)',
          padding: 20,
        },
      },
    },
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = 'blue',
    trend = null,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-200 mt-1">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'
                }`}
            >
              {trend > 0 ? '+' : ''}
              {trend}% from last month
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome to Rafraf Admin Panel</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <FiActivity size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={users.totalUsers?.toLocaleString() || '0'}
          icon={FiUsers}
          color="blue"
        />
        <StatCard
          title="Total Pets"
          value={pets.totalPets?.toLocaleString() || '0'}
          icon={MdPets}
          color="green"
        />
        <StatCard
          title="Adoption Requests"
          value={adoptionRequests.totalRequests?.toLocaleString() || '0'}
          icon={FiShoppingCart}
          color="yellow"
        />
        <StatCard
          title="Avg Budget"
          value={formatPrice(adoptionRequests.budgetStats?.avgBudgetMax)}
          icon={FiDollarSign}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200">
              Growth Overview
            </h3>
            <FiTrendingUp className="text-slate-400" />
          </div>
          <div className="h-80">
            <Line data={growthChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Pet Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200">Pet Status</h3>
            <MdPets className="text-slate-400" />
          </div>
          <div className="h-80">
            <Doughnut data={petStatusData} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200">
              Request Status
            </h3>
            <FiTarget className="text-slate-400" />
          </div>
          <div className="h-80">
            <Doughnut data={requestStatusData} options={doughnutOptions} />
          </div>
        </motion.div>

        {/* Popular Pet Species/Make */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200">
              Popular Pets
            </h3>
            <MdPets className="text-slate-400" />
          </div>
          <div className="space-y-3">
            {(pets.petsByMake || []).slice(0, 5).map((make, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-300 font-medium">{make._id || 'Unknown'}</span>
                <span className="text-slate-400">{make.count || 0} pets</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Food Donations Widget */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FoodDonationWidget />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
