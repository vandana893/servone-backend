const mongoose = require('mongoose');

const referralProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  reward: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  targetAudience: {
    type: String,
    default: 'All Users'
  },
  status: {
    type: String,
    enum: ['Active', 'Completed'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('ReferralProgram', referralProgramSchema);
