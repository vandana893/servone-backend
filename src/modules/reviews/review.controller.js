const reviewService = require('./review.service');
const { sendSuccess } = require('../../utils/response');

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.auth.accountId, req.body);
    sendSuccess(res, review, 'Review created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getReviews(req.query);
    sendSuccess(res, result, 'Reviews fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getReviews
};
