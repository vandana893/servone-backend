const mongoose = require('mongoose');

const materialItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  specification: String,
  priceQuote: Number // Populated by supplier
}, { _id: false });

const materialRequestSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner' // The BS who accepts/quotes
  },
  items: [materialItemSchema],
  status: {
    type: String,
    enum: ['PENDING', 'QUOTED', 'ACCEPTED', 'FULFILLED', 'REJECTED'],
    default: 'PENDING'
  },
  urgency: {
    type: String,
    enum: ['NORMAL', 'URGENT'],
    default: 'NORMAL'
  },
  notes: String,
  rejectionReason: String
}, { timestamps: true });

materialRequestSchema.index({ bookingId: 1 });
materialRequestSchema.index({ requestedBy: 1 });
materialRequestSchema.index({ supplierId: 1, status: 1 });

module.exports = mongoose.model('MaterialRequest', materialRequestSchema);
