const AuditLog = require('./audit.model');
const { sendSuccess } = require('../../utils/response');

const getAuditLogs = async (req, res, next) => {
  try {
    const { adminId, targetModel, action } = req.query;
    const query = {};
    
    if (adminId) query.adminId = adminId;
    if (targetModel) query.targetModel = targetModel;
    if (action) query.action = action.toUpperCase();

    const logs = await AuditLog.find(query)
      .populate('adminId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 for performance

    return sendSuccess(res, logs, 'Audit logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};
