const { sendError } = require('../utils/response');
const logger = require('../utils/logger');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`[Error] ${err.message}`);
  
  // Expose stack trace only in development
  if (env.nodeEnv === 'development') {
    logger.error(err.stack);
  }

  // Handle specific Mongoose errors
  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 'VALIDATION_ERROR', 400);
  }

  if (err.code && err.code === 11000) {
    return sendError(res, 'Duplicate field value entered', 'DUPLICATE_KEY_ERROR', 400);
  }

  if (err.name === 'CastError') {
    return sendError(res, 'Resource not found', 'RESOURCE_NOT_FOUND', 404);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 'INVALID_TOKEN', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 'EXPIRED_TOKEN', 401);
  }

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  sendError(res, message, code, statusCode);
};

module.exports = errorHandler;
