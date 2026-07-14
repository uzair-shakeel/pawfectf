import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiTrash2,
  FiEye,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiRefreshCw,
} from "react-icons/fi";
import { userApi } from "../services/api";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterSellerType, setFilterSellerType] = useState("");
  const [filterBlocked, setFilterBlocked] = useState("");
  const [filterApprovalStatus, setFilterApprovalStatus] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUserStats();
    fetchUsers();
  }, [
    currentPage,
    searchTerm,
    filterRole,
    filterSellerType,
    filterBlocked,
    filterApprovalStatus,
  ]);

  const fetchUserStats = async () => {
    try {
      const response = await userApi.getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error("Failed to fetch user statistics");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        role: filterRole || undefined,
        sellerType: filterSellerType || undefined,
        blocked: filterBlocked || undefined,
        approvalStatus: filterApprovalStatus || undefined,
      };

      const response = await userApi.getAllUsers(params);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      await userApi.toggleUserBlock(userId);
      toast.success("User status updated successfully");
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error("Error toggling user block:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userApi.changeUserRole(userId, newRole);
      toast.success("User role updated successfully");
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error("Error changing user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userApi.deleteUser(userToDelete._id);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await userApi.approveUser(userId);
      toast.success("User approved successfully");
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  const handleRejectUser = async (userId, rejectionReason) => {
    try {
      await userApi.rejectUser(userId, rejectionReason);
      toast.success("User rejected successfully");
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterRole("");
    setFilterSellerType("");
    setFilterBlocked("");
    setFilterApprovalStatus("");
    setCurrentPage(1);
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-md font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-200 mt-1">{value}</p>
        </div>
        <div
          className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">
            Users Management
          </h1>
          <p className="text-slate-400 mt-1">Manage all users in the system</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <FiRefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers?.toLocaleString() || "0"}
          icon={FiUserCheck}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers?.toLocaleString() || "0"}
          icon={FiUserCheck}
          color="green"
        />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers?.toLocaleString() || "0"}
          icon={FiUserX}
          color="red"
        />
        <StatCard
          title="Shelters & Orgs"
          value={
            stats.usersBySellerType?.find((s) => s._id === "company")?.count ||
            0
          }
          icon={FiShield}
          color="purple"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingUsers?.toLocaleString() || "0"}
          icon={FiUserCheck}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filterSellerType}
            onChange={(e) => setFilterSellerType(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Account Types</option>
            <option value="private">Private</option>
            <option value="company">Shelter / Org</option>
          </select>

          <select
            value={filterBlocked}
            onChange={(e) => setFilterBlocked(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Blocked</option>
          </select>

          <select
            value={filterApprovalStatus}
            onChange={(e) => setFilterApprovalStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Approval Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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

      {/* Users Table - Mobile Responsive */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Account Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-800/25">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-medium">
                          {user.firstName?.[0] || user.email?.[0] || "U"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-md font-medium text-slate-200">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-md text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="text-md bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                      disabled={user.role === "admin"}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {user.sellerType || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full border ${user.blocked
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-green-500/20 text-green-400 border-green-500/30"
                        }`}
                    >
                      {user.blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full border ${user.approvalStatus === "approved"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : user.approvalStatus === "rejected"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}
                    >
                      {user.approvalStatus === "approved"
                        ? "Approved"
                        : user.approvalStatus === "rejected"
                          ? "Rejected"
                          : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-md">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleBlock(user._id)}
                        className={`p-2 transition-colors ${user.blocked
                          ? "text-slate-400 hover:text-green-400"
                          : "text-slate-400 hover:text-red-400"
                          }`}
                        title={user.blocked ? "Unblock User" : "Block User"}
                        disabled={user.role === "admin"}
                      >
                        {user.blocked ? (
                          <FiUserCheck size={16} />
                        ) : (
                          <FiUserX size={16} />
                        )}
                      </button>

                      {/* Approval/Rejection buttons */}
                      {user.approvalStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                            title="Approve User"
                            disabled={user.role === "admin"}
                          >
                            <FiUserCheck size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Enter rejection reason:");
                              if (reason !== null) {
                                handleRejectUser(user._id, reason);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            title="Reject User"
                            disabled={user.role === "admin"}
                          >
                            <FiUserX size={16} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete User"
                        disabled={user.role === "admin"}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 p-4 bg-slate-800/25 border-t border-slate-700/50">
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
                    className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-700">
              <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-slate-200">
                      Delete User
                    </h3>
                    <div className="mt-2">
                      <p className="text-md text-slate-400">
                        Are you sure you want to delete{" "}
                        {userToDelete?.firstName} {userToDelete?.lastName}? This
                        action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteUser}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-md"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-700">
              <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-slate-200 mb-4">
                      User Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Name
                        </label>
                        <p className="mt-1 text-md text-slate-200">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Email
                        </label>
                        <p className="mt-1 text-md text-slate-200">
                          {selectedUser.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Role
                        </label>
                        <p className="mt-1 text-md text-slate-200">
                          {selectedUser.role}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Account Type
                        </label>
                        <p className="mt-1 text-md text-slate-200">
                          {selectedUser.sellerType === "company" ? "Shelter/Org" : "Private"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Company
                        </label>
                        <p className="mt-1 text-md text-slate-200">
                          {selectedUser.companyName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Status
                        </label>
                        <p className="mt-1 text-md text-slate-200">
                          {selectedUser.blocked ? "Blocked" : "Active"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Joined
                        </label>
                        <p className="mt-1 text-md text-slate-200">
                          {new Date(
                            selectedUser.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-md font-medium text-slate-400">
                          Last Updated
                        </label>
                        <p className="mt-1 text-md text-slate-200">
                          {new Date(
                            selectedUser.updatedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-md"
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

export default Users;
