const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middlewares/auth");
const {
  getAllLostFound,
  getLostFoundById,
  createLostFound,
  updateLostFound,
  deleteLostFound,
  getUserLostFound,
  getAdminLostFound,
  deleteAdminLostFound,
  setAdminLostFoundStatus
} = require("../controllers/lostFound");
const { upload, uploadToCloudinary } = require("../middlewares/uploadMiddleware");

// ─── SPECIFIC routes MUST come before wildcard /:id ────────────────────────

// Protected user routes (specific paths first)
router.get("/user/all", auth, getUserLostFound);

// Admin routes (specific paths first)
router.get("/admin/all", auth, isAdmin, getAdminLostFound);
router.delete("/admin/:id", auth, isAdmin, deleteAdminLostFound);
router.patch("/admin/:id/status", auth, isAdmin, setAdminLostFoundStatus);

// Public routes
router.get("/", getAllLostFound);
router.get("/:id", getLostFoundById);  // Wildcard — MUST be last GET

// Protected user create / update / delete
router.post(
  "/",
  auth,
  upload.array("images", 10),
  uploadToCloudinary,
  (req, res, next) => {
    if (req.files) {
      req.body.images = req.files.map(f => f.cloudinaryUrl || f.path);
    }
    next();
  },
  createLostFound
);
router.put(
  "/:id",
  auth,
  upload.array("images", 10),
  uploadToCloudinary,
  (req, res, next) => {
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(f => f.cloudinaryUrl || f.path);
    }
    next();
  },
  updateLostFound
);
router.delete("/:id", auth, deleteLostFound);

module.exports = router;
