"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Check, User } from "lucide-react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { getUserById, updateUserSellerType } from "../../../services/userService";

const SellerTypePage = () => {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(userId);
        setSelectedType(userData.sellerType || null);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    if (userId) loadUser();
  }, [userId]);

  const handleSellerTypeSelection = async (type) => {
    setLoading(true);
    setError(null);
    try {
      setSelectedType(type);
      await updateUserSellerType(userId, type, getToken);
      router.push("/onboarding/seller-details");
    } catch (err) {
      setError(err?.message || "Failed to update account type");
    } finally {
      setLoading(false);
    }
  };

  const options = [
    {
      value: "private",
      icon: User,
      title: "Private adopter",
      description: "Ideal for individuals looking to adopt or re-home a pet. Simple flow with the essentials.",
      points: ["Easy pet listing creation", "Adoption request tracking", "Standard support"],
    },
    {
      value: "company",
      icon: Building2,
      title: "Shelter / Organization",
      description: "For shelters, rescues, and breeders — bulk listings, analytics, and adoption tools.",
      points: ["Bulk pet listing management", "Advanced adoption analytics", "Priority support"],
    },
  ];

  return (
    <div className="marketing-ui flex min-h-screen bg-[#F4F7FB] text-[#0F172A] dark:bg-dark-main dark:text-gray-200">
      <div className="relative hidden overflow-hidden lg:flex lg:w-[42%] xl:w-[45%]">
        <Image
          src="/auth-bg.png"
          alt="Rafraf"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[#0F172A]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-[#0F172A]/20" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-10">
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo-white.png" alt="Rafraf" width={150} height={40} className="h-10 w-auto" />
          </Link>

          <div className="max-w-lg pb-2">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#93C5FD]">
              Get started
            </p>
            <h2 className="font-display text-[2.4rem] font-bold leading-[1.1] text-white xl:text-[3rem]">
              How will you
              <br />
              use Rafraf?
            </h2>
            <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-white/70">
              Pick the account type that matches how you help pets find homes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center overflow-y-auto px-4 py-10 sm:px-8 lg:w-[58%] xl:w-[55%]">
        <div className="w-full max-w-[520px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/">
              <Image src="/logo.png" alt="Rafraf" width={140} height={36} className="h-9 w-auto dark:hidden" />
              <Image src="/logo-white.png" alt="Rafraf" width={140} height={36} className="hidden h-9 w-auto dark:block" />
            </Link>
          </div>

          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
            Account type
          </p>
          <h1 className="font-display text-[1.85rem] font-bold leading-tight md:text-[2.2rem]">
            Choose how you&apos;ll use Rafraf
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#64748B] dark:text-gray-400">
            Select the type of account that fits you best. You can continue setup next.
          </p>

          <div className="mt-8 grid gap-3">
            {options.map(({ value, icon: Icon, title, description, points }) => {
              const active = selectedType === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSellerTypeSelection(value)}
                  className={`border p-5 text-left transition disabled:opacity-60 ${
                    active
                      ? "border-[#2563EB] bg-[#EEF2FF] dark:bg-[#2563EB]/15"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] dark:border-dark-divider dark:bg-dark-card dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center ${
                        active ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#2563EB] dark:bg-dark-raised"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-display text-xl font-bold text-[#0F172A] dark:text-white">
                          {title}
                        </h2>
                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#64748B] dark:text-gray-400">
                        {description}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {points.map((point) => (
                          <li key={point} className="flex items-center gap-2 text-sm text-[#475569] dark:text-gray-300">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {loading && (
            <p className="mt-5 text-center text-sm font-semibold text-[#64748B]">
              Saving your choice...
            </p>
          )}
          {error && (
            <div className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerTypePage;
