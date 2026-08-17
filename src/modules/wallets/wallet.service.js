const WalletTransaction = require('./wallet.model');
const User = require('../users/user.model');
const Partner = require('../partners/partner.model');

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const getAccountModel = (accountType) => {
  return accountType === 'PARTNER' ? Partner : User;
};

const getModelName = (accountType) => {
  return accountType === 'PARTNER' ? 'Partner' : 'User';
};

const getBalanceAndHistory = async (accountId, accountType) => {
  const Model = getAccountModel(accountType);
  const account = await Model.findById(accountId).select('walletBalance');
  if (!account) throwError('Account not found', 404);

  const history = await WalletTransaction.find({ accountId }).sort({ createdAt: -1 }).limit(50);
  
  return {
    balance: account.walletBalance,
    history
  };
};

const rechargeWallet = async (accountId, accountType, amount, referenceId) => {
  const Model = getAccountModel(accountType);
  const account = await Model.findById(accountId);
  if (!account) throwError('Account not found', 404);

  const newBalance = (account.walletBalance || 0) + amount;
  account.walletBalance = newBalance;
  await account.save();

  const transaction = new WalletTransaction({
    accountId,
    accountModel: getModelName(accountType),
    transactionType: 'CREDIT',
    amount,
    balanceAfter: newBalance,
    description: 'Wallet Recharge',
    referenceId
  });

  await transaction.save();
  return transaction;
};

const deductFromWallet = async (accountId, accountType, amount, description, referenceId) => {
  const Model = getAccountModel(accountType);
  const account = await Model.findById(accountId);
  if (!account) throwError('Account not found', 404);

  const currentBalance = account.walletBalance || 0;
  if (currentBalance < amount) {
    throwError('Insufficient wallet balance');
  }

  const newBalance = currentBalance - amount;
  account.walletBalance = newBalance;
  await account.save();

  const transaction = new WalletTransaction({
    accountId,
    accountModel: getModelName(accountType),
    transactionType: 'DEBIT',
    amount,
    balanceAfter: newBalance,
    description,
    referenceId
  });

  await transaction.save();
  return transaction;
};

module.exports = {
  getBalanceAndHistory,
  rechargeWallet,
  deductFromWallet
};
