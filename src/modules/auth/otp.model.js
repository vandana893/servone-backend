const mongoose = require('mongoose');
const env = require('../../config/env');

const otpSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true,
    index: true
  },
  otpHash: { 
    type: String, 
    required: true 
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

// Auto-delete expired OTP documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt.getTime();
};

module.exports = mongoose.model('OTP', otpSchema);
