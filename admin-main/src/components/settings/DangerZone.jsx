import { LogOut } from "lucide-react";

const DangerZone = ({ onLogout }) => {
  return (
    <div className="mt-10">
      <h2 className="text-lg font-medium text-white mb-6">Danger Zone</h2>
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg border border-gray-700 p-6">
        <div className="flex sm:flex-row flex-col gap-4 sm:items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Logout</h3>
            <p className="text-gray-400 text-sm mt-1">
              End your current session and return to login
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center w-fit px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerZone;
