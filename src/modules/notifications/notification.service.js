const Notification = require('./notification.model');
const User = require('../users/user.model');
const Partner = require('../partners/partner.model');
const Admin = require('../admin/admin.model');

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const validateTargetAccount = async (userId, userModel) => {
  let exists = false;
  if (userModel === 'User') {
    exists = await User.exists({ _id: userId });
  } else if (userModel === 'Partner') {
    exists = await Partner.exists({ _id: userId });
  } else if (userModel === 'Admin') {
    exists = await Admin.exists({ _id: userId });
  }
  
  if (!exists) {
    throwError(`Target ${userModel} account not found`, 404);
  }
};

const createNotification = async (data) => {
  await validateTargetAccount(data.userId, data.userModel);
  const notification = new Notification(data);
  await notification.save();
  return notification;
};

const getUserNotifications = async (userId, userModel, queryParams) => {
  const { page = 1, limit = 20, isRead, type } = queryParams;
  const skip = (page - 1) * limit;
  const filter = { userId, userModel };
  
  if (isRead !== undefined) filter.isRead = isRead;
  if (type) filter.type = type;
  
  const [data, total, unreadCount] = await Promise.all([
    Notification.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, userModel, isRead: false })
  ]);
  
  return { data, total, unreadCount, page, limit };
};

const markAsRead = async (notificationId, userId, userModel) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId, userModel },
    { $set: { isRead: true } },
    { returnDocument: 'after' }
  );
  
  if (!notification) {
    throwError('Notification not found', 404);
  }
  
  return notification;
};

const markAllAsRead = async (userId, userModel) => {
  const result = await Notification.updateMany(
    { userId, userModel, isRead: false },
    { $set: { isRead: true } }
  );
  return { modifiedCount: result.modifiedCount };
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
