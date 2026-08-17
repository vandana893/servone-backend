const Joi = require('joi');

const rechargeSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  referenceId: Joi.string().hex().length(24).optional()
}).unknown(false);

const paySchema = Joi.object({
  amount: Joi.number().min(1).required(),
  description: Joi.string().required(),
  referenceId: Joi.string().hex().length(24).optional()
}).unknown(false);

module.exports = {
  rechargeSchema,
  paySchema
};
