const express = require('express');
const router = express.Router();
const financeController = require('./finance.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { 
  createTransactionSchema, 
  transactionQuerySchema, 
  transactionIdSchema, 
  updateTransactionStatusSchema 
} = require('./finance.validation');

router.use(auth);

router.get('/transactions', validate(transactionQuerySchema), financeController.getTransactions);
router.get('/transactions/:id', validate(transactionIdSchema), financeController.getTransactionById);

router.post(
  '/transactions', 
  authorize('SuperAdmin', 'Manager', 'Finance'), 
  validate(createTransactionSchema), 
  financeController.createTransaction
);

router.patch(
  '/transactions/:id/status', 
  authorize('SuperAdmin', 'Manager', 'Finance'), 
  validate(transactionIdSchema), 
  validate(updateTransactionStatusSchema), 
  financeController.updateTransactionStatus
);

module.exports = router;
