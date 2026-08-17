const notificationService = require('./notification.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getUserModelStr = (accountType) => {
  if (accountType === 'USER') return 'User';
  if (accountType === 'PARTNER') return 'Partner';
  if (accountType === 'ADMIN') return 'Admin';
  
  const error = new Error('Unknown account type');
  error.statusCode = 403;
  throw error;
};

const getMyNotifications = async (req, res, next) => {
  try {
    const userModel = getUserModelStr(req.auth.accountType);
    const result = await notificationService.getUserNotifications(
      req.auth.accountId, 
      userModel,
      req.query
    );
    
    sendSuccess(res, result, 'Notifications fetched successfully');
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userModel = getUserModelStr(req.auth.accountType);
    const notification = await notificationService.markAsRead(
      req.params.id, 
      req.auth.accountId, 
      userModel
    );
    
    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userModel = getUserModelStr(req.auth.accountType);
    const result = await notificationService.markAllAsRead(
      req.auth.accountId, 
      userModel
    );
    sendSuccess(res, result, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
