const mongoose = require('mongoose');

const trackingHistorySchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  workerId: { type: mongoose.Schema.Types.ObjectId },
  
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  
  heading: { type: Number },
  speed: { type: Number },
  accuracy: { type: Number },
  
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

trackingHistorySchema.index({ bookingId: 1, recordedAt: -1 });
trackingHistorySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('TrackingHistory', trackingHistorySchema);
