const adminService = require('./admin.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getBookingReports = async (req, res, next) => {
  try {
    const stats = await adminService.getBookingReports(req.query);
    sendSuccess(res, stats, 'Booking reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getUserReports = async (req, res, next) => {
  try {
    const stats = await adminService.getUserReports(req.query);
    sendSuccess(res, stats, 'User reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getRevenueReports = async (req, res, next) => {
  try {
    const stats = await adminService.getRevenueReports(req.query);
    sendSuccess(res, stats, 'Revenue reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookingReports,
  getUserReports,
  getRevenueReports
};
