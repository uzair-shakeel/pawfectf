"use client";

import Link from "next/link";
import { BiAddToQueue } from "react-icons/bi";
import { BsChatLeftDots } from "react-icons/bs";
import { FaCar } from "react-icons/fa";

export default function QuickActions() {
  const actions = [
    {
      href: "/dashboard/cars/add",
      label: "Utwórz Samochód",
      icon: <BiAddToQueue className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-600",
    },
    {
      href: "/dashboard/cars",
      label: "Zarządzaj Samochodami",
      icon: <FaCar className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-600",
    },
    {
      href: "/dashboard/messages",
      label: "Otwórz Wiadomości",
      icon: <BsChatLeftDots className="w-5 h-5" />,
      color: "from-fuchsia-500 to-pink-600",
    },
  ];

  return (
    <div className="p-4 bg-white dark:bg-dark-panel shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-200 dark:text-white transition-colors duration-300">
        Szybkie akcje
      </h3>
      <div className="space-y-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group rounded-lg ring-1 ring-black/5 dark:ring-white/10 p-3 flex items-center gap-3 hover:shadow transition bg-gradient-to-br ${a.color} text-white`}
          >
            <div className="w-9 h-9 rounded-md bg-white/20 backdrop-blur flex items-center justify-center">
              {a.icon}
            </div>
            <span className="font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
