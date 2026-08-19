const userService = require('../users/user.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await userService.getAllUsers(query, pageNum, limitNum);
    sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return sendError(res, 'User not found', 'NOT_FOUND', 404);
    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await userService.updateUserStatus(req.params.id, status);
    sendSuccess(res, user, `User status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, { total: 0, active: 0, newThisMonth: 0 }, 'User stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getLoginAttempts = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, { data: [] }, 'Login attempts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, { data: [] }, 'Activity logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  getUserStats,
  getLoginAttempts,
  getActivityLogs
};
