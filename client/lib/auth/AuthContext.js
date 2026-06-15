"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Prefer same-origin by default if env is not provided
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/";
axios.defaults.baseURL = API_BASE;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        const raw = JSON.parse(storedUser);
        // Normalize image fields
        const userData = {
          ...raw,
          image: raw?.image || raw?.profilePicture || "",
          profilePicture: raw?.profilePicture || raw?.image || "",
        };
        console.log("userData", storedToken);
        setToken(storedToken);
        setUser(userData);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;

        console.log("Auth initialized successfully:", {
          userId: userData?.id || userData?._id,
          email: userData?.email,
        });
      } else {
        console.log("No stored auth data found");
      }
    };

    initAuth();
  }, []);

  // Sign in
  const signIn = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/signin`,
        credentials
      );

      const { token: newToken, user: raw } = response.data;
      const userData = {
        ...raw,
        image: raw?.image || raw?.profilePicture || "",
        profilePicture: raw?.profilePicture || raw?.image || "",
      };

      console.log("Signin successful:", {
        userId: userData?.id || userData?._id,
        email: userData?.email,
        hasToken: !!newToken,
      });

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      toast.success("Signed in successfully");
      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      const message =
        error.response?.data?.message || error.message || "Sign in failed";
      toast.error(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign up
  const signUp = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/signup`,
        userData
      );

      if (response.data.requiresOTP) {
        toast.success(
          "Account created. Please verify with the OTP sent to your email."
        );
        return {
          success: true,
          requiresOTP: true,
          userId: response.data.userId,
          otp: response.data.otp,
        };
      } else {
        const { token: newToken, user: userInfo } = response.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userInfo));

        setToken(newToken);
        setUser(userInfo);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        toast.success("Signed up successfully");
        return { success: true };
      }
    } catch (error) {
      console.error("Sign up error:", error);
      const message =
        error.response?.data?.message || error.message || "Sign up failed";
      toast.error(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (userId, otp) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/auth/verify-otp`, {
        userId,
        otp,
      });

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      toast.success("OTP verified. You are signed in.");
      return { success: true };
    } catch (error) {
      console.error("OTP verification error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "OTP verification failed";
      toast.error(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/auth/resend-otp`, {
        userId,
      });

      toast.success("OTP resent to your email");
      return {
        success: true,
        otp: response.data.otp,
      };
    } catch (error) {
      console.error("Resend OTP error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend OTP";
      toast.error(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      toast.success("If the email exists, a reset link was sent");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Request failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, { token, newPassword });
      toast.success("Password has been reset");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Reset failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Change password for logged-in user
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/api/auth/change-password`, { currentPassword, newPassword });
      toast.success("Password changed successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Change failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Google sign in
  const signInWithGoogle = async (googleData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/google`,
        googleData
      );

      const { token: newToken, user: userData } = response.data;

      console.log("Google sign in response:", { newToken, userData });

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      toast.success("Signed in with Google");
      return { success: true };
    } catch (error) {
      console.error("Google sign in error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Google sign in failed";
      toast.error(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Signed out");
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/api/users/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const raw = response.data.user;
      const updatedUser = {
        ...raw,
        image: raw?.image || raw?.profilePicture || "",
        profilePicture: raw?.profilePicture || raw?.image || "",
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update profile",
      };
    } finally {
      setLoading(false);
    }
  };

  // Update user state locally (for when API call is already made)
  const updateUserState = (userData) => {
    const normalized = {
      ...userData,
      image: userData?.image || userData?.profilePicture || "",
      profilePicture: userData?.profilePicture || userData?.image || "",
    };
    localStorage.setItem("user", JSON.stringify(normalized));
    setUser(normalized);
  };

  const value = {
    user,
    token,
    loading,
    signIn,
    signUp,
    verifyOTP,
    resendOTP,
    requestPasswordReset,
    resetPassword,
    changePassword,
    signInWithGoogle,
    logout,
    updateProfile,
    updateUserState,
    getToken: () => token,
    userId: user?.id || user?._id,
    // Expose a simple boolean for UI checks
    isSignedIn: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
