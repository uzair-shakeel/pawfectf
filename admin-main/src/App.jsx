import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Sidebar from "./components/shared/Sidebar";

// Pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Pets from "./pages/Pets";
import AdoptionRequests from "./pages/AdoptionRequests";
import LostFound from "./pages/LostFound";
import SettingsPage from "./pages/SettingsPage";
import FoodDonations from "./pages/FoodDonations";
import FoodPackages from "./pages/FoodPackages";
import FoodPetApprovals from "./pages/FoodPetApprovals";

function App() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid #334155",
            },
            success: {
              style: {
                background: "#064e3b",
                color: "#86efac",
                border: "1px solid #059669",
              },
            },
            error: {
              style: {
                background: "#7f1d1d",
                color: "#fca5a5",
                border: "1px solid #dc2626",
              },
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Background with blur */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar />
        <main className="flex-1 relative overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/adoption-requests" element={<AdoptionRequests />} />
            <Route path="/lost-found" element={<LostFound />} />
            <Route path="/food-donations" element={<FoodDonations />} />
            <Route path="/food-packages" element={<FoodPackages />} />
            <Route path="/food-pet-approvals" element={<FoodPetApprovals />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#e2e8f0",
            border: "1px solid #334155",
          },
          success: {
            style: {
              background: "#064e3b",
              color: "#86efac",
              border: "1px solid #059669",
            },
          },
          error: {
            style: {
              background: "#7f1d1d",
              color: "#fca5a5",
              border: "1px solid #dc2626",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
