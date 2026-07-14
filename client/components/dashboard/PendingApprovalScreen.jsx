import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiClock, FiMail, FiShield, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "../../lib/auth/AuthContext";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const PendingApprovalScreen = ({ user }) => {
  const { logout, updateUserState } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Auto-check approval status every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await checkApprovalStatus();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Function to check approval status
  const checkApprovalStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_BASE}/users/${user.id || user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();

        if (userData.approvalStatus === "approved") {
          updateUserState(userData);
          // Redirect immediately
          router.push("/dashboard/home");
        }
      }
    } catch (error) {
      console.error("Auto-check error:", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleRefreshStatus = async () => {
    try {
      setIsRefreshing(true);

      // Get the current token
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        alert("No authentication token found. Please login again.");
        return;
      }

      // Fetch updated user data
      const response = await fetch(
        `${API_BASE}/users/${user.id || user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();

        // Add a flag to show this is a fresh approval
        const updatedUser = {
          ...userData,
          hasSeenApproval: false,
        };

        // Update the user state in AuthContext
        updateUserState(updatedUser);

        // Show success message and redirect if approved
        if (updatedUser.approvalStatus === "approved") {
          alert(
            "🎉 Congratulations! Your account has been approved! Redirecting to dashboard..."
          );
          setTimeout(() => {
            router.push("/dashboard/home");
          }, 1500);
        } else if (updatedUser.approvalStatus === "pending") {
          alert(
            "⏳ Your account is still pending approval. Please wait for admin review."
          );
        } else if (updatedUser.approvalStatus === "rejected") {
          alert("❌ Your account has been rejected. Please contact support.");
        } else {
          alert(
            `Status refreshed! Current status: ${updatedUser.approvalStatus || "Unknown"}`
          );
        }
      } else {
        alert("Failed to refresh status. Please try again.");
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
      alert("Error refreshing status. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-dark-main flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiClock className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-200 mb-3">
            Account Pending Approval
          </h1>
          <p className="text-slate-400 text-lg">
            Welcome, {user?.firstName || "User"}! Your account is currently
            under review.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-slate-900/50 dark:bg-dark-elevation-4 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-200">
                Review Status
              </h2>
              <p className="text-yellow-400 font-medium">
                Pending Admin Approval
              </p>
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed">
            Our team is reviewing your account information to ensure everything
            meets our standards. This process typically takes 24-48 hours.
            You'll receive an email notification once your account is approved.
          </p>
        </div>

        {/* What Happens Next */}
        <div className="bg-slate-900/50 dark:bg-dark-elevation-4 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-slate-200 mb-4">
            What Happens Next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-md font-medium">1</span>
              </div>
              <div>
                <p className="text-slate-200 font-medium">Account Review</p>
                <p className="text-slate-400 text-md">
                  Our admin team reviews your profile and information
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-md font-medium">2</span>
              </div>
              <div>
                <p className="text-slate-200 font-medium">Approval Decision</p>
                <p className="text-slate-400 text-md">
                  You'll receive an email with the decision
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-md font-medium">3</span>
              </div>
              <div>
                <p className="text-slate-200 font-medium">Full Access</p>
                <p className="text-slate-400 text-md">
                  Once approved, you'll have full access to all features
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-slate-900/50 dark:bg-dark-elevation-4 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <FiMail className="w-5 h-5 text-slate-400" />
            <span className="text-slate-400">Need help?</span>
          </div>
          <p className="text-slate-300 mb-4">
            If you have any questions about your account or need assistance,
            please don't hesitate to contact our support team.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            Contact Support
          </button>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-y-4">
          <button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className={`flex items-center justify-center space-x-2 mx-auto px-6 py-3 rounded-lg transition-colors font-medium ${isRefreshing
              ? "bg-blue-800 text-blue-200 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            <FiRefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
          </button>

          <div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingApprovalScreen;
