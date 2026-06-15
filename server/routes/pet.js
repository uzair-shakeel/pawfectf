// backend/routes/pet.js
const express = require("express");
const { Pet } = require("../models");
const { auth, getAuth } = require("../middlewares/auth");
const router = express.Router();
const petController = require("../controllers/pet");
const {
  upload,
  uploadToCloudinary,
} = require("../middlewares/uploadMiddleware");

// Middleware to attach auth data to req.auth
router.use((req, res, next) => {
  req.auth = getAuth(req);
  next();
});

// Public Routes
router.get("/search", petController.searchPets);
router.get("/recommended/:petId", petController.getRecommendedPets);
router.get("/", petController.getAllPets);
router.get("/:petId", petController.getPetById);

// @Admin Routes - NO AUTH REQUIRED FOR ADMIN PANEL
// Get pet statistics for admin dashboard
router.get("/admin/stats", petController.getPetStats);
// Get all pets for admin with pagination and filtering
router.get("/admin/all", petController.getAllPetsForAdmin);
// Update pet status (admin)
router.patch("/admin/:petId/status", petController.updatePetStatusAdmin);
// Delete pet (admin only)
router.delete("/admin/:petId", petController.deletePetAdmin);

// @Admin Routes - NO AUTH REQUIRED FOR ADMIN PANEL
// Get pet statistics for admin dashboard
router.get("/admin/stats", petController.getPetStats);
// Get all pets for admin with pagination and filtering
router.get("/admin/all", petController.getAllPetsForAdmin);
// Update pet status (admin)
router.patch("/admin/:petId/status", petController.updatePetStatusAdmin);
// Delete pet (admin only)
router.delete("/admin/:petId", petController.deletePetAdmin);

// Normal User Routes
router.post(
  "/upload-images",
  auth,
  upload.array("images", 100),
  uploadToCloudinary,
  petController.uploadImages
);

router.post(
  "/",
  auth,
  upload.array("images", 100),
  uploadToCloudinary,
  petController.addPet
); // Max 100 images

router.get("/my-pets/all", auth, petController.getPetsByUserId);
router.put(
  "/:petId",
  auth,
  upload.array("images", 100),
  uploadToCloudinary,
  petController.updatePet
);
router.delete("/:petId", auth, petController.deletePet);

// Admin Routes
router.put("/status/:petId", auth, petController.updatePetStatus);

module.exports = router;
