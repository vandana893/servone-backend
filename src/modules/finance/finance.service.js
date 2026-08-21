const Transaction = require('./finance.model');
const Booking = require('../bookings/booking.model');
const User = require('../users/user.model');
const Partner = require('../partners/partner.model');

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const validateContext = async (bookingId, userId, partnerId) => {
  if (userId) {
    const user = await User.findById(userId);
    if (!user) throwError('User not found', 404);
  }
  
  if (partnerId) {
    const partner = await Partner.findById(partnerId);
    if (!partner) throwError('Partner not found', 404);
  }

  if (bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throwError('Booking not found', 404);
    
    if (userId && booking.userId.toString() !== userId.toString()) {
      throwError('Transaction user does not match the booking owner');
    }
    if (partnerId && booking.partnerId && booking.partnerId.toString() !== partnerId.toString()) {
      throwError('Transaction partner does not match the assigned booking partner');
    }
  }
};

const validateRefund = async (amount, originalTransactionId, userId, partnerId, bookingId) => {
  if (!originalTransactionId) throwError('Original transaction ID is required for REFUND');
  const originalTxn = await Transaction.findById(originalTransactionId);
  if (!originalTxn) throwError('Original transaction not found', 404);
  if (originalTxn.type !== 'PAYMENT') throwError('Refunds can only be issued against PAYMENT transactions');
  if (originalTxn.status !== 'SUCCESS') throwError('Cannot refund an unsuccessful payment');

  // Verify contexts match
  if (userId && originalTxn.userId && originalTxn.userId.toString() !== userId.toString()) {
    throwError('Refund user does not match original payment user');
  }
  if (partnerId && originalTxn.partnerId && originalTxn.partnerId.toString() !== partnerId.toString()) {
    throwError('Refund partner does not match original payment partner');
  }
  if (bookingId && originalTxn.bookingId && originalTxn.bookingId.toString() !== bookingId.toString()) {
    throwError('Refund booking does not match original payment booking');
  }

  // Sum all successful or pending refunds against this original payment
  const existingRefunds = await Transaction.aggregate([
    { $match: { originalTransactionId: originalTxn._id, status: { $in: ['SUCCESS', 'PENDING'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const totalRefunded = existingRefunds.length > 0 ? existingRefunds[0].total : 0;
  if (totalRefunded + amount > originalTxn.amount) {
    throwError('Refund amount exceeds the original payment amount');
  }
};

const createTransaction = async (data) => {
  if (data.type === 'REFUND') {
    await validateRefund(data.amount, data.originalTransactionId, data.userId, data.partnerId, data.bookingId);
  }
  
  await validateContext(data.bookingId, data.userId, data.partnerId);

  const transaction = new Transaction(data);
  try {
    await transaction.save();
    return transaction;
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.transactionId) {
        throwError('Transaction ID collision, please try again', 500); 
      }
      if (error.keyPattern && error.keyPattern.referenceId) {
        throwError('Transaction with this reference ID already exists (Duplicate processing)', 409);
      }
    }
    throw error;
  }
};

const getTransactions = async (query) => {
  const { 
    userId, partnerId, bookingId, type, status, paymentMethod, referenceId, transactionId,
    from, to, search, page = 1, limit = 20 
  } = query;
  
  const filter = {};
  if (userId) filter.userId = userId;
  if (partnerId) filter.partnerId = partnerId;
  if (bookingId) filter.bookingId = bookingId;
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (referenceId) filter.referenceId = referenceId;
  if (transactionId) filter.transactionId = transactionId;
  
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  if (search) {
    filter.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { referenceId: { $regex: search, $options: 'i' } },
      { note: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Transaction.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Transaction.countDocuments(filter)
  ]);
  
  return { data, total, page, limit };
};

const getTransactionById = async (id, authScope) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) throwError('Transaction not found', 404);
  
  if (authScope.accountType === 'USER' && transaction.userId?.toString() !== authScope.accountId.toString()) {
    throwError('Unauthorized access to transaction', 403);
  }
  if (authScope.accountType === 'PARTNER' && transaction.partnerId?.toString() !== authScope.accountId.toString()) {
    throwError('Unauthorized access to transaction', 403);
  }
  
  return transaction;
};

const updateTransactionStatus = async (id, status, referenceId = null, updatedBy = null) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) throwError('Transaction not found', 404);
  
  const invalidTransition = (
    (transaction.status === 'SUCCESS') || 
    (transaction.status === 'FAILED' && status === 'SUCCESS') ||
    (transaction.status === 'FAILED' && status === 'PENDING')
  );

  if (invalidTransition) {
    throwError(`Invalid status transition from ${transaction.status} to ${status}`);
  }

  const update = { status };
  if (referenceId) update.referenceId = referenceId;
  if (updatedBy) update.updatedBy = updatedBy;
  
  try {
    return await Transaction.findByIdAndUpdate(
      id,
      { $set: update },
      { returnDocument: 'after', runValidators: true }
    );
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.referenceId) {
      throwError('Transaction with this reference ID already exists (Duplicate processing)', 409);
    }
    throw error;
  }
};

const processPayout = async (transactionId, referenceId, adminId) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throwError('Transaction not found', 404);
  if (transaction.type !== 'PAYOUT') throwError('Transaction is not a PAYOUT', 400);
  if (transaction.status === 'SUCCESS') throwError('Payout is already processed', 400);

  const partner = await Partner.findById(transaction.partnerId);
  if (!partner) throwError('Partner not found', 404);

  // If deducting on success (some systems deduct on request, we deduct on success here)
  if (partner.walletBalance < transaction.amount) {
    throwError('Insufficient wallet balance to process this payout', 400);
  }

  partner.walletBalance -= transaction.amount;
  await partner.save();

  return await updateTransactionStatus(transactionId, 'SUCCESS', referenceId, adminId);
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  processPayout
};
