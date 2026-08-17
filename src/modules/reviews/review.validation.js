const Joi = require('joi');

const createReviewSchema = {
  body: Joi.object({
    bookingId: Joi.string().hex().length(24).required(),
    targetId: Joi.string().hex().length(24).required(),
    targetModel: Joi.string().valid('Service', 'Partner').required(),
    rating: Joi.number().min(1).max(5).required(),
    reviewText: Joi.string().trim().max(2000),
    photos: Joi.array().items(Joi.string().max(500)).max(10)
  }).unknown(false)
};

const queryReviewSchema = {
  query: Joi.object({
    targetId: Joi.string().hex().length(24).required(),
    targetModel: Joi.string().valid('Service', 'Partner').required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }).unknown(false)
};

module.exports = {
  createReviewSchema,
  queryReviewSchema
};
