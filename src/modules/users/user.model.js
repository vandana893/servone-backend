const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  houseNo: String,
  locality: String,
  village: String,
  landmark: String,
  pinCode: String,
  district: String,
  state: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  profileCompleted: { type: Boolean, default: false },
  photo: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  language: { type: String, default: 'English' }, // Hindi/English
  addresses: [addressSchema],
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletBalance: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'], default: 'ACTIVE' },
}, { timestamps: true });

// Index for geo-spatial queries
userSchema.index({ 'addresses.location': '2dsphere' });

module.exports = mongoose.model('User', userSchema);
