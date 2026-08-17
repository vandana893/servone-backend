const Joi = require('joi');

const transactionIdSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
};

const createTransactionSchema = {
  body: Joi.object({
    bookingId: Joi.string().hex().length(24),
    userId: Joi.string().hex().length(24),
    partnerId: Joi.string().hex().length(24),
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('INR').default('INR'),
    type: Joi.string().valid('PAYMENT', 'REFUND', 'PAYOUT', 'COMMISSION').required(),
    paymentMethod: Joi.string().valid('CASH', 'UPI', 'CARD', 'WALLET', 'BANK_TRANSFER'),
    referenceId: Joi.string().max(100),
    originalTransactionId: Joi.string().hex().length(24),
    note: Joi.string().max(500)
  })
};

const updateTransactionStatusSchema = {
  body: Joi.object({
    status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED').required(),
    referenceId: Joi.string().max(100)
  })
};

const transactionQuerySchema = {
  query: Joi.object({
    userId: Joi.string().hex().length(24),
    partnerId: Joi.string().hex().length(24),
    bookingId: Joi.string().hex().length(24),
    type: Joi.string().valid('PAYMENT', 'REFUND', 'PAYOUT', 'COMMISSION'),
    status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED'),
    paymentMethod: Joi.string().valid('CASH', 'UPI', 'CARD', 'WALLET', 'BANK_TRANSFER'),
    referenceId: Joi.string().max(100),
    transactionId: Joi.string().max(100),
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    search: Joi.string().max(100),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  })
};

module.exports = {
  transactionIdSchema,
  createTransactionSchema,
  updateTransactionStatusSchema,
  transactionQuerySchema
};
