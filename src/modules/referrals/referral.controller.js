const referralService = require('./referral.service');
const { sendSuccess } = require('../../utils/response');

/**
 * @desc    Apply a referral code
 * @route   POST /api/referrals/apply
 * @access  Private (User)
 */
const applyReferralCode = async (req, res, next) => {
  try {
    const { accountId } = req.auth; // The new user applying the code
    const { code } = req.body;
    
    const referral = await referralService.applyReferralCode(accountId, code);
    
    return sendSuccess(res, referral, 'Referral code applied successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my referral history
 * @route   GET /api/referrals/me/history
 * @access  Private
 */
const getMyReferralHistory = async (req, res, next) => {
  try {
    const { accountId } = req.auth;
    const history = await referralService.getUserReferralHistory(accountId);
    
    return sendSuccess(res, history, 'Referral history retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all referrals (Admin)
 * @route   GET /api/referrals/admin/history
 * @access  Private (Admin)
 */
const getAdminReferralHistory = async (req, res, next) => {
  try {
    const filters = req.query;
    const history = await referralService.getAdminReferralHistory(filters);
    
    return sendSuccess(res, history, 'All referrals retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update referral status (Admin)
 * @route   PUT /api/referrals/admin/:id/status
 * @access  Private (Admin)
 */
const updateReferralStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const referral = await referralService.updateReferralStatus(id, status, notes);
    
    return sendSuccess(res, referral, `Referral status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyReferralCode,
  getMyReferralHistory,
  getAdminReferralHistory,
  updateReferralStatus
};
