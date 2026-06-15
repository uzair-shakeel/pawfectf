"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import Sidebar from "../../components/dashboard/Sidebar";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import PendingApprovalScreen from "../../components/dashboard/PendingApprovalScreen";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Trigger initial mount to avoid SSR mismatch
    setMounted(true);
    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-refresh user status every 30 seconds if user is pending
  useEffect(() => {
    if (user && user.approvalStatus === "pending") {
      const interval = setInterval(() => {
        setRefreshKey((prev) => prev + 1);
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user?.approvalStatus]);

  if (!mounted) return null;

  // Check if user is pending approval (show pending screen)
  if (user && user.approvalStatus === "pending") {
    return <PendingApprovalScreen user={user} />;
  }

  // Check if user is rejected (show rejected screen)
  if (user && user.approvalStatus === "rejected") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-400 text-2xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-200 mb-3">
            Account Rejected
          </h1>
          <p className="text-slate-400 text-lg mb-6">
            Unfortunately, your account has been rejected. Please contact
            support for more information.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute w-full h-auto min-h-screen top-0">
      <div className="flex justify-center items-center min-h-screen h-auto bg-white dark:bg-gray-950 transition-all duration-300">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main
          className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-0 md:ml-64" : " md:ml-64"
            }`}
        >
          <DashboardNavbar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className=" min-h-[calc(100vh-75px)]">{children}</div>
        </main>
      </div>
    </div>
  );
}
