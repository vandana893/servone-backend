const Subscription = require('./subscription.model');
const User = require('../users/user.model');
const Partner = require('../partners/partner.model');
const Admin = require('../admin/admin.model');

const throwError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  throw err;
};

// Maps Auth Account Type to internal Subscriber Model
const resolveModel = (accountType) => {
  const map = { USER: 'User', PARTNER: 'Partner', ADMIN: 'Admin' };
  const model = map[accountType];
  if (!model) throwError('Unsupported account type for subscription', 403);
  return model;
};

// Dynamically validates the target account exists
const verifyAccountExists = async (accountId, modelName) => {
  let exists = false;
  if (modelName === 'User') exists = await User.exists({ _id: accountId });
  else if (modelName === 'Partner') exists = await Partner.exists({ _id: accountId });
  else if (modelName === 'Admin') exists = await Admin.exists({ _id: accountId });
  
  if (!exists) throwError('Account not found', 404);
};

/**
 * Create a new subscription for an account
 */
const createSubscription = async (accountId, accountType, payload) => {
  const subscriberModel = resolveModel(accountType);
  await verifyAccountExists(accountId, subscriberModel);

  const startDate = payload.startDate ? new Date(payload.startDate) : new Date();
  const endDate = new Date(payload.endDate);

  if (endDate <= startDate) {
    throwError('endDate must be strictly greater than startDate', 400);
  }

  // Check if an active subscription already exists
  const existingSubscription = await Subscription.findOne({
    subscriberId: accountId,
    subscriberModel,
    status: 'ACTIVE'
  });

  if (existingSubscription) {
    throwError('Account already has an active subscription', 409);
  }

  const subscription = new Subscription({
    subscriberId: accountId,
    subscriberModel,
    planName: payload.planName,
    startDate,
    endDate,
    autoRenew: payload.autoRenew || false,
    status: 'ACTIVE'
  });

  try {
    await subscription.save();
  } catch (err) {
    if (err.code === 11000) {
      throwError('Account already has an active subscription', 409);
    }
    throw err;
  }
  
  return subscription;
};

/**
 * Get current active subscription for an account
 */
const getMySubscription = async (accountId, accountType) => {
  const subscriberModel = resolveModel(accountType);
  
  const subscription = await Subscription.findOne({
    subscriberId: accountId,
    subscriberModel,
    status: 'ACTIVE',
    endDate: { $gt: new Date() } // MUST not be expired
  });

  return subscription; // returns null if no active subscription
};

/**
 * Get subscription by ID with strict ownership check
 */
const getSubscriptionById = async (subscriptionId, accountId, accountType) => {
  const subscriberModel = resolveModel(accountType);

  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    subscriberId: accountId,
    subscriberModel
  });

  if (!subscription) {
    throwError('Subscription not found', 404);
  }

  return subscription;
};

/**
 * Cancel a subscription with strict ownership check
 */
const cancelSubscription = async (subscriptionId, accountId, accountType) => {
  const subscriberModel = resolveModel(accountType);

  // findOneAndUpdate with status filtering prevents race conditions
  const subscription = await Subscription.findOneAndUpdate(
    {
      _id: subscriptionId,
      subscriberId: accountId,
      subscriberModel,
      status: { $ne: 'CANCELLED' } // Don't cancel already cancelled
    },
    { status: 'CANCELLED' },
    { new: true } // Return updated doc
  );

  if (!subscription) {
    // Determine if it was not found, or just already cancelled
    const exists = await Subscription.exists({ _id: subscriptionId, subscriberId: accountId, subscriberModel });
    if (exists) {
      throwError('Subscription is already cancelled', 400);
    }
    throwError('Subscription not found', 404);
  }
  
  return subscription;
};

// --- Admin Endpoints ---

const getAllSubscriptions = async (query = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Subscription.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Subscription.countDocuments(query)
  ]);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

const getSubscriptionForAdmin = async (subscriptionId) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) throwError('Subscription not found', 404);
  return subscription;
};

module.exports = {
  createSubscription,
  getMySubscription,
  getSubscriptionById,
  cancelSubscription,
  getAllSubscriptions,
  getSubscriptionForAdmin
};
