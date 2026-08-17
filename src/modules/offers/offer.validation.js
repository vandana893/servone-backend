const Joi = require('joi');

const createOfferSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('PERCENTAGE', 'FLAT').required(),
  value: Joi.number().min(0).required(),
  maxDiscount: Joi.number().min(0).optional(),
  minOrderValue: Joi.number().min(0).default(0),
  validFrom: Joi.date().iso().required(),
  validUntil: Joi.date().iso().greater(Joi.ref('validFrom')).required(),
  isActive: Joi.boolean().default(true),
  usageLimit: Joi.number().min(1).optional()
}).unknown(false);

const applyOfferSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  orderValue: Joi.number().min(0).required() // To calculate if valid
}).unknown(false);

const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required()
}).unknown(false);

module.exports = {
  createOfferSchema,
  applyOfferSchema,
  updateStatusSchema
};
