const mongoose = require('mongoose');

const referralHistorySchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referralCodeUsed: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESSFUL', 'FRAUD_FLAGGED'],
    default: 'PENDING'
  },
  rewardAmount: {
    type: Number,
    default: 0
  },
  isRewardPaid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Prevent duplicate referrals for the same referred user
referralHistorySchema.index({ referredUserId: 1 }, { unique: true });

// Quick lookups for a user's successful referrals
referralHistorySchema.index({ referrerId: 1, status: 1 });

module.exports = mongoose.model('ReferralHistory', referralHistorySchema);
