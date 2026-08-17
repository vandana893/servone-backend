const settingService = require('./setting.service');
const { sendSuccess } = require('../../utils/response');

const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await settingService.getAllSettings(true);
    return sendSuccess(res, settings, 'Public settings retrieved');
  } catch (error) {
    next(error);
  }
};

const getAllSettingsAdmin = async (req, res, next) => {
  try {
    const settings = await settingService.getAllSettings(false);
    return sendSuccess(res, settings, 'All settings retrieved');
  } catch (error) {
    next(error);
  }
};

const upsertSetting = async (req, res, next) => {
  try {
    const { key, value, description, isPublic } = req.body;
    const setting = await settingService.upsertSetting(key, value, description, isPublic);
    return sendSuccess(res, setting, 'Setting updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicSettings,
  getAllSettingsAdmin,
  upsertSetting
};
