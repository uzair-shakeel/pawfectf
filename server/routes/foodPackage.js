const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  getPackagesForPet,
  incrementDonations
} = require('../controllers/foodPackage');
const { auth, protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getAllPackages);
router.get('/for-pet', getPackagesForPet);
router.get('/:id', getPackage);

// Admin routes
router.post('/', auth, admin, createPackage);
router.put('/:id', auth, admin, updatePackage);
router.delete('/:id', auth, admin, deletePackage);
router.put('/:id/increment', auth, incrementDonations);

module.exports = router;