const AuditLog = require('../modules/audit/audit.model');

/**
 * Middleware to log admin actions.
 * Usage: router.put('/some/route', auth, authorize('Admin'), auditLogger('ACTION_NAME', 'TargetModel'), controllerFunc)
 */
const auditLogger = (action, targetModel) => {
  return async (req, res, next) => {
    // We capture the original send/json method to log AFTER a successful response
    const originalJson = res.json;
    
    res.json = function (body) {
      res.json = originalJson; // Restore original to prevent infinite loop
      
      // Only log if the request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Attempt to extract target ID from params, body, or response
          let targetId = req.params.id || req.params.workerId || req.body.id || req.body.partnerId;
          if (!targetId && body.data && body.data._id) {
            targetId = body.data._id;
          }

          if (targetId && req.auth && req.auth.accountId) {
            const log = new AuditLog({
              adminId: req.auth.accountId,
              action: action,
              targetModel: targetModel,
              targetId: targetId,
              details: {
                requestBody: req.body,
                query: req.query
              },
              ipAddress: req.ip,
              userAgent: req.get('User-Agent')
            });
            
            // Save async without blocking the response
            log.save().catch(err => console.error('Audit Log Save Error:', err));
          }
        } catch (error) {
          console.error('Audit Logger Error:', error);
        }
      }
      
      return res.json(body);
    };
    
    next();
  };
};

module.exports = auditLogger;
