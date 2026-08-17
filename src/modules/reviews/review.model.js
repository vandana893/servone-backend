const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  
  // A review can be for a Service or a Partner
  targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel', required: true },
  targetModel: { type: String, enum: ['Service', 'Partner'], required: true },
  
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, trim: true, maxlength: 2000 },
  photos: [String],
  
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure a user can only review a specific target for a specific booking once
reviewSchema.index({ userId: 1, bookingId: 1, targetId: 1 }, { unique: true });

// Optimize query performance for GET /reviews
reviewSchema.index({ targetId: 1, targetModel: 1, isApproved: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
