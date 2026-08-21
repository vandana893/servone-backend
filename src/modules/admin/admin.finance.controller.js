const financeService = require('../finance/finance.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getPendingPayouts = async (req, res, next) => {
  try {
    const query = { type: 'PAYOUT', status: 'PENDING', ...req.query };
    const payouts = await financeService.getTransactions(query);
    sendSuccess(res, payouts, 'Pending payouts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const processPayout = async (req, res, next) => {
  try {
    const { referenceId } = req.body;
    const adminId = req.auth.accountId;
    const transaction = await financeService.processPayout(req.params.id, referenceId, adminId);
    sendSuccess(res, transaction, 'Payout processed successfully');
  } catch (error) {
    next(error);
  }
};

const getPayouts = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, [], 'Payouts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getFailedPayouts = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, [], 'Failed payouts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getPayoutQueue = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, [], 'Payout queue retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getPayoutLedger = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, [], 'Payout ledger retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getProcessingPayouts = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, [], 'Processing payouts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingPayouts,
  processPayout,
  getPayouts,
  getFailedPayouts,
  getPayoutQueue,
  getPayoutLedger,
  getProcessingPayouts
};
