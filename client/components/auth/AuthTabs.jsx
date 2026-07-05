"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "../../lib/auth/AuthContext";
import GoogleSignIn from "./GoogleSignIn";
import Image from "next/image";

export default function AuthTabs() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpRefs, setOtpRefs] = useState([]);
  const [tempUserId, setTempUserId] = useState(null);
  const [step, setStep] = useState("input");
  const [activeTab, setActiveTab] = useState("email");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();
  const { signUp, verifyOTP, resendOTP, loading } = useAuth();

  // Create refs for OTP inputs
  useEffect(() => {
    setOtpRefs(
      Array(6)
        .fill(0)
        .map(() => React.createRef())
    );
  }, []);

  const handleOtpChange = (index, value) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto-focus next input with slight delay for better UX
    if (numericValue && index < 5) {
      setTimeout(() => {
        otpRefs[index + 1]?.current?.focus();
      }, 10);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current box is empty, go to previous
        setTimeout(() => {
          otpRefs[index - 1]?.current?.focus();
        }, 10);
      } else if (otp[index]) {
        // If current box has value, clear it first
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs[index - 1]?.current?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = pastedData
        .split("")
        .concat(Array(6 - pastedData.length).fill(""));
      setOtp(newOtp);
      // Focus the next empty input or the last one
      const nextEmptyIndex = Math.min(pastedData.length, 5);
      setTimeout(() => {
        otpRefs[nextEmptyIndex]?.current?.focus();
      }, 10);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStep("input");
    setFormData({
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });
    setOtp(["", "", "", "", "", ""]);
    setTempUserId(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password match for signup
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      toast.error("You must accept the Terms & Conditions");
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        termsAccepted: true,
        termsVersion: "v1",
      };

      // Add email or phone based on active tab
      if (activeTab === "email") {
        payload.email = formData.email;
      } else {
        payload.phoneNumber = formData.phoneNumber;
      }

      const result = await signUp(payload);

      if (result.success) {
        if (result.requiresOTP) {
          // Show OTP in alert for testing
          setTempUserId(result.userId);
          setStep("otp");
          toast.success("Please verify your OTP");
        } else {
          toast.success("Sign up successful!");
          router.push("/onboarding/seller-details");
        }
      } else {
        toast.error(result.error || "Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Sign up failed");
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await verifyOTP(tempUserId, otp.join(""));

      if (result.success) {
        toast.success("Verification successful!");
        router.push("/onboarding/seller-details");
      } else {
        toast.error(result.error || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("OTP verification failed");
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await resendOTP(tempUserId);

      if (result.success) {
        toast.success("OTP resent successfully");
      } else {
        toast.error(result.error || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP");
    }
  };

  const handleGoogleSuccess = (data) => {
    router.push("/onboarding/seller-details");
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-dark-main transition-colors duration-300">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-200 dark:text-white mb-3 transition-colors duration-300">
                Verify Your Account
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Enter the OTP sent to your{" "}
                {activeTab === "email" ? "email" : "phone"}
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-4 text-center transition-colors duration-300">
                  OTP Code
                </label>
                <div className="flex justify-center space-x-3 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      value={otp[index] || ""}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      ref={otpRefs[index]}
                      className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${otp[index]
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                      placeholder=""
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 font-medium transition-colors duration-300"
              >
                Resend OTP
              </button>
              <div>
                <button
                  onClick={() => setStep("input")}
                  className="text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-300"
                >
                  ← Back to form
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Visual Section */}
        <div className="hidden lg:flex m-2 rounded-3xl lg:w-1/2 relative overflow-hidden">
          {/* Abstract Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600">
            <Image
              src="/Hero2-QKTSHICM.webp"
              alt="Rafraf Logo"
              fill
              className="object-cover brightness-75"
              priority
            />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full w-full">
            <div className="text-left w-full">
              {/* Top Quote Label */}
              <div className="mb-12 absolute top-5 left-5">
                {/* Logo */}
                <div className="mb-8">
                  <div className="flex items-center">
                    <img
                      src="/logo-white.png"
                      alt="Rafraf Logo"
                      className="h-10 mr-3"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-5 left-5 right-5 w-full max-w-lg">
                {/* Main Quote */}
                <h2 className="text-6xl font-bold mb-8 leading-tight">
                  Enter Your
                  <br />
                  Verification Code
                </h2>

                {/* Sub Text */}
                <p className="text-xl font-light opacity-95 leading-relaxed">
                  Please enter the one-time code you received to continue.
                  Didn’t get it? Check again or request a new code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-900 overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Full-Screen Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Hero2-QKTSHICM.webp"
          alt="Rafraf Background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40"></div>
      </div>

      {/* Centered Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white/10 dark:bg-dark-card/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <Image src="/logo-white.png" alt="Rafraf" width={140} height={40} className="h-10 w-auto" />
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">
            Join Rafraf Today
          </h1>
          <p className="text-lg text-gray-200 font-medium max-w-md mx-auto">
            Create an account to start your journey and find your new best friend.
          </p>
        </div>

        <div className="flex bg-black/20 backdrop-blur-md rounded-xl p-1 mb-8 shadow-inner">
          <Link href="/sign-in" className="flex-1 py-3 text-center rounded-lg text-gray-300 hover:text-white hover:bg-white/10 font-medium transition-all">
            Log In
          </Link>
          <Link href="/sign-up" className="flex-1 py-3 text-center rounded-lg bg-white text-gray-900 font-black shadow-lg transition-all scale-100">
            Sign Up
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="firstName" className="block text-sm font-bold text-gray-200 mb-2 drop-shadow-sm">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-4 bg-white/80 dark:bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 backdrop-blur-sm transition-all"
                placeholder="First Name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-bold text-gray-200 mb-2 drop-shadow-sm">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-4 bg-white/80 dark:bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 backdrop-blur-sm transition-all"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label htmlFor={activeTab === "email" ? "email" : "phoneNumber"} className="block text-sm font-bold text-gray-200 mb-2 drop-shadow-sm">
              {activeTab === "email" ? "Email Address" : "Phone Number"}
            </label>
            <input
              type={activeTab === "email" ? "email" : "tel"}
              id={activeTab === "email" ? "email" : "phoneNumber"}
              name={activeTab === "email" ? "email" : "phoneNumber"}
              value={activeTab === "email" ? formData.email : formData.phoneNumber}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 bg-white/80 dark:bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 backdrop-blur-sm transition-all"
              placeholder={activeTab === "email" ? "Enter your email" : "Enter your phone number"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-200 mb-2 drop-shadow-sm">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                className="w-full px-5 py-4 bg-white/80 dark:bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 backdrop-blur-sm transition-all"
                placeholder="Create a password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-200 mb-2 drop-shadow-sm">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength="6"
                className="w-full px-5 py-4 bg-white/80 dark:bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 backdrop-blur-sm transition-all"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-5 h-5 text-blue-500 border-white/30 rounded focus:ring-blue-400 focus:ring-offset-gray-900 bg-white/20"
            />
            <label htmlFor="terms" className="ml-3 text-sm font-medium text-gray-300">
              I agree to the <Link href="/terms" className="text-white font-bold hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-white font-bold hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-4 px-6 rounded-xl font-black text-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-70 transition-all shadow-lg shadow-blue-500/30 transform active:scale-[0.98]"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-300 font-medium">
            Already have an account? {" "}
            <Link href="/sign-in" className="text-white font-black hover:underline underline-offset-4">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
