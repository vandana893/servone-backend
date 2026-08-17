const Joi = require('joi');

const applyReferralSchema = Joi.object({
  code: Joi.string().trim().required().messages({
    'string.empty': 'Referral code cannot be empty',
    'any.required': 'Referral code is required'
  })
}).unknown(false);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'SUCCESSFUL', 'FRAUD_FLAGGED').required(),
  notes: Joi.string().optional().allow('')
}).unknown(false);

module.exports = {
  applyReferralSchema,
  updateStatusSchema
};
