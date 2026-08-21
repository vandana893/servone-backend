const mongoose = require('mongoose');
const crypto = require('crypto');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
  senderModel: { type: String, enum: ['User', 'Partner', 'Admin'], required: true },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  attachments: [String]
}, { timestamps: true });

const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  
  // Who created it
  creatorId: { type: mongoose.Schema.Types.ObjectId, refPath: 'creatorModel', required: true },
  creatorModel: { type: String, enum: ['User', 'Partner'], required: true },
  
  // Context
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  
  type: { type: String, enum: ['General', 'Complaint', 'Dispute', 'Refund'], default: 'General' },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed', 'Penalty Applied'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  
  assignedAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  resolutionNote: { type: String, trim: true, maxlength: 2000 },
  
  messages: [messageSchema]
}, { timestamps: true });

// Composite indexes for fast tenant filtering
supportTicketSchema.index({ creatorId: 1, creatorModel: 1, createdAt: -1 });
supportTicketSchema.index({ creatorId: 1, creatorModel: 1, status: 1 });
supportTicketSchema.index({ bookingId: 1 });
supportTicketSchema.index({ transactionId: 1 });
supportTicketSchema.index({ assignedAdminId: 1 });

supportTicketSchema.pre('save', function(next) {
  if (!this.ticketId) {
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.ticketId = `TKT-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
