const { AdoptionRequest, User, Pet } = require("../models");

// Create a new adopter request
exports.createAdoptionRequest = async (req, res) => {
  try {
    const { userId } = req || {};
    console.log("userId from auth:", userId);

    if (!userId) {
      console.error("No userId found in request auth");
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(userId);
    console.log("User found:", user ? user._id : "No user found");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const {
      title,
      description,
      preferredSpecies,
      preferredBreed,
      preferredSize,
      minAdoptionFee,
      maxAdoptionFee,
      preferredAgeGroup,
      preferredFeatures,
      location,
    } = req.body;

    // Validate required fields
    if (!title || !description || !maxAdoptionFee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let coordinates = user.location.coordinates;
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

    // Create the adopter request object with the correct adopterId
    const adopterRequestData = {
      adopterId: userId,
      title,
      description,
      preferredSpecies,
      preferredBreed,
      preferredSize,
      minAdoptionFee,
      maxAdoptionFee,
      preferredAgeGroup,
      preferredFeatures: preferredFeatures || [],
      location: {
        preferredSize: "Point",
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])],
      },
    };

    console.log("Creating adopter request with data:", adopterRequestData);
    const adopterRequest = new AdoptionRequest(adopterRequestData);

    await adopterRequest.save();
    console.log("Adopter request created:", adopterRequest);
    console.log("Adopter request ID:", adopterRequest._id);
    console.log("Adopter request adopterId:", adopterRequest.adopterId);

    res
      .status(201)
      .json({ message: "Adopter request created successfully", adopterRequest });
  } catch (error) {
    console.error("Create Adopter Request Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all adopter requests (with filters)
exports.getAllAdoptionRequests = async (req, res) => {
  try {
    const {
      preferredSpecies,
      preferredBreed,
      preferredSize,
      minAdoptionFee,
      maxAdoptionFee,
      status = "Active",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status };

    if (preferredSpecies) query.preferredSpecies = preferredSpecies;
    if (preferredBreed) query.preferredBreed = preferredBreed;
    if (preferredSize) query.preferredSize = preferredSize;

    if (minAdoptionFee || maxAdoptionFee) {
      query.maxAdoptionFee = {};
      if (minAdoptionFee) query.maxAdoptionFee.$gte = parseFloat(minAdoptionFee);
      if (maxAdoptionFee) query.minAdoptionFee = { $lte: parseFloat(maxAdoptionFee) };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalRequests = await AdoptionRequest.countDocuments(query);
    const adopterRequests = await AdoptionRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      adopterRequests,
      total: totalRequests,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRequests / limitNum),
    });
  } catch (error) {
    console.error("Get All Adopter Requests Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get adopter requests by user ID
exports.getAdoptionRequestsByUserId = async (req, res) => {
  try {
    const { userId } = req || {};
    console.log("userId from auth:", userId);

    if (!userId) {
      console.error("No userId found in request auth");
      return res.status(401).json({ message: "Authentication required" });
    }

    const { status, page = 1, limit = 10 } = req.query;
    console.log("Query params:", { status, page, limit });

    // Debug: List all adopter requests in the database
    const allRequests = await AdoptionRequest.find().limit(20);
    console.log(
      "All adopter requests in DB:",
      allRequests.map((r) => ({
        id: r._id,
        adopterId: r.adopterId,
        title: r.title,
        status: r.status,
      }))
    );

    // Build the query with the correct adopterId
    const query = { adopterId: userId };

    // Handle status case correctly - capitalize first letter if provided
    if (status) {
      // Convert status to proper case (e.g., "active" -> "Active")
      const formattedStatus =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      query.status = formattedStatus;
      console.log("Formatted status for query:", formattedStatus);
    }

    console.log("MongoDB query:", query);

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalRequests = await AdoptionRequest.countDocuments(query);
    console.log("Total matching requests:", totalRequests);

    const adopterRequests = await AdoptionRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    console.log("Found adopter requests:", adopterRequests.length);
    console.log(
      "Adopter requests data:",
      adopterRequests.map((r) => ({
        id: r._id,
        adopterId: r.adopterId,
        title: r.title,
        status: r.status,
      }))
    );

    res.json({
      adopterRequests,
      total: totalRequests,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRequests / limitNum),
    });
  } catch (error) {
    console.error("Get Adopter Requests By User ID Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single adopter request by ID
exports.getAdoptionRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const adopterRequest = await AdoptionRequest.findById(requestId);
    if (!adopterRequest) {
      return res.status(404).json({ message: "Adopter request not found" });
    }

    res.json(adopterRequest);
  } catch (error) {
    console.error("Get Adopter Request By ID Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a adopter request
exports.updateAdoptionRequest = async (req, res) => {
  try {
    const { userId } = req;
    const { requestId } = req.params;

    const adopterRequest = await AdoptionRequest.findById(requestId);
    if (!adopterRequest) {
      return res.status(404).json({ message: "Adopter request not found" });
    }

    if (adopterRequest.adopterId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (adopterRequest.status !== "Active") {
      return res
        .status(400)
        .json({ message: "Only active requests can be updated" });
    }

    const {
      title,
      description,
      preferredSpecies,
      preferredBreed,
      yearFrom,
      yearTo,
      minAdoptionFee,
      maxAdoptionFee,
      preferredAgeGroup,
      preferredFeatures,
      location,
      status,
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (preferredSpecies) updateData.preferredSpecies = preferredSpecies;
    if (preferredBreed) updateData.preferredBreed = preferredBreed;
    if (yearFrom) updateData.yearFrom = yearFrom;
    if (yearTo) updateData.yearTo = yearTo;
    if (minAdoptionFee) updateData.minAdoptionFee = minAdoptionFee;
    if (maxAdoptionFee) updateData.maxAdoptionFee = maxAdoptionFee;
    if (preferredAgeGroup) updateData.preferredAgeGroup = preferredAgeGroup;
    if (preferredFeatures) updateData.preferredFeatures = preferredFeatures;

    if (location && location.coordinates) {
      let coordinates;
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

      updateData.location = {
        preferredSize: "Point",
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])],
      };
    }

    if (status) updateData.status = status;

    const updatedRequest = await AdoptionRequest.findByIdAndUpdate(
      requestId,
      { $set: updateData },
      { new: true }
    );

    res.json({
      message: "Adopter request updated successfully",
      adopterRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Update Adopter Request Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a adopter request
exports.deleteAdoptionRequest = async (req, res) => {
  try {
    const { userId } = req;
    const { requestId } = req.params;

    const adopterRequest = await AdoptionRequest.findById(requestId);
    if (!adopterRequest) {
      return res.status(404).json({ message: "Adopter request not found" });
    }

    if (adopterRequest.adopterId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }


    // Update status to cancelled instead of deleting
    await AdoptionRequest.findByIdAndUpdate(requestId, { status: "Cancelled" });

    res.json({ message: "Adopter request cancelled successfully" });
  } catch (error) {
    console.error("Delete Adopter Request Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Debug function to check adopter requests
exports.debugAdoptionRequests = async (req, res) => {
  try {
    console.log("Debug adopter requests called");

    const { userId } = req || {};
    console.log("Debug - userId from auth:", userId);

    // Get all adopter requests
    const allRequests = await AdoptionRequest.find().limit(20);

    // Get requests for this user
    const userRequests = await AdoptionRequest.find({ adopterId: userId });

    console.log(
      "Debug - All requests:",
      allRequests.map((r) => ({
        id: r._id,
        adopterId: r.adopterId,
        title: r.title,
      }))
    );

    console.log(
      "Debug - User requests:",
      userRequests.map((r) => ({
        id: r._id,
        adopterId: r.adopterId,
        title: r.title,
      }))
    );

    res.json({
      userId,
      totalRequests: allRequests.length,
      userRequestsCount: userRequests.length,
      allRequests: allRequests.map((r) => ({
        id: r._id,
        adopterId: r.adopterId,
        title: r.title,
        createdAt: r.createdAt,
      })),
      userRequests: userRequests.map((r) => ({
        id: r._id,
        adopterId: r.adopterId,
        title: r.title,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Debug Adopter Requests Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin endpoints

// Get adopter request statistics for admin dashboard
exports.getAdoptionRequestStats = async (req, res) => {
  try {
    // Remove admin check for now - direct access

    // Total adopter requests
    const totalRequests = await AdoptionRequest.countDocuments();

    // Requests by status
    const requestsByStatus = await AdoptionRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Requests by preferred condition
    const requestsByCondition = await AdoptionRequest.aggregate([
      {
        $group: {
          _id: "$preferredAgeGroup",
          count: { $sum: 1 },
        },
      },
    ]);

    // Requests by preferredSpecies
    const requestsByMake = await AdoptionRequest.aggregate([
      {
        $match: {
          preferredSpecies: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$preferredSpecies",
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

    // New requests per month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const newRequestsPerMonth = await AdoptionRequest.aggregate([
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

    // Average budget range
    const budgetStats = await AdoptionRequest.aggregate([
      {
        $match: {
          maxAdoptionFee: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgBudgetMax: { $avg: "$maxAdoptionFee" },
          avgBudgetMin: { $avg: "$minAdoptionFee" },
          maxBudget: { $max: "$maxAdoptionFee" },
          minBudget: { $min: "$maxAdoptionFee" },
        },
      },
    ]);


    res.json({
      totalRequests,
      requestsByStatus,
      requestsByCondition,
      requestsByMake,
      newRequestsPerMonth,
      budgetStats: budgetStats[0] || {},
    });
  } catch (error) {
    console.error("Error getting adopter request stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all adopter requests for admin with pagination and filtering
exports.getAllAdoptionRequestsForAdmin = async (req, res) => {
  try {
    // Remove admin check for now - direct access

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const matchFilter = {};
    if (req.query.status) matchFilter.status = req.query.status;
    if (req.query.preferredSpecies) matchFilter.preferredSpecies = req.query.preferredSpecies;
    if (req.query.preferredAgeGroup)
      matchFilter.preferredAgeGroup = req.query.preferredAgeGroup;
    if (req.query.search) {
      matchFilter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { preferredSpecies: { $regex: req.query.search, $options: "i" } },
        { preferredBreed: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Use aggregation with lookup to join with users and get offer counts
    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: "users",
          localField: "adopterId",
          foreignField: "_id",
          as: "adopter",
        },
      },
      {
        $addFields: {
          adopterId: { $arrayElemAt: ["$adopter", 0] },
        },
      },
      {
        $project: {
          adopter: 0,
          offers: 0,
          __v: 0,
          "adopterId._id": 0,
          "adopterId.__v": 0,
          "adopterId.socialMedia": 0,
          "adopterId.phoneNumbers": 0,
          "adopterId.location": 0,
          "adopterId.image": 0,
          "adopterId.description": 0,
          "adopterId.companyName": 0,
          "adopterId.sellerType": 0,
          "adopterId.brands": 0,
          "adopterId.blocked": 0,
          "adopterId.role": 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const requests = await AdoptionRequest.aggregate(pipeline);
    const totalRequests = await AdoptionRequest.countDocuments(matchFilter);
    const totalPages = Math.ceil(totalRequests / limit);

    res.json({
      requests,
      currentPage: page,
      totalPages,
      totalRequests,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error("Error getting adopter requests for admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin function to update adopter request status
exports.updateAdoptionRequestStatusAdmin = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Remove admin check for now - direct access

    if (!["Active", "Fulfilled", "Expired", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await AdoptionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Adopter request not found" });
    }

    request.status = status;
    await request.save();

    res.json({
      message: "Adopter request status updated successfully",
      request,
    });
  } catch (error) {
    console.error("Error updating adopter request status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin function to delete adopter request
exports.deleteAdoptionRequestAdmin = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Remove admin check for now - direct access

    const request = await AdoptionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Adopter request not found" });
    }

    // Delete adopter request from database
    await AdoptionRequest.findByIdAndDelete(requestId);

    res.json({
      message: "Adopter request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting adopter request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
