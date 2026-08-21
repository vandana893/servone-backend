const ReferralHistory = require('./referral.model');
const User = require('../users/user.model');
const ReferralProgram = require('./referralProgram.model');

/**
 * Apply a referral code for a new user
 */
const applyReferralCode = async (newUserId, code) => {
  // 1. Check if user already applied a code
  const existingReferral = await ReferralHistory.findOne({ referredUserId: newUserId });
  if (existingReferral) {
    const error = new Error('A referral code has already been applied for this account');
    error.statusCode = 400;
    throw error;
  }

  // 2. Find the referrer by code
  const referrer = await User.findOne({ referralCode: code });
  if (!referrer) {
    const error = new Error('Invalid referral code');
    error.statusCode = 404;
    throw error;
  }

  if (referrer._id.toString() === newUserId.toString()) {
    const error = new Error('You cannot use your own referral code');
    error.statusCode = 400;
    throw error;
  }

  // 3. Create pending referral history
  const referral = new ReferralHistory({
    referrerId: referrer._id,
    referredUserId: newUserId,
    referralCodeUsed: code,
    status: 'PENDING',
    rewardAmount: 50 // Example fixed reward, can be dynamic based on a Program model later
  });

  await referral.save();
  
  // 4. Update the new user's referredBy field
  await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });

  return referral;
};

/**
 * Get referral history for a specific user (the referrer)
 */
const getUserReferralHistory = async (userId) => {
  const history = await ReferralHistory.find({ referrerId: userId })
    .populate('referredUserId', 'name photo') // Get basic info of the person they referred
    .sort({ createdAt: -1 });
    
  return history;
};

/**
 * Get all referrals (Admin only) for fraud review and monitoring
 */
const getAdminReferralHistory = async (filters = {}) => {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  const history = await ReferralHistory.find(query)
    .populate('referrerId', 'name phone')
    .populate('referredUserId', 'name phone')
    .sort({ createdAt: -1 });
    
  return history;
};

/**
 * Update referral status (Admin only - e.g. mark as fraud or successful)
 */
const updateReferralStatus = async (referralId, status, notes) => {
  const referral = await ReferralHistory.findById(referralId);
  if (!referral) {
    const error = new Error('Referral record not found');
    error.statusCode = 404;
    throw error;
  }

  referral.status = status;
  if (notes) referral.notes = notes;
  
  await referral.save();
  return referral;
};

/**
 * Create a new Referral Program (Admin only)
 */
const createProgram = async (programData) => {
  const program = new ReferralProgram(programData);
  await program.save();
  return program;
};

/**
 * Get all Referral Programs
 */
const getPrograms = async () => {
  return await ReferralProgram.find().sort({ createdAt: -1 });
};

/**
 * Delete a Referral Program (Admin only)
 */
const deleteProgram = async (id) => {
  return await ReferralProgram.findByIdAndDelete(id);
};

module.exports = {
  applyReferralCode,
  getUserReferralHistory,
  getAdminReferralHistory,
  updateReferralStatus,
  createProgram,
  getPrograms,
  deleteProgram
};
