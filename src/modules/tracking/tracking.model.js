const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  workerId: { type: mongoose.Schema.Types.ObjectId }, // If assigned to a BSP worker
  
  trackingStatus: {
    type: String,
    enum: ['NOT_STARTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'STOPPED'],
    default: 'NOT_STARTED'
  },
  
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  
  heading: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  
  lastLocationUpdate: { type: Date, default: Date.now },
  eta: { type: Date },
  distanceRemaining: { type: Number },
  isLive: { type: Boolean, default: false }
}, { timestamps: true });

// 2dsphere index on currentLocation for geospatial queries
trackingSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Tracking', trackingSchema);
