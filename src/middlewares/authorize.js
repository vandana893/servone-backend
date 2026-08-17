const { sendError } = require('../utils/response');

/**
 * Middleware to authorize specific roles
 * @param  {...String} roles - Allowed roles (e.g., 'SuperAdmin', 'Manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.auth) {
      return sendError(res, 'Not authorized', 'UNAUTHORIZED', 401);
    }

    if (req.auth.accountType !== 'ADMIN') {
      return sendError(res, 'You do not have permission to perform this action', 'FORBIDDEN', 403);
    }

    if (!req.auth.role || !roles.includes(req.auth.role)) {
      return sendError(res, 'You do not have permission to perform this action', 'FORBIDDEN', 403);
    }

    next();
  };
};

module.exports = authorize;
