import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiHeart,
  FiPackage,
  FiCheckCircle,
} from "react-icons/fi";
import { MdPets } from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get admin user from localStorage
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const handleSignOut = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUser");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/", icon: FiHome },
    { name: "Users", path: "/users", icon: FiUsers },
    { name: "Pets", path: "/pets", icon: MdPets },
    { name: "Adoption Requests", path: "/adoption-requests", icon: FiShoppingCart },
    { name: "Lost & Found", path: "/lost-found", icon: FiSearch },
    { name: "Food Donations", path: "/food-donations", icon: FiHeart },
    { name: "Food Packages", path: "/food-packages", icon: FiPackage },
    { name: "Pet Approvals", path: "/food-pet-approvals", icon: FiCheckCircle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-md">P</span>
          </div>
          <span className="text-xl font-bold text-slate-200">Rafraf Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-md">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-md font-medium text-slate-200 truncate">
              {adminUser.name || "Admin User"}
            </p>
            <p className="text-sm text-slate-400 truncate">
              {adminUser.email || "admin@pawfect.com"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
        >
          <FiLogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
