const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: false // If true, can be fetched without auth (e.g. MAINTENANCE_MODE)
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
