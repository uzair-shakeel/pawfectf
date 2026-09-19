"use client";

import Link from "next/link";
import { BiAddToQueue } from "react-icons/bi";
import { BsChatLeftDots } from "react-icons/bs";
import { FaPaw } from "react-icons/fa";

export default function QuickActions() {
  const actions = [
    {
      href: "/dashboard/cars/add",
      label: "Wystaw zwierzę",
      icon: <BiAddToQueue className="h-5 w-5" />,
    },
    {
      href: "/dashboard/cars",
      label: "Moje ogłoszenia",
      icon: <FaPaw className="h-5 w-5" />,
    },
    {
      href: "/dashboard/messages",
      label: "Wiadomości",
      icon: <BsChatLeftDots className="h-5 w-5" />,
    },
  ];

  return (
    <div className="border border-[#E2E8F0] bg-white p-5 dark:border-dark-divider dark:bg-dark-card">
      <h3 className="mb-4 font-display text-lg font-bold text-[#0F172A] dark:text-white">
        Szybkie akcje
      </h3>
      <div className="space-y-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 border border-[#E2E8F0] bg-[#F4F7FB] px-3.5 py-3 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#EEF2FF] dark:border-dark-divider dark:bg-dark-raised dark:text-white dark:hover:border-[#2563EB]"
          >
            <span className="flex h-9 w-9 items-center justify-center bg-[#2563EB] text-white">
              {a.icon}
            </span>
            <span>{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
