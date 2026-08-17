const Joi = require('joi');

const sendOtpSchema = {
  body: Joi.object({
    phone: Joi.string().trim().max(20).required()
  }).unknown(false)
};

const verifyOtpSchema = {
  body: Joi.object({
    phone: Joi.string().trim().max(20).required(),
    otp: Joi.string().trim().length(6).required() // Assuming 6-digit OTP
  }).unknown(false)
};

const partnerRegisterSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(100).required(),
    phone: Joi.string().trim().max(20).required(),
    email: Joi.string().trim().email().lowercase().max(255).optional(),
    address: Joi.string().trim().max(500).optional(),
    partnerType: Joi.string().valid('ISP', 'BSP', 'BS').required()
  }).unknown(false)
};

const adminLoginSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().lowercase().max(255).required(),
    password: Joi.string().required()
  }).unknown(false)
};

const adminSetupSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(100).required(),
    email: Joi.string().trim().email().lowercase().max(255).required(),
    phone: Joi.string().trim().max(20).required(),
    password: Joi.string().min(6).required()
  }).unknown(false)
};

const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().trim().required()
  }).unknown(false)
};

const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required(),
    confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'confirmPassword must match newPassword'
    })
  }).unknown(false)
};

const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().lowercase().max(255).required()
  }).unknown(false)
};

const resetPasswordSchema = {
  body: Joi.object({
    resetToken: Joi.string().trim().required(),
    newPassword: Joi.string().min(6).max(100).required(),
    confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'confirmPassword must match newPassword'
    })
  }).unknown(false)
};

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  partnerRegisterSchema,
  adminLoginSchema,
  adminSetupSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
