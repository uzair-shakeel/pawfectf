"use client";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../lib/auth/AuthContext";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, loading } = useAuth();
  const [email, setEmail] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    await requestPasswordReset(email);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Visual */}
      <div className="hidden lg:flex m-2 rounded-3xl lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600">
          <Image
            src="/Hero2-QKTSHICM.webp"
            alt="Rofrof"
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full w-full">
          <div className="text-left w-full">
            <div className="mb-12 absolute top-5 left-5">
              <div className="mb-8">
                <div className="flex items-center">
                  <img src="/logo-white.png" alt="Rofrof Logo" className="h-10 mr-3" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-5 left-5 right-5 w-full max-w-xl">
              <h2 className="text-5xl font-bold mb-8 leading-tight">Reset your access</h2>
              <p className="text-xl font-light opacity-95 leading-relaxed">
                Enter your email address and we will send you a secure link to reset your password.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-200 mb-2">Forgot your password</h1>
            <p className="text-base text-gray-600">We will send you a link to reset your password</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium tracking-wide"
            >
              {loading ? "Loading..." : "Send Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
