import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FiLock, FiMail, FiLoader } from "react-icons/fi";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, try to authenticate with the backend
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store the real JWT token
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem(
          "adminUser",
          JSON.stringify({
            email: data.user.email,
            name: `${data.user.firstName} ${data.user.lastName}`,
            role: data.user.role,
            id: data.user._id,
          })
        );
        toast.success("Welcome to Rafraf Admin!");
        window.location.href = "/";
      } else {
        // Fallback to hardcoded credentials for demo
        if (email === "admin@pawfect.com" && password === "admin123") {
          localStorage.setItem("adminLoggedIn", "true");
          localStorage.setItem("adminToken", "demo-token");
          localStorage.setItem(
            "adminUser",
            JSON.stringify({
              email: "admin@pawfect.com",
              name: "Admin User",
              role: "admin",
              id: "demo-admin",
            })
          );
          toast.success("Welcome to Pawfect Admin! (Demo Mode)");
          window.location.href = "/";
        } else {
          toast.error("Invalid credentials! Use admin@pawfect.com / admin123");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      // Fallback to hardcoded credentials
      if (email === "admin@pawfect.com" && password === "admin123") {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminToken", "demo-token");
        localStorage.setItem(
          "adminUser",
          JSON.stringify({
            email: "admin@pawfect.com",
            name: "Admin User",
            role: "admin",
            id: "demo-admin",
          })
        );
        toast.success("Welcome to Rafraf Admin! (Demo Mode)");
        window.location.href = "/";
      } else {
        toast.error("Failed to connect to server. Check your backend connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-200">
              Rafraf Admin Panel
            </h2>
            <p className="text-slate-400 mt-2">Sign in to manage the platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="admin@pawfect.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <FiLoader className="animate-spin text-xl" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Demo Credentials:<br />
              Email: admin@pawfect.com<br />
              Password: admin123
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
