require('dotenv').config();
const mongoose = require('mongoose');
const FoodPackage = require('../models/FoodPackage');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Default food packages data
const defaultPackages = [
  {
    name: "Basic Care Package",
    type: "basic",
    description: "Essential daily nutrition for your pet. Includes high-quality dry food and fresh water.",
    pricing: {
      '1_day': 5.99,
      '3_days': 16.99,
      '1_week': 39.99,
      '2_weeks': 74.99,
      '1_month': 139.99,
      '3_months': 399.99,
      '6_months': 749.99
    },
    contents: [
      { item: "Premium dry food", quantity: "1", unit: "kg" },
      { item: "Fresh water", quantity: "500", unit: "ml" },
      { item: "Basic vitamins", quantity: "1", unit: "tablet" }
    ],
    suitableFor: ["dog", "cat"],
    animalSizes: ["small", "medium", "large"],
    features: [
      "High-quality ingredients",
      "Balanced nutrition",
      "Daily delivery",
      "Fresh water included"
    ],
    images: ["/images/basic-package.jpg"]
  },
  {
    name: "Premium Nutrition Package",
    type: "premium",
    description: "Premium nutrition with organic ingredients, treats, and supplements for optimal health.",
    pricing: {
      '1_day': 12.99,
      '3_days': 36.99,
      '1_week': 84.99,
      '2_weeks': 159.99,
      '1_month': 299.99,
      '3_months': 849.99,
      '6_months': 1599.99
    },
    contents: [
      { item: "Organic premium food", quantity: "1.2", unit: "kg" },
      { item: "Healthy treats", quantity: "100", unit: "g" },
      { item: "Multivitamins", quantity: "2", unit: "tablets" },
      { item: "Mineral supplements", quantity: "1", unit: "packet" }
    ],
    suitableFor: ["dog", "cat"],
    animalSizes: ["small", "medium", "large"],
    features: [
      "Organic ingredients",
      "Premium quality",
      "Health supplements",
      "Gourmet treats",
      "Veterinarian approved"
    ],
    images: ["/images/premium-package.jpg"]
  },
  {
    name: "Deluxe Care Package",
    type: "deluxe",
    description: "Luxury nutrition experience with gourmet meals, special treats, and comprehensive health support.",
    pricing: {
      '1_day': 24.99,
      '3_days': 69.99,
      '1_week': 159.99,
      '2_weeks': 299.99,
      '1_month': 569.99,
      '3_months': 1599.99,
      '6_months': 2999.99
    },
    contents: [
      { item: "Gourmet wet & dry food", quantity: "1.5", unit: "kg" },
      { item: "Premium treats variety pack", quantity: "200", unit: "g" },
      { item: "Advanced supplements", quantity: "3", unit: "tablets" },
      { item: "Special dietary additions", quantity: "1", unit: "portion" },
      { item: "Comfort toy", quantity: "1", unit: "piece" }
    ],
    suitableFor: ["dog", "cat"],
    animalSizes: ["small", "medium", "large", "extra_large"],
    features: [
      "Gourmet meals",
      "Luxury treats",
      "Complete health package",
      "Comfort accessories",
      "Veterinary consultation included",
      "Custom meal planning"
    ],
    images: ["/images/deluxe-package.jpg"]
  },
  {
    name: "Bird Nutrition Package",
    type: "premium",
    description: "Specialized nutrition package designed specifically for birds with seeds, fruits, and supplements.",
    pricing: {
      '1_day': 8.99,
      '3_days': 24.99,
      '1_week': 54.99,
      '2_weeks': 99.99,
      '1_month': 189.99,
      '3_months': 539.99,
      '6_months': 999.99
    },
    contents: [
      { item: "Premium bird seed mix", quantity: "500", unit: "g" },
      { item: "Fresh fruits", quantity: "100", unit: "g" },
      { item: "Bird vitamins", quantity: "1", unit: "tablet" },
      { item: "Mineral block", quantity: "1", unit: "piece" }
    ],
    suitableFor: ["bird"],
    animalSizes: ["small"],
    features: [
      "Species-specific nutrition",
      "Fresh fruit included",
      "Essential minerals",
      "Vitamin supplements"
    ],
    images: ["/images/bird-package.jpg"]
  },
  {
    name: "Small Pet Care Package",
    type: "basic",
    description: "Perfect for rabbits, hamsters, and guinea pigs with specialized pellets and fresh vegetables.",
    pricing: {
      '1_day': 6.99,
      '3_days': 19.99,
      '1_week': 44.99,
      '2_weeks': 84.99,
      '1_month': 159.99,
      '3_months': 459.99,
      '6_months': 849.99
    },
    contents: [
      { item: "Species-specific pellets", quantity: "300", unit: "g" },
      { item: "Fresh vegetables", quantity: "150", unit: "g" },
      { item: "Timothy hay", quantity: "200", unit: "g" },
      { item: "Small pet vitamins", quantity: "1", unit: "tablet" }
    ],
    suitableFor: ["rabbit", "hamster", "guinea_pig"],
    animalSizes: ["small"],
    features: [
      "Species-appropriate diet",
      "Fresh vegetables",
      "High-fiber content",
      "Essential vitamins"
    ],
    images: ["/images/small-pet-package.jpg"]
  }
];

const seedPackages = async () => {
  try {
    await connectDB();
    
    console.log('Clearing existing packages...');
    await FoodPackage.deleteMany({});
    
    console.log('Creating default food packages...');
    
    // Create a dummy admin user ID (you should replace this with actual admin ID)
    const adminId = new mongoose.Types.ObjectId();
    
    const packagesWithAdmin = defaultPackages.map(pkg => ({
      ...pkg,
      createdBy: adminId
    }));
    
    await FoodPackage.insertMany(packagesWithAdmin);
    
    console.log(`${defaultPackages.length} food packages created successfully!`);
    
    // Display created packages
    const packages = await FoodPackage.find({}).select('name type pricing');
    console.log('\nCreated packages:');
    packages.forEach(pkg => {
      console.log(`- ${pkg.name} (${pkg.type}) - Day: ${pkg.pricing['1_day']} PLN`);
    });
    
  } catch (error) {
    console.error('Error seeding packages:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedPackages();