const express = require('express');
const router = express.Router();
const supportController = require('./support.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { createTicketSchema, addMessageSchema, updateTicketStatusSchema, supportQuerySchema } = require('./support.validation');
const { sendError } = require('../../utils/response');

router.use(auth);

const requireUserOrPartner = (req, res, next) => {
  if (req.auth.accountType !== 'USER' && req.auth.accountType !== 'PARTNER') {
    return sendError(res, 'Only customers and partners can perform this action', 'FORBIDDEN', 403);
  }
  next();
};

router.post('/', requireUserOrPartner, validate(createTicketSchema), supportController.createTicket);
router.get('/', validate(supportQuerySchema), supportController.getTickets);
router.get('/:id', supportController.getTicketById);
router.post('/:id/messages', validate(addMessageSchema), supportController.addMessage);

// Only Admin can update status
router.patch('/:id/status', authorize('SuperAdmin', 'Manager'), validate(updateTicketStatusSchema), supportController.updateStatus);

module.exports = router;
