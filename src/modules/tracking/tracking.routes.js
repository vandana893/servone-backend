const express = require('express');
const router = express.Router();
const trackingController = require('./tracking.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { 
  updateLocationSchema, 
  trackingParamsSchema,
  trackingHistoryQuerySchema 
} = require('./tracking.validation');

// All tracking routes require authentication
router.use(auth);

// Partner/Worker starts tracking
router.post(
  '/:bookingId/start',
  validate(trackingParamsSchema),
  trackingController.startTracking
);

// Partner/Worker updates location
router.patch(
  '/:bookingId/location',
  validate(trackingParamsSchema),
  validate(updateLocationSchema),
  trackingController.updateLocation
);

// Stop tracking
router.patch(
  '/:bookingId/stop',
  validate(trackingParamsSchema),
  trackingController.stopTracking
);

// Get current tracking (User/Partner/Admin)
router.get(
  '/:bookingId',
  validate(trackingParamsSchema),
  trackingController.getCurrentTracking
);

// Get tracking history (User/Partner/Admin)
router.get(
  '/:bookingId/history',
  validate(trackingParamsSchema),
  validate(trackingHistoryQuerySchema),
  trackingController.getTrackingHistory
);

module.exports = router;
