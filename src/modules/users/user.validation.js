const Joi = require('joi');

const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    gender: Joi.string().valid('Male', 'Female', 'Other'),
    language: Joi.string().valid('English', 'Hindi')
  })
};

const addressSchema = {
  body: Joi.object({
    type: Joi.string().valid('Home', 'Work', 'Other'),
    houseNo: Joi.string(),
    locality: Joi.string(),
    village: Joi.string(),
    landmark: Joi.string(),
    pinCode: Joi.string().required(),
    district: Joi.string(),
    state: Joi.string(),
    longitude: Joi.number(),
    latitude: Joi.number(),
    isDefault: Joi.boolean()
  })
};

module.exports = {
  updateProfileSchema,
  addressSchema
};
