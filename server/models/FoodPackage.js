const mongoose = require('mongoose');

const foodPackageSchema = new mongoose.Schema({
  // Package Details
  name: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['basic', 'premium', 'deluxe', 'custom'],
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Pricing for different durations
  pricing: {
    '1_day': { type: Number, required: true },
    '3_days': { type: Number, required: true },
    '1_week': { type: Number, required: true },
    '2_weeks': { type: Number, required: true },
    '1_month': { type: Number, required: true },
    '3_months': { type: Number, required: true },
    '6_months': { type: Number, required: true }
  },
  
  // Package Contents
  contents: [{
    item: String,
    quantity: String,
    unit: String
  }],
  
  // Suitable for which animals
  suitableFor: [{
    type: String,
    enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea_pig', 'other']
  }],
  
  // Size/Weight categories
  animalSizes: [{
    type: String,
    enum: ['small', 'medium', 'large', 'extra_large']
  }],
  
  // Package features
  features: [String],
  
  // Images
  images: [String],
  
  // Availability
  isActive: {
    type: Boolean,
    default: true
  },
  
  stock: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  
  // Metadata
  popularityScore: {
    type: Number,
    default: 0
  },
  
  totalDonations: {
    type: Number,
    default: 0
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
foodPackageSchema.index({ type: 1, isActive: 1 });
foodPackageSchema.index({ suitableFor: 1 });
foodPackageSchema.index({ popularityScore: -1 });

// Virtual for getting price by duration
foodPackageSchema.methods.getPriceForDuration = function(duration) {
  return this.pricing[duration] || 0;
};

// Method to check if suitable for animal
foodPackageSchema.methods.isSuitableFor = function(animalType, animalSize) {
  const typeMatch = this.suitableFor.includes(animalType.toLowerCase());
  const sizeMatch = this.animalSizes.length === 0 || this.animalSizes.includes(animalSize.toLowerCase());
  return typeMatch && sizeMatch;
};

module.exports = mongoose.model('FoodPackage', foodPackageSchema);