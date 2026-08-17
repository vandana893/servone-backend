const Joi = require('joi');

const createSubscriptionSchema = Joi.object({
  planName: Joi.string().trim().max(100).required(),
  startDate: Joi.date().iso().default(() => new Date()),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  autoRenew: Joi.boolean().optional()
}).unknown(false);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'CANCELLED', 'EXPIRED').required()
}).unknown(false);

module.exports = {
  createSubscriptionSchema,
  updateStatusSchema
};
