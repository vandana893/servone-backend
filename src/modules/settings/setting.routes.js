const express = require('express');
const router = express.Router();
const settingController = require('./setting.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { updateSettingSchema } = require('./setting.validation');

// Public route to fetch configuration (e.g. maintenance mode, active countries)
router.get('/', settingController.getPublicSettings);

// Admin routes
router.use('/admin', auth, authorize('SuperAdmin', 'Manager'));
router.get('/admin', settingController.getAllSettingsAdmin);
router.put('/admin', validate({ body: updateSettingSchema }), settingController.upsertSetting);

module.exports = router;
