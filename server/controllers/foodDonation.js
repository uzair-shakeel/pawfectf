const FoodDonation = require('../models/FoodDonation');
const FoodPackage = require('../models/FoodPackage');
const { Pet, User } = require('../models');

// Get all food donations (with filters)
exports.getAllDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      petType,
      urgentOnly,
      donorId,
      petId
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (urgentOnly === 'true') filter.isUrgent = true;
    if (donorId) filter.donorId = donorId;
    if (petId) filter.petId = petId;

    const donations = await FoodDonation.find(filter)
      .populate('petId', 'name species breed images location')
      .populate('donorId', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoodDonation.countDocuments(filter);

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single donation
exports.getDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id)
      .populate('petId')
      .populate('donorId', 'firstName lastName profilePicture email phone')
      .populate('updates.createdBy', 'firstName lastName');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Increment views
    donation.views += 1;
    await donation.save();

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new food donation
exports.createDonation = async (req, res) => {
  try {
    const {
      petId,
      donationType,
      foodPackage,
      donorMessage,
      delivery,
      isRecurring,
      recurringInterval
    } = req.body;

    // Verify pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Calculate payment amount based on package and duration
    let packageDetails;
    if (foodPackage.type !== 'custom') {
      packageDetails = await FoodPackage.findOne({ type: foodPackage.type, isActive: true });
      if (!packageDetails) {
        return res.status(404).json({ message: 'Food package not found' });
      }
      foodPackage.amount = packageDetails.getPriceForDuration(foodPackage.duration);
    }

    const donation = new FoodDonation({
      petId,
      donorId: req.user.id,
      donationType,
      foodPackage,
      payment: {
        amount: foodPackage.amount,
        currency: 'PLN'
      },
      delivery,
      donorMessage,
      isRecurring,
      recurringInterval,
      status: 'pending'
    });

    await donation.save();
    
    // Populate for response
    await donation.populate([
      { path: 'petId', select: 'name species breed images' },
      { path: 'donorId', select: 'firstName lastName profilePicture' }
    ]);

    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update donation status (shelter/admin only)
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status, shelterResponse, updateMessage } = req.body;
    
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check permissions
    const pet = await Pet.findById(donation.petId);
    const isOwner = pet.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status
    donation.status = status;
    if (shelterResponse) donation.shelterResponse = shelterResponse;
    
    // Add update message
    if (updateMessage) {
      donation.updates.push({
        message: updateMessage,
        createdBy: req.user.id
      });
    }

    // Set delivery date if delivered
    if (status === 'delivered') {
      donation.delivery.deliveredAt = new Date();
    }

    await donation.save();
    
    res.json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get donations for current user
exports.getMyDonations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = { donorId: req.user.id };
    if (status) filter.status = status;

    const donations = await FoodDonation.find(filter)
      .populate('petId', 'name species breed images location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoodDonation.countDocuments(filter);

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get donations for pets owned by current user
exports.getReceivedDonations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    // Find pets owned by current user
    const userPets = await Pet.find({ createdBy: req.user.id }, '_id');
    const petIds = userPets.map(pet => pet._id);

    const filter = { petId: { $in: petIds } };
    if (status) filter.status = status;

    const donations = await FoodDonation.find(filter)
      .populate('petId', 'name species breed images')
      .populate('donorId', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoodDonation.countDocuments(filter);

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get donation statistics
exports.getDonationStats = async (req, res) => {
  try {
    const stats = await FoodDonation.aggregate([
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$payment.amount' },
          activeDonations: {
            $sum: {
              $cond: [
                { $in: ['$status', ['confirmed', 'preparing', 'delivered']] },
                1,
                0
              ]
            }
          },
          urgentDonations: {
            $sum: {
              $cond: ['$isUrgent', 1, 0]
            }
          }
        }
      }
    ]);

    const statusStats = await FoodDonation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        totalDonations: 0,
        totalAmount: 0,
        activeDonations: 0,
        urgentDonations: 0
      },
      byStatus: statusStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel donation (donor only, if not yet confirmed)
exports.cancelDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['confirmed', 'preparing', 'delivered', 'completed'].includes(donation.status)) {
      return res.status(400).json({ message: 'Cannot cancel donation at this stage' });
    }

    donation.status = 'cancelled';
    await donation.save();

    res.json({ message: 'Donation cancelled successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};