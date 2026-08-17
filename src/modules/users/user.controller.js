const userService = require('./user.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.auth.accountId);
    if (!user) return sendError(res, 'User not found', 'NOT_FOUND', 404);
    
    sendSuccess(res, user, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.auth.accountId, req.body);
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.auth.accountId);
    if (!user) return sendError(res, 'User not found', 'NOT_FOUND', 404);
    
    sendSuccess(res, user.addresses, 'Addresses fetched successfully');
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const addresses = await userService.addUserAddress(req.auth.accountId, req.body);
    sendSuccess(res, addresses, 'Address added successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const addresses = await userService.updateUserAddress(req.auth.accountId, req.params.addressId, req.body);
    sendSuccess(res, addresses, 'Address updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const addresses = await userService.deleteUserAddress(req.auth.accountId, req.params.addressId);
    sendSuccess(res, addresses, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};
