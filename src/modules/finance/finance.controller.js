const financeService = require('./finance.service');
const { sendSuccess } = require('../../utils/response');

const createTransaction = async (req, res, next) => {
  try {
    const data = { ...req.body };
    // Set audit fields. Only Admin can access this route (enforced by routes.js).
    data.createdBy = req.auth.accountId;
    
    const transaction = await financeService.createTransaction(data);
    sendSuccess(res, transaction, 'Transaction created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const query = { ...req.query };
    
    // Scoping based on actual auth token accountType
    if (req.auth.accountType === 'USER') {
      query.userId = req.auth.accountId;
    } else if (req.auth.accountType === 'PARTNER') {
      query.partnerId = req.auth.accountId;
    }

    const result = await financeService.getTransactions(query);
    sendSuccess(res, result, 'Transactions fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await financeService.getTransactionById(req.params.id, req.auth);
    sendSuccess(res, transaction, 'Transaction fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateTransactionStatus = async (req, res, next) => {
  try {
    const { status, referenceId } = req.body;
    const updatedBy = req.auth.accountId;
    
    const transaction = await financeService.updateTransactionStatus(req.params.id, status, referenceId, updatedBy);
    sendSuccess(res, transaction, 'Transaction status updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus
};
