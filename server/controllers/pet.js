// backend/controllers/petController.js
const { Pet, User } = require("../models");
const fs = require("fs");
let io;

exports.setIo = (socketIo) => {
  io = socketIo;
};

// New: Upload images only (returns URLs)
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }
    const urls = req.files.map((file) => file.cloudinaryUrl);
    res.json({ urls });
  } catch (error) {
    console.error("Upload Images Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Post a new pet (Normal user)
exports.addPet = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.blocked) return res.status(403).json({ message: "Account is blocked" });

    const parseJsonField = (val, defaultVal = []) => {
      if (!val) return defaultVal;
      if (typeof val === "object") return val;
      try { return JSON.parse(val); } catch (e) { return defaultVal; }
    };

    const {
      name, title, description,
      species, breed, ageMonths, gender, size, color, coatLength,
      healthStatus, specialNeeds,
      adoptionFee, currency, adoptionStatus,
      personality, isFeatured,
    } = req.body;

    // Validate required fields per schema
    if (!name || !title || !description || !species) {
      return res.status(400).json({
        message: "Missing required fields: name, title, description, species",
      });
    }

    // Build image list from pre-uploaded URLs + new file uploads
    let images = [];
    if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    if (req.files && req.files.length > 0) {
      images = [...images, ...req.files.map((f) => f.cloudinaryUrl)];
    }

    const categorizedImages = images.map((url, i) => ({
      url, category: "unknown", detected_label: "Processing...", confidence: 0, index: i,
    }));

    const parsedAiSections  = parseJsonField(req.body.aiSections);
    const parsedHealthStatus = parseJsonField(healthStatus, []);
    const parsedPersonality  = parseJsonField(personality, []);
    const isFeaturedBool     = String(isFeatured).toLowerCase() === "true";

    const pet = new Pet({
      createdBy: userId,
      name,
      title,
      description,
      species,
      breed: breed || "",
      ageMonths: ageMonths ? parseInt(ageMonths) : undefined,
      gender: gender || "Unknown",
      size: size || undefined,
      color: color || "",
      coatLength: coatLength || undefined,
      healthStatus: parsedHealthStatus,
      specialNeeds: specialNeeds || "",
      adoptionFee: parseFloat(adoptionFee) || 0,
      currency: currency || "PLN",
      adoptionStatus: adoptionStatus || "Available",
      personality: parsedPersonality,
      images,
      categorizedImages,
      aiSections: parsedAiSections,
      location: user.location,
      status: "Pending",
      isFeatured: isFeaturedBool,
    });

    await pet.save();

    // Background image detection (non-blocking)
    if (images.length > 0) {
      (async () => {
        try {
          const imageDetectionController = require("./imageDetection");
          const detected = await Promise.all(
            images.map(async (url, i) => {
              try {
                const r = await imageDetectionController.detectImage(url);
                return { url, category: r.category || "unknown", detected_label: r.detected_label, confidence: r.confidence, index: i };
              } catch {
                return { url, category: "unknown", detected_label: "Unknown", confidence: 0, index: i };
              }
            })
          );
          await Pet.findByIdAndUpdate(pet._id, { categorizedImages: detected });
        } catch (bgErr) {
          console.error("Background image detection error:", bgErr);
        }
      })();
    }

    res.status(201).json({ message: "Pet posted successfully", pet });
  } catch (error) {
    console.error("Add Pet Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all pets posted by the user (Normal user)
exports.getPetsByUserId = async (req, res) => {
  try {
    const { userId } = req; // Use authenticated user ID for security

    // console.log("userId", userId);
    const pets = await Pet.find({ createdBy: userId })
      .select("-aiSections -categorizedImages")
      .lean();
    // Don't return 404 for empty results, just return empty array
    // console.log("pets", pets);
    res.json(pets);
  } catch (error) {
    console.error("Get Pets By User ID Error:", error);
    res.status(500).json({
      message: "Error fetching pets for the user",
      error: error.message,
    });
  }
};

// Update a pet (Normal user or Admin)
exports.updatePet = async (req, res) => {
  try {
    const { userId } = req;
    const { petId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (pet.createdBy !== userId && user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    if (user.blocked && user.role !== "admin") {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const {
      title,
      description,
      make,
      model,
      trim,
      type,
      year,
      color,
      condition,
      mileage,
      drivetrain,
      transmission,
      fuel,
      engine,
      horsepower,
      accidentHistory,
      serviceHistory,
      vin,
      country,
      petCondition,
      financialInfo,
      location,
      status,
      isFeatured,
      warranties,
    } = req.body;

    let images = pet.images;

    // Handle new image upload logic (mix of URLs and files)
    // If we have explicit images in body (URLs), start with those or replace?
    // Usually update replaces the list.
    let newImagesList = [];

    // 1. Get URLs from body
    if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        newImagesList = [...req.body.images];
      } else if (typeof req.body.images === "string") {
        newImagesList.push(req.body.images);
      }
    } else {
      // If no images in body, keep existing? 
      // Only if we also have no files. 
      // But if user deleted all images, they might send empty array?
      // This logic depends on frontend. Let's assume if body.images is sent, it's the master list.
      if (!req.files || req.files.length === 0) {
        newImagesList = pet.images; // Keep existing if nothing sent
      }
    }

    // 2. Add any new files
    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map((file) => file.cloudinaryUrl);
      newImagesList = [...newImagesList, ...newUrls];
    }

    images = newImagesList;

    // Detect and categorize new images if any were checked/uploaded
    // Note: re-detecting everything might be expensive if we just reordered.
    // Optimization: only detect if no category present?
    // Current logic re-detects everything. For 100 images this could be slow.
    // But since detection is async loop inside controller, it delays response.
    // For now, keep existing logic but apply to 'images'.

    let categorizedImages = []; // Re-evaluate all or merge?
    // The previous logic took 'images' (which were only new files) and appended to pet.categorizedImages?
    // Wait, previous logic: "images = req.files... ? ... : pet.images"
    // Then "if (req.files) ... detect ... categorizedImages = [] ... push new ones"
    // It seemed to only detect NEW files.
    // If we use mixed input, we might have some old URLs (already categorized) and some new ones.

    // Simplest approach: Re-build categorized images.
    // If URL matches existing categorized image, copy it. Else detect.

    const imageDetectionController = require("./imageDetection");

    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      // Check if we already have categorization for this URL
      const existing = pet.categorizedImages?.find(img => img.url === url);

      if (existing) {
        categorizedImages.push({ ...existing, index: i });
      } else {
        // New image (from file or new URL), detect it
        try {
          const detectionResult = await imageDetectionController.detectImage(url);
          categorizedImages.push({
            url: url,
            category: detectionResult.category || "unknown",
            detected_label: detectionResult.detected_label,
            confidence: detectionResult.confidence,
            index: i,
          });
        } catch (error) {
          console.error(`Failed to detect image ${i + 1}:`, error);
          categorizedImages.push({
            url: url,
            category: "unknown",
            detected_label: "Unknown",
            confidence: 0,
            index: i
          });
        }
      }
    }

    let coordinates = pet.location.coordinates;
    if (location && location.coordinates) {
      if (typeof location.coordinates === "string") {
        try {
          coordinates = JSON.parse(location.coordinates);
        } catch (error) {
          return res
            .status(400)
            .json({ message: "Invalid location coordinates format" });
        }
      } else {
        coordinates = location.coordinates;
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (images.length > 0) {
      updateData.images = images; // Keep for backward compatibility
      updateData.categorizedImages = categorizedImages; // New field with categories
    }
    if (make) {
      updateData.make = make;
      updateData.countryOfManufacturer = getCountryOfManufacturer(make);
    }
    if (model) updateData.model = model;
    if (trim) updateData.trim = trim;
    if (type) updateData.type = type;
    if (year) updateData.year = year;
    if (color) updateData.color = color;
    if (condition) updateData.condition = condition;
    if (mileage) updateData.mileage = mileage;
    if (drivetrain) updateData.drivetrain = drivetrain;
    if (transmission) updateData.transmission = transmission;
    if (fuel) updateData.fuel = fuel;
    if (engine) updateData.engine = engine;
    if (horsepower) updateData.horsepower = horsepower;
    if (accidentHistory) updateData.accidentHistory = accidentHistory;
    if (serviceHistory) updateData.serviceHistory = serviceHistory;
    if (vin) updateData.vin = vin;
    if (country) updateData.country = country;
    if (petCondition) updateData.petCondition = petCondition;
    if (typeof warranties !== "undefined") {
      let parsedWarranties = warranties;
      if (typeof warranties === "string") {
        try {
          parsedWarranties = JSON.parse(warranties);
        } catch (e) {
          parsedWarranties = [];
        }
      }
      updateData.warranties = parsedWarranties;
    }
    if (typeof isFeatured !== 'undefined') {
      updateData.isFeatured = String(isFeatured).toLowerCase() === 'true';
    }
    if (financialInfo) {
      // Process financialInfo to handle possible comma-separated strings
      const processedFinancialInfo = {
        ...financialInfo,
      };

      if (financialInfo.sellOptions) {
        processedFinancialInfo.sellOptions = Array.isArray(
          financialInfo.sellOptions
        )
          ? financialInfo.sellOptions
          : String(financialInfo.sellOptions)
            .split(",")
            .map((option) => option.trim());
      }

      if (financialInfo.invoiceOptions) {
        processedFinancialInfo.invoiceOptions = Array.isArray(
          financialInfo.invoiceOptions
        )
          ? financialInfo.invoiceOptions
          : String(financialInfo.invoiceOptions)
            .split(",")
            .map((option) => option.trim());
      }

      if (financialInfo.priceNetto) {
        processedFinancialInfo.priceNetto = parseFloat(
          financialInfo.priceNetto
        );
      }

      updateData.financialInfo = {
        ...pet.financialInfo,
        ...processedFinancialInfo,
        sellerType: user.sellerType,
      };
    }
    if (coordinates) {
      updateData.location = {
        type: "Point",
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])],
      };
    }
    if (status && user.role === "admin") updateData.status = status;
    updateData.updatedAt = new Date();

    const updatedPet = await Pet.findByIdAndUpdate(
      petId,
      { $set: updateData },
      { new: true }
    );

    // Emit pet status update if status changed
    if (status && io) {
      io.emit("petStatusUpdate", { petId, status });
    }

    res.json({ message: "Pet updated successfully", pet: updatedPet });
  } catch (error) {
    console.error("Update Pet Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a pet (Normal user or Admin)
exports.deletePet = async (req, res) => {
  try {
    const { userId } = req;
    const { petId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (pet.createdBy !== userId && user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    if (user.blocked && user.role !== "admin") {
      return res.status(403).json({ message: "Account is blocked" });
    }

    await Pet.findByIdAndDelete(petId);
    res.json({ message: "Pet deleted successfully" });
  } catch (error) {
    console.error("Delete Pet Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all pets (Public)
exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: "Approved" })
      .select('-aiSections -categorizedImages')
      .lean()
      .limit(100)
      .populate(
      "createdBy",
      "firstName lastName"
    );
    res.status(200).json(pets); // Returns an array of pets
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured pets (Public)
exports.getFeaturedPets = async (req, res) => {
  try {
    const pets = await Pet.find({ isFeatured: true, status: "Approved" })
      .select('-aiSections -categorizedImages')
      .lean()
      .limit(50)
      .sort({
      createdAt: -1,
    });
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single pet by ID (Public)
exports.getPetById = async (req, res) => {
  try {
    console.log("req.params:", req.params);
    const { petId } = req.params;
    const pet = await Pet.findById(petId);
    if (!pet || pet.status !== "Approved") {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.json(pet);
  } catch (error) {
    console.error("Get Pet By ID Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update pet status (Admin only)
exports.updatePetStatus = async (req, res) => {
  try {
    const { userId } = req;
    const { petId } = req.params;
    let { status } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Normalize status (accept case-insensitive and legacy values)
    if (typeof status === "string") {
      const raw = status.trim().toLowerCase();
      const legacyMap = { available: "Approved", pending: "Pending", suspended: "Rejected", rejected: "Rejected", approved: "Approved" };
      status = legacyMap[raw] || (raw.charAt(0).toUpperCase() + raw.slice(1));
    }

    if (!status || !["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status value. Valid values are: Pending, Approved, Rejected.",
      });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      petId,
      { status },
      { new: true }
    );
    if (!updatedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.json({ message: "Pet status updated successfully", pet: updatedPet });
  } catch (error) {
    console.error("Update Pet Status Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search pets with multiple query parameters (Public)
exports.searchPets = async (req, res) => {
  try {
    const {
      longitude,
      latitude,
      maxDistance = 10,
      make,
      model,
      type,
      trim,
      yearFrom,
      yearTo,
      condition,
      mileage,
      minMileage,
      drivetrain,
      transmission,
      fuel,
      engine,
      serviceHistory,
      accidentHistory,
      countryOfManufacturer,
      page = 1,
      limit = 10,
    } = req.query;

    // DEBUG: Log country filter parameter
    console.log("🔍 searchPets - countryOfManufacturer param:", countryOfManufacturer);

    let query = {};

    // Location-based search (geospatial query)
    if (longitude && latitude) {
      const locationPoint = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
      query.location = {
        $nearSphere: {
          $geometry: locationPoint,
          $maxDistance: maxDistance * 1000,
        },
      };
    }

    // Search filters
    if (make) query.make = make;
    if (model) query.model = model;
    if (type) query.type = type;
    if (trim) query.trim = trim;
    if (condition) query.condition = condition;
    if (drivetrain) query.drivetrain = drivetrain;
    if (transmission) query.transmission = transmission;
    if (fuel) query.fuel = fuel;
    if (engine) query.engine = engine;
    if (serviceHistory) query.serviceHistory = serviceHistory;
    if (accidentHistory) query.accidentHistory = accidentHistory;
    if (countryOfManufacturer) {
      query.countryOfManufacturer = countryOfManufacturer;
      console.log("✅ Country filter applied to query:", countryOfManufacturer);
    }

    // Year range filter
    if (yearFrom && yearTo) {
      query.year = { $gte: yearFrom, $lte: yearTo };
    }

    // Mileage filter (support range)
    if (minMileage || mileage) {
      query.mileage = {};
      if (minMileage) {
        query.mileage.$gte = parseInt(minMileage, 10);
      }
      if (mileage) {
        query.mileage.$lte = parseInt(mileage, 10);
      }
    }

    // Only approved pets for public search
    query.status = "Approved";

    // DEBUG: Log the complete query
    console.log("🔍 searchPets - Complete query:", JSON.stringify(query, null, 2));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalPets = await Pet.countDocuments(query);
    const pets = await Pet.find(query)
      .select('-aiSections -categorizedImages')
      .lean()
      .skip(skip)
      .limit(limitNum);

    // DEBUG: Log results
    console.log(`🔍 searchPets - Found ${totalPets} total pets, returning ${pets.length} pets`);
    if (countryOfManufacturer && pets.length > 0) {
      console.log("🔍 Sample pet countryOfManufacturer values:",
        pets.slice(0, 3).map(c => ({ make: c.make, country: c.countryOfManufacturer }))
      );
    }

    res.json({
      pets,
      total: totalPets,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalPets / limitNum),
    });
  } catch (error) {
    console.error("Search Pets Error:", error);
    res
      .status(500)
      .json({ message: "Error searching pets", error: error.message });
  }
};

// Get recommended pets (Public)
exports.getRecommendedPets = async (req, res) => {
  try {
    const { petId } = req.params;
    const { priceRange = 5000 } = req.query;

    if (!petId) {
      return res.status(400).json({ message: "Pet ID is required" });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const { make, model, trim, financialInfo } = pet;
    const priceNetto = financialInfo.priceNetto;

    let query = {
      _id: { $ne: petId }, // Exclude the current pet
      status: "Approved",
    };

    query.$or = [
      { make },
      { model },
      { trim },
      {
        "financialInfo.priceNetto": {
          $gte: priceNetto - parseFloat(priceRange),
          $lte: priceNetto + parseFloat(priceRange),
        },
      },
    ];

    const recommendedPets = await Pet.find(query)
      .select('-aiSections -categorizedImages')
      .lean()
      .limit(20);
    if (recommendedPets.length === 0) {
      return res.status(404).json({ message: "No recommended pets found" });
    }

    res.json(recommendedPets);
  } catch (error) {
    console.error("Get Recommended Pets Error:", error);
    res.status(500).json({
      message: "Error fetching recommended pets",
      error: error.message,
    });
  }
};

// Admin endpoints

// Get pet statistics for admin dashboard
exports.getPetStats = async (req, res) => {
  try {
    // Remove admin check for now - direct access

    // Total pets
    const totalPets = await Pet.countDocuments();

    // Pets by status
    const petsByStatus = await Pet.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Pets by make
    const petsByMake = await Pet.aggregate([
      {
        $group: {
          _id: "$make",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Pets by condition
    const petsByCondition = await Pet.aggregate([
      {
        $group: {
          _id: "$petCondition.overall",
          count: { $sum: 1 },
        },
      },
    ]);

    // Pets by seller type
    const petsBySellerType = await Pet.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $group: {
          _id: "$seller.sellerType",
          count: { $sum: 1 },
        },
      },
    ]);

    // New pets per month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const newPetsPerMonth = await Pet.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Average price by make
    const avgPriceByMake = await Pet.aggregate([
      {
        $match: {
          "financialInfo.priceNetto": { $exists: true, $ne: "" },
        },
      },
      {
        $addFields: {
          priceAsNumber: { $toDouble: "$financialInfo.priceNetto" },
        },
      },
      {
        $group: {
          _id: "$make",
          avgPrice: { $avg: "$priceAsNumber" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gte: 5 }, // Only include makes with at least 5 pets
        },
      },
      {
        $sort: { avgPrice: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.json({
      totalPets,
      petsByStatus,
      petsByMake,
      petsByCondition,
      petsBySellerType,
      newPetsPerMonth,
      avgPriceByMake,
    });
  } catch (error) {
    console.error("Error getting pet stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all pets for admin with pagination and filtering
exports.getAllPetsForAdmin = async (req, res) => {
  try {
    // Remove admin check for now - direct access

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const matchFilter = {};
    if (req.query.make) matchFilter.make = req.query.make;
    if (req.query.model) matchFilter.model = req.query.model;
    if (req.query.status) matchFilter.status = req.query.status;
    if (req.query.condition)
      matchFilter["petCondition.overall"] = req.query.condition;
    if (req.query.search) {
      matchFilter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { make: { $regex: req.query.search, $options: "i" } },
        { model: { $regex: req.query.search, $options: "i" } },
        { vin: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Use aggregation with lookup to join with users
    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $addFields: {
          createdBy: { $arrayElemAt: ["$creator", 0] },
        },
      },
      {
        $project: {
          creator: 0,
          __v: 0,
          "createdBy._id": 0,
          "createdBy.__v": 0,
          "createdBy.socialMedia": 0,
          "createdBy.phoneNumbers": 0,
          "createdBy.location": 0,
          "createdBy.image": 0,
          "createdBy.description": 0,
          "createdBy.brands": 0,
          "createdBy.blocked": 0,
          "createdBy.role": 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const pets = await Pet.aggregate(pipeline);
    const totalPets = await Pet.countDocuments(matchFilter);
    const totalPages = Math.ceil(totalPets / limit);

    res.json({
      pets,
      currentPage: page,
      totalPages,
      totalPets,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error("Error getting pets for admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin function to update pet status
exports.updatePetStatusAdmin = async (req, res) => {
  try {
    const { petId } = req.params;
    let { status } = req.body;

    // Remove admin check for now - direct access

    // Normalize status (accept case-insensitive and legacy values)
    if (typeof status === "string") {
      const raw = status.trim().toLowerCase();
      const legacyMap = { available: "Approved", pending: "Pending", suspended: "Rejected", rejected: "Rejected", approved: "Approved" };
      status = legacyMap[raw] || (raw.charAt(0).toUpperCase() + raw.slice(1));
    }

    const allowed = ["Pending", "Approved", "Rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${allowed.join(", ")}` });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      petId,
      { status },
      { new: true }
    );

    if (!updatedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({
      message: "Pet status updated successfully",
      pet: updatedPet,
    });
  } catch (error) {
    console.error("Error updating pet status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin function to delete pet
exports.deletePetAdmin = async (req, res) => {
  try {
    const { petId } = req.params;

    // Remove admin check for now - direct access

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Delete pet from database
    await Pet.findByIdAndDelete(petId);

    res.json({
      message: "Pet deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pet:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
