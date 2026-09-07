const userService = require('./user.service');
const { sendSuccess, sendError } = require('../../utils/response');
const Partner = require('../partners/partner.model');

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

const getMockPartner = async (req, res, next) => {
  try {
    // Find a partner that has a photo (recently updated)
    const partner = await Partner.findOne({ photo: { $ne: null } }).sort({ updatedAt: -1 });
    if (!partner) {
      return sendSuccess(res, null, 'No mock partner found');
    }
    
    // Format to match what UI expects
    const mockProvider = {
      id: partner._id,
      name: partner.name || partner.companyName || 'Verified Partner',
      rating: 4.8,
      reviews: 342,
      image: partner.photo,
      phone: partner.phone || '+91 98765 43210',
      distance: '2.3 km away',
      arrivalTime: '15 mins',
    };
    sendSuccess(res, mockProvider, 'Mock partner fetched successfully');
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
  deleteAddress,
  getMockPartner
};
