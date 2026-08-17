const Joi = require('joi');

const updateLocationSchema = {
  body: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    heading: Joi.number().min(0).max(360).default(0),
    speed: Joi.number().min(0).default(0),
    accuracy: Joi.number().min(0).default(0)
  }).unknown(false)
};

const trackingParamsSchema = {
  params: Joi.object({
    bookingId: Joi.string().hex().length(24).required()
  }).unknown(false)
};

const trackingHistoryQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }).unknown(false)
};

module.exports = {
  updateLocationSchema,
  trackingParamsSchema,
  trackingHistoryQuerySchema
};
