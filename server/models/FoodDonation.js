const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema({
  // Pet Information
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  
  // Donor Information
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Donation Details
  donationType: {
    type: String,
    enum: ['sponsorship', 'direct_purchase'],
    required: true
  },
  
  foodPackage: {
    type: {
      type: String,
      enum: ['basic', 'premium', 'deluxe', 'custom'],
      default: 'basic'
    },
    duration: {
      type: String,
      enum: ['1_day', '3_days', '1_week', '2_weeks', '1_month', '3_months', '6_months'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: String
  },
  
  // Payment Information
  payment: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'PLN'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: String,
    transactionId: String,
    paidAt: Date
  },
  
  // Delivery Information
  delivery: {
    type: {
      type: String,
      enum: ['pickup', 'delivery', 'shelter_direct'],
      default: 'shelter_direct'
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: { type: String, default: 'Poland' }
    },
    scheduledDate: Date,
    deliveredAt: Date,
    trackingNumber: String
  },
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Messages and Updates
  donorMessage: String,
  shelterResponse: String,
  updates: [{
    message: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Metadata
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly'],
  },
  nextDonationDate: Date,
  
  // Featured/Special
  isFeatured: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for performance
foodDonationSchema.index({ petId: 1, status: 1 });
foodDonationSchema.index({ donorId: 1, createdAt: -1 });
foodDonationSchema.index({ status: 1, createdAt: -1 });
foodDonationSchema.index({ 'payment.status': 1 });
foodDonationSchema.index({ isUrgent: 1, isFeatured: 1 });

// Virtual for total donation amount
foodDonationSchema.virtual('formattedAmount').get(function() {
  return `${this.payment.amount} ${this.payment.currency}`;
});

// Method to check if donation is active
foodDonationSchema.methods.isActive = function() {
  return ['confirmed', 'preparing', 'delivered'].includes(this.status);
};

// Static method to get donation statistics
foodDonationSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$payment.amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('FoodDonation', foodDonationSchema);