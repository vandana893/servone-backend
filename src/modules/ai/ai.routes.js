const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const auth = require('../../middlewares/auth');

// Note: In some apps, AI chat might be available to guests. We use auth here for user tracking context.
router.post('/chat/intent', auth, aiController.chatIntent);

module.exports = router;
