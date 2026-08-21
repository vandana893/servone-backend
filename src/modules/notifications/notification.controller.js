const notificationService = require('./notification.service');
const { sendSuccess, sendError } = require('../../utils/response');

const settingService = require('../settings/setting.service');
const Notification = require('./notification.model');
const Broadcast = require('./broadcast.model');
const NotificationTrigger = require('./trigger.model');

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

const getBroadcasts = async (req, res, next) => {
  try {
    const broadcasts = await Notification.find({ type: 'BROADCAST', userModel: 'Admin' }).sort({ createdAt: -1 });
    
    // Map to frontend format
    const formatted = broadcasts.map(b => ({
      id: b._id,
      title: b.title,
      message: b.message,
      target: b.entityType || 'All Users',
      status: 'Delivered',
      audience: '1,200 (Est)',
      date: b.createdAt.toISOString().substring(0, 10)
    }));
    
    sendSuccess(res, formatted, 'Broadcasts fetched successfully');
  } catch (error) {
    next(error);
  }
};

const createBroadcast = async (req, res, next) => {
  try {
    const newBroadcast = new Notification({
      userId: req.auth.accountId,
      userModel: 'Admin',
      type: 'BROADCAST',
      title: req.body.title,
      message: req.body.message,
      entityType: req.body.target || 'All Users'
    });
    
    await newBroadcast.save();
    
    const formatted = {
      id: newBroadcast._id,
      title: newBroadcast.title,
      message: newBroadcast.message,
      target: newBroadcast.entityType,
      status: 'Delivered',
      audience: '1,200 (Est)',
      date: newBroadcast.createdAt.toISOString().substring(0, 10)
    };
    
    sendSuccess(res, formatted, 'Broadcast created successfully');
  } catch (error) {
    next(error);
  }
};

const deleteBroadcast = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, type: 'BROADCAST' });
    sendSuccess(res, { id: req.params.id }, 'Broadcast deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getTriggers = async (req, res, next) => {
  try {
    const triggers = await NotificationTrigger.find();
    sendSuccess(res, triggers, 'Triggers fetched successfully');
  } catch (error) {
    next(error);
  }
};

const createTrigger = async (req, res, next) => {
  try {
    const triggers = req.body.triggers || req.body;
    
    if (Array.isArray(triggers)) {
      for (const t of triggers) {
        await NotificationTrigger.findOneAndUpdate(
          { id: t.id },
          t,
          { upsert: true, new: true }
        );
      }
    }
    
    const updatedTriggers = await NotificationTrigger.find();
    sendSuccess(res, updatedTriggers, 'Triggers updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getBroadcasts,
  createBroadcast,
  deleteBroadcast,
  getTriggers,
  createTrigger
};
