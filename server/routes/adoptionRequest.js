const express = require("express");
const { auth } = require("../middlewares/auth");
const router = express.Router();
const adoptionRequestController = require("../controllers/adoptionRequest");

// Debug route to verify the router is working
router.get("/test", (req, res) => {
  res.json({ message: "Adopter request routes are working" });
});

// Debug route to get all adopter requests in the database
router.get("/debug/all", async (req, res) => {
  try {
    const { AdoptionRequest } = require("../models");
    const requests = await AdoptionRequest.find().sort({ createdAt: -1 });
    res.json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Debug route error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check adopter requests for the authenticated user
router.get("/debug/user", auth, adoptionRequestController.debugAdoptionRequests);


// @Admin Routes - NO AUTH REQUIRED FOR ADMIN PANEL
// Get adopter request statistics for admin dashboard
router.get("/admin/stats", adoptionRequestController.getAdoptionRequestStats);
// Get all adopter requests for admin with pagination and filtering
router.get("/admin/all", adoptionRequestController.getAllAdoptionRequestsForAdmin);
// Update adopter request status (admin)
router.patch(
  "/admin/:requestId/status",
  adoptionRequestController.updateAdoptionRequestStatusAdmin
);
// Delete adopter request (admin only)
router.delete(
  "/admin/:requestId",
  adoptionRequestController.deleteAdoptionRequestAdmin
);

// Create a new adopter request
router.post("/", auth, adoptionRequestController.createAdoptionRequest);

// Get all adopter requests (for sellers to browse)
router.get("/", adoptionRequestController.getAllAdoptionRequests);

// Get adopter requests by user ID (for adopter's dashboard)
router.get(
  "/my-requests",
  auth,
  adoptionRequestController.getAdoptionRequestsByUserId
);


// Get a single adopter request by ID
router.get("/:requestId", adoptionRequestController.getAdoptionRequestById);

// Update a adopter request
router.put("/:requestId", auth, adoptionRequestController.updateAdoptionRequest);

// Delete/cancel a adopter request
router.delete("/:requestId", auth, adoptionRequestController.deleteAdoptionRequest);

module.exports = router;
