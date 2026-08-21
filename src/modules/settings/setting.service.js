const Setting = require('./setting.model');

const getAllSettings = async (isPublicOnly = false) => {
  const query = isPublicOnly ? { isPublic: true } : {};
  return await Setting.find(query).lean();
};

const getSettingByKey = async (key) => {
  return await Setting.findOne({ key: key.toUpperCase() });
};

const upsertSetting = async (key, value, description, isPublic) => {
  const updateData = { value };
  if (description !== undefined) updateData.description = description;
  if (isPublic !== undefined) updateData.isPublic = isPublic;

  return await Setting.findOneAndUpdate(
    { key: key.toUpperCase() },
    updateData,
    { returnDocument: 'after', upsert: true, runValidators: true }
  );
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  upsertSetting
};
