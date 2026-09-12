"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const PendingApprovalScreen = ({ user }) => {
  const { logout, updateUserState } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState({ text: "", tone: "pending" });

  const checkApprovalStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${API_BASE}/users/${user.id || user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const userData = await response.json();
      if (userData.approvalStatus === "approved") {
        updateUserState(userData);
        router.push("/dashboard/home");
      }
    } catch (error) {
      console.error("Auto-check error:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkApprovalStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshStatus = async () => {
    try {
      setIsRefreshing(true);
      setNotice({ text: "", tone: "pending" });
      const token = localStorage.getItem("token");
      if (!token) {
        setNotice({ text: "Failed to refresh status. Please try again.", tone: "error" });
        return;
      }

      const response = await fetch(`${API_BASE}/users/${user.id || user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setNotice({ text: "Failed to refresh status. Please try again.", tone: "error" });
        return;
      }

      const userData = await response.json();
      const updatedUser = { ...userData, hasSeenApproval: false };
      updateUserState(updatedUser);

      if (updatedUser.approvalStatus === "approved") {
        setNotice({
          text: "Congratulations! Your account has been approved. Redirecting to dashboard...",
          tone: "success",
        });
        setTimeout(() => router.push("/dashboard/home"), 1500);
      } else if (updatedUser.approvalStatus === "pending") {
        setNotice({
          text: "Your account is still pending approval. Please wait for admin review.",
          tone: "pending",
        });
      } else if (updatedUser.approvalStatus === "rejected") {
        setNotice({
          text: "Your account has been rejected. Please contact support.",
          tone: "error",
        });
      } else {
        setNotice({
          text: `Status refreshed! Current status: ${updatedUser.approvalStatus || "Unknown"}`,
          tone: "pending",
        });
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
      setNotice({
        text: "Error refreshing status. Please try again.",
        tone: "error",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const name = user?.firstName || "User";
  const steps = [
    { title: "Account Review", text: "Our admin team reviews your profile and information" },
    { title: "Approval Decision", text: "You'll receive an email with the decision" },
    { title: "Full Access", text: "Once approved, you'll have full access to all features" },
  ];

  const noticeClass = {
    pending: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200",
    success: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200",
    error: "border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-200",
  }[notice.tone];

  return (
    <div className="marketing-ui flex min-h-screen items-center justify-center bg-[#F4F7FB] px-4 py-6 text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <div className="w-full max-w-[560px]">
        <Link href="/" className="mb-5 flex justify-center">
          <Image src="/logo.png" alt="Rafraf" width={180} height={48} className="h-12 w-auto dark:hidden" />
          <Image src="/whitelogo.png" alt="Rafraf" width={180} height={48} className="hidden h-12 w-auto dark:block" />
        </Link>

        <div className="border border-[#E2E8F0] bg-white dark:border-dark-divider dark:bg-dark-card">
          <div className="border-b border-[#E2E8F0] px-5 py-5 text-center dark:border-dark-divider">
            <span className="inline-flex items-center gap-1.5 border border-amber-300 bg-amber-50 px-2.5 py-1 text-sm font-semibold leading-none text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="leading-none">Pending Admin Approval</span>
            </span>
            <h1 className="font-display mt-3 text-[1.65rem] font-bold leading-tight md:text-[2rem]">
              Account Pending Approval
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-gray-400">
              Welcome, {name}! Your account is currently under review.
            </p>
          </div>

          <div className="border-l-4 border-amber-400 bg-amber-50 px-5 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-400 dark:bg-amber-500/10 dark:text-amber-100">
            Our team is reviewing your account information to ensure everything meets our standards. This process typically takes 24-48 hours. You'll receive an email notification once your account is approved.
          </div>

          <div className="px-5 py-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
              What Happens Next?
            </h2>
            <div className="mt-3 space-y-3">
              {steps.map((step, i) => (
                <div key={step.title} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-sm leading-snug text-[#64748B] dark:text-gray-400">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] px-5 py-3 dark:border-dark-divider">
            <Link href="/website/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB]">
              <Mail className="h-4 w-4" />
              Contact Support
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-semibold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>

        {notice.text && (
          <p className={`mt-3 border px-3 py-2 text-sm font-medium ${noticeClass}`}>{notice.text}</p>
        )}

        <button
          type="button"
          onClick={handleRefreshStatus}
          disabled={isRefreshing}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 bg-[#2563EB] text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-[#1D4ED8] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Status"}
        </button>
      </div>
    </div>
  );
};

export default PendingApprovalScreen;
