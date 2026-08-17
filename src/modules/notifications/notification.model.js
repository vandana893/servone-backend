const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel', required: true },
  userModel: { type: String, enum: ['User', 'Partner', 'Admin'], required: true },
  
  type: { type: String, required: true, trim: true, maxlength: 50 }, // e.g. 'BOOKING_CREATED', 'PAYOUT_PROCESSED'
  title: { type: String, required: true, trim: true, maxlength: 100 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  
  entityType: { type: String, trim: true, maxlength: 50 }, // e.g. 'Booking', 'Transaction'
  entityId: { type: mongoose.Schema.Types.ObjectId },
  
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ userId: 1, userModel: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, userModel: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
