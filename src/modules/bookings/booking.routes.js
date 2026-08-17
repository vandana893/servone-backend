const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { 
  createBookingSchema, 
  updateStatusSchema,
  cancelSchema,
  rescheduleSchema,
  rejectSchema,
  assignWorkerSchema
} = require('./booking.validation');

// Require authentication for all booking routes
router.use(auth);

// Core booking flows
router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.get('/:id/timeline', bookingController.getTimeline);

// Action endpoints
router.patch('/:id/status', validate(updateStatusSchema), bookingController.updateStatus);
router.patch('/:id/cancel', validate(cancelSchema), bookingController.cancelBooking);
router.patch('/:id/reschedule', validate(rescheduleSchema), bookingController.rescheduleBooking);
router.post('/:id/rebook', bookingController.rebookBooking);

// Partner/Provider actions
router.patch('/:id/accept', bookingController.acceptBooking);
router.patch('/:id/reject', validate(rejectSchema), bookingController.rejectBooking);

// BSP Worker assignment flows
router.get('/:id/eligible-workers', bookingController.getEligibleWorkers);
router.patch('/:id/assign-worker', validate(assignWorkerSchema), bookingController.assignWorker);
router.patch('/:id/reassign-worker', validate(assignWorkerSchema), bookingController.reassignWorker);

module.exports = router;
