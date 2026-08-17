const { sendError } = require('../utils/response');

/**
 * Middleware to validate request using Joi schema
 * @param {Object} schema - Joi schema (can have body, query, params)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validations = ['body', 'query', 'params'].map(key => {
      if (schema[key]) {
        const { error, value } = schema[key].validate(req[key], { abortEarly: false });
        if (error) {
          return error.details.map(detail => detail.message).join(', ');
        }
        // Assign validated and optionally type-casted values back to the request
        req[key] = value;
      }
      return null;
    }).filter(error => error !== null);

    if (validations.length > 0) {
      return sendError(res, validations.join(' | '), 'VALIDATION_ERROR', 400);
    }

    next();
  };
};

module.exports = validate;
