const subscriptionService = require('./subscription.service');
const { sendSuccess } = require('../../utils/response');

/**
 * @desc    Create a new subscription
 * @route   POST /api/subscriptions
 * @access  Private
 */
const createSubscription = async (req, res, next) => {
  try {
    const { accountId, accountType } = req.auth;
    const subscription = await subscriptionService.createSubscription(accountId, accountType, req.body);
    
    return sendSuccess(res, subscription, 'Subscription created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's active subscription
 * @route   GET /api/subscriptions/me
 * @access  Private
 */
const getMySubscription = async (req, res, next) => {
  try {
    const { accountId, accountType } = req.auth;
    const subscription = await subscriptionService.getMySubscription(accountId, accountType);
    
    if (!subscription) {
      return sendSuccess(res, null, 'No active subscription found');
    }
    
    return sendSuccess(res, subscription, 'Current subscription retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private
 */
const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountId, accountType } = req.auth;
    
    const subscription = await subscriptionService.getSubscriptionById(id, accountId, accountType);
    
    return sendSuccess(res, subscription, 'Subscription retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a subscription
 * @route   PUT /api/subscriptions/:id/cancel
 * @access  Private
 */
const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountId, accountType } = req.auth;
    
    const subscription = await subscriptionService.cancelSubscription(id, accountId, accountType);
    
    return sendSuccess(res, subscription, 'Subscription cancelled successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubscription,
  getMySubscription,
  getSubscriptionById,
  cancelSubscription
};
