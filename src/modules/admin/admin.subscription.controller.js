const subscriptionService = require('../subscriptions/subscription.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getAllSubscriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, subscriberModel } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    const query = {};
    if (status) query.status = status;
    if (subscriberModel) query.subscriberModel = subscriberModel;

    const result = await subscriptionService.getAllSubscriptions(query, pageNum, limitNum);
    sendSuccess(res, result, 'Subscriptions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getSubscriptionForAdmin(req.params.id);
    sendSuccess(res, subscription, 'Subscription retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById
};
