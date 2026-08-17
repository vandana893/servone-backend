const Joi = require('joi');

const createMaterialRequestSchema = Joi.object({
  bookingId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      specification: Joi.string().optional().allow('')
    })
  ).min(1).required(),
  urgency: Joi.string().valid('NORMAL', 'URGENT').optional(),
  notes: Joi.string().optional().allow('')
}).unknown(false);

const quoteMaterialRequestSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      priceQuote: Joi.number().min(0).required()
    })
  ).min(1).required()
}).unknown(false);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'QUOTED', 'ACCEPTED', 'FULFILLED', 'REJECTED').required(),
  rejectionReason: Joi.string().when('status', {
    is: 'REJECTED',
    then: Joi.required(),
    otherwise: Joi.optional().allow('')
  })
}).unknown(false);

module.exports = {
  createMaterialRequestSchema,
  quoteMaterialRequestSchema,
  updateStatusSchema
};
