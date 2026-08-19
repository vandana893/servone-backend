const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../utils/response');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    sendSuccess(res, stats, 'Dashboard statistics fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getFunnel = async (req, res, next) => {
  try {
    const funnel = await dashboardService.getFunnel();
    sendSuccess(res, funnel, 'Booking funnel data fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getFunnel
};
