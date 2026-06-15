const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema Definition
const userSchema = new mongoose.Schema(
  {
    // Custom authentication fields
    email: {
      type: String,
      required: function () {
        return !this.phoneNumber;
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    phoneNumber: {
      type: String,
      required: function () {
        return !this.email;
      },
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: 6,
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    phoneVerificationOTP: { type: String },
    otpExpiry: { type: Date },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    profilePicture: { type: String, default: "" },
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    socialMedia: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    phoneNumbers: { type: [String], default: [] },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [21.01178, 52.22977] }, // [lng, lat]
    },
    image: { type: String, default: "" },
    description: { type: String, trim: true, default: "" },
    companyName: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    sellerType: { type: String, enum: ["private", "company"], default: "private" },
    blocked: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true, default: "" },
    // Terms & Conditions
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date },
    termsVersion: { type: String, default: "v1" },
    // Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    passwordChangedAt: { type: Date },
    savedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
    passedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.authProvider !== "local")
    return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneVerificationOTP = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function (otp) {
  if (!this.phoneVerificationOTP || !this.otpExpiry) {
    return false;
  }
  if (new Date() > this.otpExpiry) {
    return false;
  }
  return this.phoneVerificationOTP === otp;
};

// Message Schema
const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  attachments: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  seenBy: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Chat Schema
const chatSchema = new mongoose.Schema({
  participants: [
    {
      type: String,
      required: true,
    },
  ],
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
    required: true,
  },
  lastMessage: {
    content: String,
    sender: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pet Schema
const petSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true, trim: true },           // e.g. "Max"
  title: { type: String, required: true, trim: true },          // e.g. "Friendly Golden Retriever looking for a home"
  description: { type: String, required: true, trim: true },

  // Pet Identity
  species: { type: String, required: true, trim: true },        // Dog, Cat, Bird, Rabbit...
  breed: { type: String, trim: true },                          // Labrador Retriever, Mixed, etc.
  ageMonths: { type: Number },                                  // Age in months (0-240)
  gender: { type: String, enum: ["Male", "Female", "Unknown"] },
  size: { type: String, enum: ["Small", "Medium", "Large", "Extra Large"] },
  color: { type: String, trim: true },                          // Black, White, Brown, Golden...
  coatLength: { type: String, enum: ["Hairless", "Short", "Medium", "Long"] },

  // Health & Status
  healthStatus: { type: [String], default: [] },                // ["Vaccinated", "Neutered", "Microchipped"]
  specialNeeds: { type: String, trim: true, default: "" },

  // Adoption Info
  adoptionFee: { type: Number, default: 0 },                    // 0 = free adoption
  currency: { type: String, default: "PLN" },
  adoptionStatus: {
    type: String,
    enum: ["Available", "Pending", "Adopted"],
    default: "Available"
  },

  // Personality & Behavior
  personality: { type: [String], default: [] },                 // ["Playful", "Calm", "Good with kids", "Good with dogs"]

  // Images
  images: { type: [String], default: [] },
  categorizedImages: {
    type: [{
      url: { type: String, required: true },
      category: {
        type: String,
        enum: ["main", "side", "face", "playing", "with_owner", "other", "unknown"],
        default: "unknown"
      },
      detected_label: String,
      confidence: Number,
      index: Number,
    }],
    default: []
  },

  // AI-Generated Listing Sections
  aiSections: {
    type: [{ heading: String, content: String, source_tags: [String] }],
    default: []
  },

  // Location
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true }
  },

  // Approval/Status
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  isFeatured: { type: Boolean, default: false },
  createdBy: { type: String, required: true },  // User ID of shelter/owner
}, { timestamps: true });

// Keep the same indexes
petSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
petSchema.index({ "location.coordinates": "2dsphere" });

// Adoption Request Schema
const adoptionRequestSchema = new mongoose.Schema({
  adopterId: { type: String, required: true, ref: "User" },
  title: { type: String, required: true, trim: true },         // "Looking to adopt a friendly dog"
  description: { type: String, required: true, trim: true },
  preferredSpecies: { type: String, trim: true },              // Dog, Cat...
  preferredBreed: { type: String, trim: true },
  preferredSize: { type: String, trim: true },
  preferredAgeGroup: { type: String, trim: true },             // Baby, Young, Adult, Senior
  preferredGender: { type: String, enum: ["Male", "Female", "Any"], default: "Any" },
  maxAdoptionFee: { type: Number },                            // was: budgetMax
  preferredFeatures: { type: [String], default: [] },          // ["Good with kids", "Calm"]
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], default: [21.01178, 52.22977] }
  },
  status: {
    type: String,
    enum: ["Active", "Fulfilled", "Expired", "Cancelled"],
    default: "Active"
  },
  expiryDate: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) }
}, { timestamps: true });

// Create models only if they haven't been compiled yet
const User = mongoose.models.User || mongoose.model("User", userSchema);
// For development: force re-compilation of models to pick up schema changes
if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
  delete mongoose.models.Message;
  delete mongoose.models.Chat;
  delete mongoose.models.Pet;
  delete mongoose.models.AdoptionRequest;
}

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
const Pet = mongoose.models.Pet || mongoose.model("Pet", petSchema);
const AdoptionRequest =
  mongoose.models.AdoptionRequest ||
  mongoose.model("AdoptionRequest", adoptionRequestSchema);

module.exports = {
  User,
  Message,
  Chat,
  Pet,
  AdoptionRequest,
};
