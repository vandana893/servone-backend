const Joi = require('joi');

const createBookingSchema = {
  body: Joi.object({
    categoryId: Joi.string().hex().length(24).required(),
    serviceId: Joi.string().hex().length(24).required(),
    serviceVariant: Joi.string(),
    problemDescription: Joi.string().required(),
    media: Joi.array().items(Joi.string()),
    address: Joi.object({
      houseNo: Joi.string(),
      locality: Joi.string(),
      village: Joi.string(),
      landmark: Joi.string(),
      pinCode: Joi.string().required(),
      district: Joi.string(),
      state: Joi.string(),
      longitude: Joi.number(),
      latitude: Joi.number()
    }).required(),
    isInstant: Joi.boolean().default(false),
    scheduledDate: Joi.date().iso(),
    scheduledTimeSlot: Joi.string(),
    pricingModel: Joi.string().required(),
    paymentMethod: Joi.string().valid('CASH', 'UPI', 'CARD', 'WALLET')
  })
};

const updateStatusSchema = {
  body: Joi.object({
    status: Joi.string().valid(
      'ACCEPTED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 
      'COMPLETED', 'CANCELLED', 'REJECTED', 'RESCHEDULE_REQUESTED', 'QUOTE_REQUIRED'
    ).required(),
    note: Joi.string(),
    workerId: Joi.string().hex().length(24) // Required when assigning
  })
};

const cancelSchema = {
  body: Joi.object({
    reason: Joi.string().required()
  })
};

const rescheduleSchema = {
  body: Joi.object({
    scheduledDate: Joi.date().iso().required(),
    scheduledTimeSlot: Joi.string().required(),
    reason: Joi.string()
  })
};

const rejectSchema = {
  body: Joi.object({
    reason: Joi.string().required()
  })
};

const assignWorkerSchema = {
  body: Joi.object({
    workerId: Joi.string().hex().length(24).required()
  })
};

module.exports = {
  createBookingSchema,
  updateStatusSchema,
  cancelSchema,
  rescheduleSchema,
  rejectSchema,
  assignWorkerSchema
};
