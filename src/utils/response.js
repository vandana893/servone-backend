/**
 * Standard Success Response format
 * @param {Object} res - Express response object
 * @param {Object} data - Payload to send
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const sendSuccess = (res, data = {}, message = 'Request successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standard Error Response format
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {String} code - Application specific error code
 * @param {Number} statusCode - HTTP status code
 */
const sendError = (res, message = 'Something went wrong', code = 'INTERNAL_ERROR', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code
    }
  });
};

module.exports = {
  sendSuccess,
  sendError
};
