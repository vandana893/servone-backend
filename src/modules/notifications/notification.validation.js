const Joi = require('joi');

const idSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
};

const notificationQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isRead: Joi.boolean().optional(),
    type: Joi.string().trim().max(50).optional()
  })
};

const createNotificationSchema = {
  body: Joi.object({
    userId: Joi.string().hex().length(24).required(),
    userModel: Joi.string().valid('User', 'Partner', 'Admin').required(),
    type: Joi.string().trim().max(50).required(),
    title: Joi.string().trim().max(100).required(),
    message: Joi.string().trim().max(1000).required(),
    entityType: Joi.string().max(50),
    entityId: Joi.string().hex().length(24),
    isRead: Joi.boolean().default(false)
  })
};

module.exports = {
  idSchema,
  notificationQuerySchema,
  createNotificationSchema
};
