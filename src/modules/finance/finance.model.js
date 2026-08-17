const mongoose = require('mongoose');
const crypto = require('crypto');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  
  // Who is involved
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  
  // Financial amounts
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  
  type: { type: String, enum: ['PAYMENT', 'REFUND', 'PAYOUT', 'COMMISSION'], required: true },
  
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  
  paymentMethod: { type: String, enum: ['CASH', 'UPI', 'CARD', 'WALLET', 'BANK_TRANSFER'] },
  referenceId: String, // from payment gateway
  originalTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  
  note: String,
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

transactionSchema.index({ type: 1, referenceId: 1 }, { unique: true, partialFilterExpression: { referenceId: { $exists: true, $type: "string" } } });
transactionSchema.index({ userId: 1 });
transactionSchema.index({ partnerId: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

transactionSchema.pre('save', function() {
  if (!this.transactionId) {
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.transactionId = `TXN-${randomHex}`;
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
