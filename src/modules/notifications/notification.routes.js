const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { idSchema, notificationQuerySchema } = require('./notification.validation');

router.use(auth);

router.get('/', validate(notificationQuerySchema), notificationController.getMyNotifications);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:id/read', validate(idSchema), notificationController.markAsRead);

// Admin / Broadcast routes
router.get('/broadcasts', notificationController.getBroadcasts);
router.post('/broadcasts', notificationController.createBroadcast);
router.delete('/broadcasts/:id', notificationController.deleteBroadcast);
router.get('/triggers', notificationController.getTriggers);
router.post('/triggers', notificationController.createTrigger);

module.exports = router;
