const bookingService = require('../bookings/booking.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getBookings(req.query, req.auth);
    sendSuccess(res, result, 'Bookings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.auth);
    if (!booking) return sendError(res, 'Booking not found', 'NOT_FOUND', 404);
    sendSuccess(res, booking, 'Booking retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const assignBooking = async (req, res, next) => {
  try {
    const { partnerId, workerId } = req.body;
    const booking = await bookingService.adminAssignBooking(req.params.id, partnerId, workerId, req.auth);
    sendSuccess(res, booking, 'Booking assigned successfully');
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await bookingService.cancelBooking(req.params.id, reason, req.auth);
    sendSuccess(res, booking, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};

const rescheduleBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.rescheduleBooking(req.params.id, req.body, req.auth);
    sendSuccess(res, booking, 'Booking rescheduled successfully');
  } catch (error) {
    next(error);
  }
};

const updateTimeline = async (req, res, next) => {
  try {
    const { note } = req.body;
    const booking = await bookingService.adminUpdateTimeline(req.params.id, note, req.auth);
    sendSuccess(res, booking, 'Timeline updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  getBookingById,
  assignBooking,
  cancelBooking,
  rescheduleBooking,
  updateTimeline
};
