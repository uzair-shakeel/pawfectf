const express = require('express');
const router = express.Router();
const {
  getAllDonations,
  getDonation,
  createDonation,
  updateDonationStatus,
  getMyDonations,
  getReceivedDonations,
  getDonationStats,
  cancelDonation
} = require('../controllers/foodDonation');
const { auth, protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getAllDonations);
router.get('/stats', getDonationStats);
router.get('/:id', getDonation);

// Protected routes (require login)
router.post('/', auth, createDonation);
router.get('/user/my-donations', auth, getMyDonations);
router.get('/user/received', auth, getReceivedDonations);
router.delete('/:id', auth, cancelDonation);

// Admin/Shelter routes
router.put('/:id/status', auth, updateDonationStatus);

module.exports = router;