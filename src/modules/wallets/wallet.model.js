const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'accountModel'
  },
  accountModel: {
    type: String,
    required: true,
    enum: ['User', 'Partner']
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['CREDIT', 'DEBIT']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: 0 // Prevents negative balance in logic ideally, though sometimes allow negative for partners
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId, // Could be Booking ID, Offer ID, etc.
  }
}, { timestamps: true });

walletTransactionSchema.index({ accountId: 1, createdAt: -1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
