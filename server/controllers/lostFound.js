const { LostFound } = require("../models");

// Get all public lost & found entries
exports.getAllLostFound = async (req, res) => {
  try {
    const entries = await LostFound.find({ status: "Active" })
      .populate("reporterId", "firstName lastName companyName image")
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entries", error: error.message });
  }
};

// Get a specific entry
exports.getLostFoundById = async (req, res) => {
  try {
    const entry = await LostFound.findById(req.params.id)
      .populate("reporterId", "firstName lastName companyName image phoneNumbers email socialMedia");
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entry", error: error.message });
  }
};

// Create new entry
exports.createLostFound = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    // Handle parsed location if coming from FormData string
    let location = req.body.location;
    if (typeof location === "string") {
      try { location = JSON.parse(location); } catch (e) { }
    }

    const newEntry = new LostFound({
      ...req.body,
      location,
      reporterId: userId,
    });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Create entry error:", error);
    res.status(500).json({ message: "Error creating entry", error: error.message });
  }
};

// Update entry
exports.updateLostFound = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.userId;
    const entry = await LostFound.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    if (String(entry.reporterId) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let location = req.body.location;
    if (typeof location === "string") {
      try { location = JSON.parse(location); } catch (e) { }
    }

    const updated = await LostFound.findByIdAndUpdate(
      req.params.id,
      { ...req.body, location },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating entry", error: error.message });
  }
};

// Delete entry
exports.deleteLostFound = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.userId;
    const entry = await LostFound.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Allow owner or admin to delete
    // Need to check if user is admin, assume check in middleware or here
    if (String(entry.reporterId) !== String(userId)) {
        // check role?
        return res.status(403).json({ message: "Not authorized" });
    }

    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting entry", error: error.message });
  }
};

// Get entries for the logged-in user
exports.getUserLostFound = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    const entries = await LostFound.find({ reporterId: userId })
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user entries", error: error.message });
  }
};

// Admin: get all entries (with pagination)
exports.getAdminLostFound = async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const entries = await LostFound.find()
      .populate("reporterId", "firstName lastName companyName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await LostFound.countDocuments();

    res.json({
        entries,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin entries", error: error.message });
  }
};

// Admin: delete any entry
exports.deleteAdminLostFound = async (req, res) => {
    try {
        const entry = await LostFound.findByIdAndDelete(req.params.id);
        if (!entry) return res.status(404).json({ message: "Entry not found" });
        res.json({ message: "Entry deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting entry", error: error.message });
    }
};

// Admin: set status
exports.setAdminLostFoundStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const entry = await LostFound.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!entry) return res.status(404).json({ message: "Entry not found" });
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: "Error updating entry", error: error.message });
    }
};
