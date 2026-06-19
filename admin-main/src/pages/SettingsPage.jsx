import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/shared/Header";
import DangerZone from "../components/settings/DangerZone";
import Profile from "../components/settings/Profile";

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      // Clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Remove Authorization header
      delete axios.defaults.headers.common["Authorization"];

      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="Settings" />
      <main className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
        <Profile />
        <DangerZone onLogout={handleLogout} />
      </main>
    </div>
  );
};

export default SettingsPage;
