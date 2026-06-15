"use client";
import { useAuth } from "../../lib/auth/AuthContext";
import DashboardStats from "../../components/dashboard/DashboardStats";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-50 min-h-full">
      <DashboardStats user={user} />
    </div>
  );
}
