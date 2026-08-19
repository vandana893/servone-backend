const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');

router.use(auth);

// Dashboard routes are generally for Admins, but you can restrict it further if needed.
router.get('/stats', authorize('SuperAdmin', 'Manager', 'Finance'), dashboardController.getStats);
router.get('/funnel', authorize('SuperAdmin', 'Manager', 'Finance'), dashboardController.getFunnel);

module.exports = router;
