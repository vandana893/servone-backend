const express = require('express');
const router = express.Router();
const referralController = require('./referral.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { applyReferralSchema, updateStatusSchema } = require('./referral.validation');
const Joi = require('joi');

const objectIdSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

// Apply a referral code (User)
router.post(
  '/apply',
  auth,
  validate({ body: applyReferralSchema }),
  referralController.applyReferralCode
);

// Get own referral history
router.get(
  '/me/history',
  auth,
  referralController.getMyReferralHistory
);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all referrals
router.get(
  '/admin/history',
  auth,
  authorize('SuperAdmin', 'Manager'), // Assuming these are valid roles, matching common project patterns
  referralController.getAdminReferralHistory
);

// Update referral status (Fraud review)
router.put(
  '/admin/:id/status',
  auth,
  authorize('SuperAdmin', 'Manager'),
  validate({ params: objectIdSchema, body: updateStatusSchema }),
  referralController.updateReferralStatus
);

module.exports = router;
