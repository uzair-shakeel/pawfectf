// Mock data for Resume Builder Dashboard
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const mockData = {
  months,
  cvStats: {
    conversionRate: 68.5,
    createdPerMonth: [
      120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450,
    ],
    downloadedPerMonth: [
      80, 100, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310,
    ],
    popularTemplates: [
      { name: "Modern", usage: 580 },
      { name: "Classic", usage: 520 },
      { name: "Professional", usage: 480 },
      { name: "HR", usage: 420 },
      { name: "Sherlock", usage: 380 },
      { name: "Student", usage: 350 },
      { name: "Minimal", usage: 320 },
      { name: "Teal", usage: 280 },
      { name: "Circulaire", usage: 250 },
    ],
  },
  coverLetterStats: {
    conversionRate: 72.3,
    createdPerMonth: [
      90, 110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310,
    ],
    downloadedPerMonth: [
      65, 80, 95, 110, 125, 140, 155, 170, 185, 200, 215, 230,
    ],
    popularTemplates: [
      { name: "Modern", usage: 520 },
      { name: "Classic", usage: 480 },
      { name: "Professional", usage: 450 },
      { name: "HR", usage: 400 },
      { name: "Sherlock", usage: 350 },
      { name: "Student", usage: 320 },
      { name: "Minimal", usage: 290 },
      { name: "Teal", usage: 260 },
      { name: "Circulaire", usage: 230 },
    ],
  },
  userStats: {
    totalUsers: 15000,
    activeUsers: 12500,
    monthlyActiveUsers: [
      8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, 12500, 13000,
      13500,
    ],
    userTypes: [
      { type: "Free Users", count: 7500 },
      { type: "14-Hour Plan", count: 2000 },
      { type: "Monthly Plan", count: 3000 },
      { type: "Quarterly Plan", count: 1500 },
      { type: "Annual Plan", count: 1000 },
    ],
    userGrowth: [500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050],
  },
  revenueStats: {
    totalRevenue: 250000,
    monthlyRevenue: [
      15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000, 38000,
      40000, 42000,
    ],
    revenueBySource: [
      { source: "Monthly Plan", amount: 120000 },
      { source: "Quarterly Plan", amount: 80000 },
      { source: "Annual Plan", amount: 40000 },
      { source: "14-Hour Plan", amount: 10000 },
    ],
  },
};
