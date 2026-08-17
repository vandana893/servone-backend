const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admins are Users with accountType='ADMIN'
    required: true
  },
  action: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  targetModel: {
    type: String, // e.g. 'Partner', 'User', 'Setting'
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed // JSON payload of what was changed or reasons
  },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
