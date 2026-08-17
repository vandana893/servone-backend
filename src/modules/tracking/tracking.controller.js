const trackingService = require('./tracking.service');
const { sendSuccess } = require('../../utils/response');

const startTracking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const result = await trackingService.startTracking(bookingId, req.auth);
    sendSuccess(res, result, 'Tracking started successfully');
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const result = await trackingService.updateLocation(bookingId, req.body, req.auth);
    sendSuccess(res, result, 'Location updated successfully');
  } catch (error) {
    next(error);
  }
};

const getCurrentTracking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const result = await trackingService.getCurrentTracking(bookingId, req.auth);
    sendSuccess(res, result, 'Current tracking retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getTrackingHistory = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { page, limit } = req.query;
    const result = await trackingService.getTrackingHistory(bookingId, req.auth, parseInt(page), parseInt(limit));
    sendSuccess(res, result, 'Tracking history retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const stopTracking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const result = await trackingService.stopTracking(bookingId, req.auth);
    sendSuccess(res, result, 'Tracking stopped successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startTracking,
  updateLocation,
  getCurrentTracking,
  getTrackingHistory,
  stopTracking
};
