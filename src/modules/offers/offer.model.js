const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
  value: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, min: 0 },
  minOrderValue: { type: Number, default: 0, min: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number }, // Overall limit
  usedCount: { type: Number, default: 0 }
}, { timestamps: true });

offerSchema.index({ code: 1, isActive: 1 });
offerSchema.index({ validFrom: 1, validUntil: 1 });

module.exports = mongoose.model('Offer', offerSchema);
