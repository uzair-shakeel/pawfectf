import { useState, useEffect } from "react";
import { User } from "lucide-react";
import SettingSection from "./SettingSection";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/me", {
          withCredentials: true,
        });
        setUser(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        setError("Failed to fetch user data");
        console.error("Fetch user error:", error);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validate passwords if changing password
      if (isChangingPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setError("Password must be at least 6 characters long");
          setIsLoading(false);
          return;
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      // Validate name
      if (formData.name.trim().length < 2) {
        setError("Name must be at least 2 characters long");
        setIsLoading(false);
        return;
      }

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...(isChangingPassword && { password: formData.newPassword }),
      };

      const response = await axios.put(
        `http://localhost:3000/api/auth/update-profile`,
        updateData,
        { withCredentials: true }
      );

      // Update local state
      setUser(response.data);
      setIsEditing(false);
      setIsChangingPassword(false);
      setSuccess("Profile updated successfully");

      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          name: response.data.name,
          email: response.data.email,
        })
      );

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <SettingSection icon={User} title="Profil">
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {!isEditing ? (
        <div>
          <div className="flex flex-col sm:flex-row items-center mb-6 gap-4">
            <img
              src="avatar.jpg"
              alt="Profile"
              className="rounded-full w-20 h-20 object-cover"
            />
            <div className="sm:text-left text-center">
              <h3 className="text-lg font-semibold text-gray-100">
                {user.name}
              </h3>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-gray-400 mt-1">Role: {user.role}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
              required
            />
          </div>

          {!isChangingPassword ? (
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="text-indigo-400 hover:text-indigo-300 text-sm underline"
            >
              Change Password
            </button>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  required={isChangingPassword}
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  required={isChangingPassword}
                  minLength={6}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setFormData((prev) => ({
                    ...prev,
                    newPassword: "",
                    confirmPassword: "",
                  }));
                }}
                className="text-red-400 hover:text-red-300 text-sm underline"
              >
                Cancel Password Change
              </button>
            </>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setIsEditing(false);
                setIsChangingPassword(false);
                setFormData({
                  name: user.name,
                  email: user.email,
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </SettingSection>
  );
};

export default Profile;
