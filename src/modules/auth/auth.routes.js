const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const { 
  sendOtpSchema, 
  verifyOtpSchema, 
  partnerRegisterSchema, 
  adminLoginSchema, 
  adminSetupSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('./auth.validation');

// === USER AUTH ===
router.post('/send-otp', validate(sendOtpSchema), authController.sendUserOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyUserOtp);
router.post('/resend-otp', validate(sendOtpSchema), authController.resendUserOtp);

// === PARTNER AUTH ===
router.post('/partner/send-otp', validate(sendOtpSchema), authController.sendPartnerOtp);
router.post('/partner/verify-otp', validate(verifyOtpSchema), authController.verifyPartnerOtp);
router.post('/partner/resend-otp', validate(sendOtpSchema), authController.resendPartnerOtp);
router.post('/partner/register', validate(partnerRegisterSchema), authController.registerPartner);

// === ADMIN AUTH ===
router.post('/login', validate(adminLoginSchema), authController.loginAdmin);
router.post('/setup', validate(adminSetupSchema), authController.setupInitialAdmin);

// === COMMON ===
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// === PASSWORD MANAGEMENT (ADMIN ONLY) ===
router.put('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
