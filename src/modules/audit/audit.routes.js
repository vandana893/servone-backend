const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');

// Only SuperAdmin can view audit logs
router.use(auth, authorize('SuperAdmin'));

router.get('/', auditController.getAuditLogs);

module.exports = router;
