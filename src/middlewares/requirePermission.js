const { sendError } = require('../utils/response');

/**
 * Middleware to authorize specific Admin permissions
 * @param  {...String} requiredPermissions - Permissions required for access
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.auth) {
      return sendError(res, 'Not authorized', 'UNAUTHORIZED', 401);
    }

    if (req.auth.accountType !== 'ADMIN') {
      return sendError(res, 'You do not have permission to access admin resources', 'FORBIDDEN', 403);
    }

    // SuperAdmin has bypass
    if (req.auth.role === 'SuperAdmin') {
      return next();
    }

    const adminPermissions = req.auth.permissions || [];
    
    // Check if admin has at least one of the required permissions
    const hasAccess = requiredPermissions.some(p => adminPermissions.includes(p));

    if (!hasAccess) {
      return sendError(res, 'You do not have the required permissions for this action', 'FORBIDDEN', 403);
    }

    next();
  };
};

module.exports = requirePermission;
