const bookingService = require('./booking.service');
const { sendSuccess, sendError } = require('../../utils/response');

const createBooking = async (req, res, next) => {
  try {
    if (req.auth.accountType !== 'USER') {
      return sendError(res, 'Only Users can create bookings', 'FORBIDDEN', 403);
    }
    const booking = await bookingService.createBooking(req.auth.accountId, req.body, req.auth);
    sendSuccess(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getBookings(req.query, req.auth);
    sendSuccess(res, result, 'Bookings fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.auth);
    if (!booking) return sendError(res, 'Booking not found or access denied', 'NOT_FOUND', 404);
    sendSuccess(res, booking, 'Booking fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getTimeline = async (req, res, next) => {
  try {
    const timeline = await bookingService.getTimeline(req.params.id, req.auth);
    sendSuccess(res, timeline, 'Booking timeline fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatus(req.params.id, req.body, req.auth);
    sendSuccess(res, booking, 'Booking status updated successfully');
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.body.reason, req.auth);
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

const rebookBooking = async (req, res, next) => {
  try {
    if (req.auth.accountType !== 'USER') {
      return sendError(res, 'Only Users can rebook', 'FORBIDDEN', 403);
    }
    const newBooking = await bookingService.rebookBooking(req.params.id, req.auth);
    sendSuccess(res, newBooking, 'Rebooked successfully', 201);
  } catch (error) {
    next(error);
  }
};

const acceptBooking = async (req, res, next) => {
  try {
    if (req.auth.accountType !== 'PARTNER') {
      return sendError(res, 'Only partners can accept bookings', 'FORBIDDEN', 403);
    }
    const booking = await bookingService.acceptBooking(req.params.id, req.auth);
    sendSuccess(res, booking, 'Booking accepted successfully');
  } catch (error) {
    next(error);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    if (req.auth.accountType !== 'PARTNER') {
      return sendError(res, 'Only partners can reject bookings', 'FORBIDDEN', 403);
    }
    const booking = await bookingService.rejectBooking(req.params.id, req.body.reason, req.auth);
    sendSuccess(res, booking, 'Booking rejected successfully');
  } catch (error) {
    next(error);
  }
};

const getEligibleWorkers = async (req, res, next) => {
  try {
    const isBSP = req.auth.accountType === 'PARTNER' && req.auth.partnerType === 'BSP';
    const isAdmin = req.auth.accountType === 'ADMIN';
    if (!isBSP && !isAdmin) {
      return sendError(res, 'Only BSPs and ADMINs can manage workers', 'FORBIDDEN', 403);
    }
    const workers = await bookingService.getEligibleWorkers(req.params.id, req.auth);
    sendSuccess(res, workers, 'Eligible workers fetched successfully');
  } catch (error) {
    next(error);
  }
};

const assignWorker = async (req, res, next) => {
  try {
    const isBSP = req.auth.accountType === 'PARTNER' && req.auth.partnerType === 'BSP';
    const isAdmin = req.auth.accountType === 'ADMIN';
    if (!isBSP && !isAdmin) {
      return sendError(res, 'Not authorized to assign workers. Only BSP or ADMIN allowed.', 'FORBIDDEN', 403);
    }
    const booking = await bookingService.assignWorker(req.params.id, req.body.workerId, req.auth);
    sendSuccess(res, booking, 'Worker assigned successfully');
  } catch (error) {
    next(error);
  }
};

const reassignWorker = async (req, res, next) => {
  try {
    const isBSP = req.auth.accountType === 'PARTNER' && req.auth.partnerType === 'BSP';
    const isAdmin = req.auth.accountType === 'ADMIN';
    if (!isBSP && !isAdmin) {
      return sendError(res, 'Not authorized to reassign workers. Only BSP or ADMIN allowed.', 'FORBIDDEN', 403);
    }
    const booking = await bookingService.assignWorker(req.params.id, req.body.workerId, req.auth, true);
    sendSuccess(res, booking, 'Worker reassigned successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  getTimeline,
  updateStatus,
  cancelBooking,
  rescheduleBooking,
  rebookBooking,
  acceptBooking,
  rejectBooking,
  getEligibleWorkers,
  assignWorker,
  reassignWorker
};
