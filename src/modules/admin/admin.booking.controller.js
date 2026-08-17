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

module.exports = {
  getBookings,
  getBookingById
};
