const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: String,
  url: String,
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
});

const workerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  skills: [String],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  availability: { type: Boolean, default: true },
  documents: [documentSchema],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
});

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  partnerType: { type: String, enum: ['ISP', 'BSP', 'BS'], required: true },
  
  // Profile
  photo: String,
  businessName: { type: String, trim: true, maxlength: 100 },
  brand: { type: String, trim: true, maxlength: 100 },
  
  // Service Information
  skills: [String],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  
  // Location & Area
  address: {
    houseNo: String,
    locality: String,
    village: String,
    pinCode: String,
    district: String,
    state: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  serviceRadius: { type: Number, default: 10, min: 0, max: 1000 }, // in km
  
  // Verification
  documents: [documentSchema],
  verificationStatus: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  
  // For BSP
  workers: [workerSchema],
  
  // For BS (Supplier)
  catalog: [{ type: String }], // Simplified for now, could reference a Product model
  
  // KYC & Finance
  kycDetails: {
    aadharNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    tradeLicenseNumber: { type: String, trim: true }
  },
  walletBalance: { type: Number, default: 0 },
  
  // Common
  workingHours: {
    start: String, // e.g. "09:00"
    end: String    // e.g. "18:00"
  },
  isOnline: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  
  status: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'PENDING' }
}, { timestamps: true });

partnerSchema.index({ 'address.location': '2dsphere' });

module.exports = mongoose.model('Partner', partnerSchema);
