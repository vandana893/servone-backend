const Joi = require('joi');

const updateSettingSchema = Joi.object({
  key: Joi.string().trim().uppercase().required(),
  value: Joi.any().required(),
  description: Joi.string().optional().allow(''),
  isPublic: Joi.boolean().optional()
}).unknown(false);

module.exports = {
  updateSettingSchema
};
