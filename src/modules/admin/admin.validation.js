const Joi = require('joi');

const PERMISSIONS = [
  'Dashboard', 'Users', 'Partners', 'PartnerVerification', 'BSPWorkers', 
  'Categories', 'Subcategories', 'Services', 'Bookings', 'SupplierRequests', 
  'Finance', 'Referrals', 'CMS', 'Support', 'Offers', 'Reports', 
  'Notifications', 'Settings', 'Subscriptions'
];

const createAdminSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(100).required(),
    email: Joi.string().trim().email().lowercase().max(255).required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().trim().max(20).required(),
    address: Joi.string().trim().allow('', null),
    role: Joi.string().valid('SuperAdmin', 'Manager', 'Support', 'Finance').default('Manager'),
    permissions: Joi.array().items(Joi.string().valid(...PERMISSIONS))
  }).unknown(false)
};

const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().trim().max(100),
    phone: Joi.string().trim().max(20),
    address: Joi.string().trim().allow('', null)
  }).unknown(false)
};

const updateAdminStatusSchema = {
  body: Joi.object({
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').required()
  }).unknown(false)
};

const updateAdminRoleSchema = {
  body: Joi.object({
    role: Joi.string().valid('SuperAdmin', 'Manager', 'Support', 'Finance').required(),
    permissions: Joi.array().items(Joi.string().valid(...PERMISSIONS))
  }).unknown(false)
};

const getAdminsQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    role: Joi.string().valid('SuperAdmin', 'Manager', 'Support', 'Finance'),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED'),
    search: Joi.string().trim()
  }).unknown(false)
};

module.exports = {
  createAdminSchema,
  updateProfileSchema,
  updateAdminStatusSchema,
  updateAdminRoleSchema,
  getAdminsQuerySchema
};
