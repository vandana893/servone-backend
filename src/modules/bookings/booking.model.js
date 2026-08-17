const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'updatedByModel' },
  updatedByModel: { type: String, enum: ['User', 'Partner', 'Admin'] }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true }, // e.g. BKG-123456
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Service Info
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  serviceVariant: String,
  
  // Assignment
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' }, // Assigned ISP/BSP
  workerId: { type: mongoose.Schema.Types.ObjectId }, // If BSP assigns a worker
  
  // Booking Details
  problemDescription: { type: String, required: true },
  media: [String], // URLs to photos/videos
  
  // Location
  address: {
    houseNo: String,
    locality: String,
    village: String,
    landmark: String,
    pinCode: String,
    district: String,
    state: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  
  // Schedule
  isInstant: { type: Boolean, default: false },
  scheduledDate: { type: Date },
  scheduledTimeSlot: String,
  
  // Status
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED', 'RESCHEDULE_REQUESTED', 'QUOTE_REQUIRED'],
    default: 'PENDING'
  },
  timeline: [timelineSchema],
  
  // Pricing & Payment
  pricingModel: { type: String, required: true },
  quotedPrice: { type: Number },
  finalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['PENDING', 'PARTIAL', 'COMPLETED', 'REFUNDED'], default: 'PENDING' },
  paymentMethod: { type: String, enum: ['CASH', 'UPI', 'CARD', 'WALLET'] },
  
  // Material / Parts Request Link (BS)
  materialRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialRequest' },
  
  cancellationReason: String,
  
  // Rural Specific
  isGroupBooking: { type: Boolean, default: false },
  bookingLanguage: String
}, { timestamps: true });

// Pre-save hook to generate human-readable Booking ID
bookingSchema.pre('save', function() {
  if (!this.bookingId) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.bookingId = `BKG-${randomNum}`;
  }
  
  // Auto-add initial timeline entry
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: this.status,
      note: 'Booking created',
      updatedBy: this.userId,
      updatedByModel: 'User'
    });
  }
});

bookingSchema.index({ 'address.location': '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);
