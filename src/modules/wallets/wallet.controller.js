const walletService = require('./wallet.service');
const { sendSuccess } = require('../../utils/response');

const getMyBalance = async (req, res, next) => {
  try {
    const { accountId, accountType } = req.auth;
    const data = await walletService.getBalanceAndHistory(accountId, accountType);
    return sendSuccess(res, data, 'Wallet details retrieved');
  } catch (error) {
    next(error);
  }
};

const recharge = async (req, res, next) => {
  try {
    const { accountId, accountType } = req.auth;
    const { amount, referenceId } = req.body;
    // In production, this API is usually called AFTER a successful payment gateway webhook (e.g. Razorpay)
    const transaction = await walletService.rechargeWallet(accountId, accountType, amount, referenceId);
    return sendSuccess(res, transaction, 'Wallet recharged successfully', 201);
  } catch (error) {
    next(error);
  }
};

const pay = async (req, res, next) => {
  try {
    const { accountId, accountType } = req.auth;
    const { amount, description, referenceId } = req.body;
    const transaction = await walletService.deductFromWallet(accountId, accountType, amount, description, referenceId);
    return sendSuccess(res, transaction, 'Payment successful');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyBalance,
  recharge,
  pay
};
