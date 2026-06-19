import React from "react";
import { useMockMode } from "../../context/MockModeContext";
import { Shield } from "lucide-react";

const MockModeToggle = () => {
  const { isMockMode, setIsMockMode } = useMockMode();

  const handleModeChange = () => {
    if (isMockMode) {
      // Show VPN warning when switching to live mode
      const confirmed = window.confirm(
        "Are you sure you want to switch to -> Live Mode\n\n" +
          "The dutch vpn is only for you or people who work in different countries on this project.\n"
      );
      if (!confirmed) return;
    }
    setIsMockMode(!isMockMode);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-3 shadow-lg border border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-300">Live Mode</span>
          <button
            onClick={handleModeChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isMockMode ? "bg-gray-600" : "bg-indigo-600"
            }`}
            role="switch"
            aria-checked={!isMockMode}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isMockMode ? "translate-x-1" : "translate-x-6"
              }`}
            />
          </button>
          <span className="text-sm text-gray-300">Mock Mode</span>
        </div>
        {!isMockMode && (
          <div className="mt-2 flex items-center text-xs text-yellow-500">
            <Shield className="w-4 h-4 mr-1" />
            <span>Requires Netherlands VPN connection</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockModeToggle;
