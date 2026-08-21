const Joi = require('joi');

const createTicketSchema = {
  body: Joi.object({
    bookingId: Joi.string().hex().length(24),
    transactionId: Joi.string().hex().length(24),
    type: Joi.string().valid('General', 'Complaint', 'Dispute', 'Refund').default('General'),
    subject: Joi.string().trim().max(200).required(),
    description: Joi.string().trim().max(5000).required(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').default('Medium')
  }).unknown(false)
};

const supportQuerySchema = {
  query: Joi.object({
    status: Joi.string().valid('Open', 'In Progress', 'Resolved', 'Closed'),
    type: Joi.string().valid('General', 'Complaint', 'Dispute', 'Refund'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }).unknown(false)
};

const addMessageSchema = {
  body: Joi.object({
    message: Joi.string().trim().max(5000).required(),
    attachments: Joi.array().items(Joi.string().max(1000)).max(10)
  }).unknown(false)
};

const updateTicketStatusSchema = {
  body: Joi.object({
    status: Joi.string().valid('Open', 'In Progress', 'Resolved', 'Closed', 'Penalty Applied').required(),
    resolutionNote: Joi.string().trim().max(2000)
  }).unknown(false)
};

module.exports = {
  createTicketSchema,
  supportQuerySchema,
  addMessageSchema,
  updateTicketStatusSchema
};
