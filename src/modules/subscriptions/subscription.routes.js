const express = require('express');
const router = express.Router();
const subscriptionController = require('./subscription.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createSubscriptionSchema } = require('./subscription.validation');
const Joi = require('joi');

// ObjectId validation schema for params
const objectIdSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

// All subscription routes require authentication
router.use(auth);

// Create a new subscription
router.post(
  '/',
  validate({ body: createSubscriptionSchema }),
  subscriptionController.createSubscription
);

// Get current user's active subscription
router.get(
  '/me',
  subscriptionController.getMySubscription
);

// Get a subscription by ID
router.get(
  '/:id',
  validate({ params: objectIdSchema }),
  subscriptionController.getSubscriptionById
);

// Cancel a subscription
router.put(
  '/:id/cancel',
  validate({ params: objectIdSchema }),
  subscriptionController.cancelSubscription
);

module.exports = router;
