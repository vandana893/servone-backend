const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'subscriberModel'
  },
  subscriberModel: {
    type: String,
    required: true,
    enum: ['User', 'Partner', 'Admin']
  },
  planName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index to enforce only ONE active subscription per account at the database level
subscriptionSchema.index(
  { subscriberId: 1, subscriberModel: 1 }, 
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
