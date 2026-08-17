const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const User = require('../modules/users/user.model');
const Partner = require('../modules/partners/partner.model');
const Admin = require('../modules/admin/admin.model');

const auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    const parts = req.headers.authorization.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    } else if (parts.length === 1) {
      token = parts[0];
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized to access this route', 'UNAUTHORIZED', 401);
  }

  try {
    const decoded = verifyAccessToken(token);
    const { sub, accountType } = decoded;

    let account;
    if (accountType === 'USER') {
      account = await User.findById(sub);
    } else if (accountType === 'PARTNER') {
      account = await Partner.findById(sub);
    } else if (accountType === 'ADMIN') {
      account = await Admin.findById(sub);
    }

    if (!account) {
      return sendError(res, 'Account not found', 'UNAUTHORIZED', 401);
    }

    // Check account status
    if (accountType === 'USER') {
      if (account.status === 'BLOCKED' || account.status === 'INACTIVE') {
        return sendError(res, 'Account is inactive or blocked', 'FORBIDDEN', 403);
      }
    } else if (accountType === 'PARTNER') {
      // Allow access for specific APIs even if not APPROVED (like getting profile), 
      // but strictly, they shouldn't access operational APIs. 
      // For general auth middleware, we just check if it's not SUSPENDED/REJECTED.
      // A separate operational middleware should check for APPROVED.
      if (account.status === 'SUSPENDED' || account.status === 'REJECTED') {
        return sendError(res, 'Account is suspended or rejected', 'FORBIDDEN', 403);
      }
    } else if (accountType === 'ADMIN') {
      if (account.status === 'INACTIVE' || account.status === 'SUSPENDED') {
        return sendError(res, 'Admin account is inactive or suspended', 'FORBIDDEN', 403);
      }
    }

    req.auth = {
      accountId: account._id,
      accountType: accountType,
      role: accountType === 'ADMIN' ? account.role : undefined,
      permissions: accountType === 'ADMIN' ? account.permissions : undefined,
      partnerType: accountType === 'PARTNER' ? account.partnerType : undefined,
      status: account.status
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', 'UNAUTHORIZED', 401);
    }
    return sendError(res, 'Not authorized', 'UNAUTHORIZED', 401);
  }
};

module.exports = auth;
