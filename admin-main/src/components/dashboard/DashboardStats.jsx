import React from "react";
import { motion } from "framer-motion";
import { Ship, Anchor, Navigation, Fuel } from "lucide-react";
import StatCard from "../shared/StatCard";

const DashboardStats = ({ stats }) => {
  return (
    <motion.div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <StatCard
        name="Active Ships"
        icon={Ship}
        value={stats.activeShips}
        color="#6366f1"
      />
      <StatCard
        name="Total Cargo"
        icon={Anchor}
        value={stats.totalCargo}
        color="#8B5CF6"
      />
      <StatCard
        name="Fuel Consumption"
        icon={Fuel}
        value={stats.fuelConsumption}
        color="#EC4899"
      />
      <StatCard
        name="Average Speed"
        icon={Navigation}
        value={stats.avgSpeed}
        color="#10B981"
      />
    </motion.div>
  );
};

export default DashboardStats;
