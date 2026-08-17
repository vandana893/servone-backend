const adminService = require('./admin.service');
const { sendSuccess } = require('../../utils/response');

const createAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.createAdmin(req.body);
    sendSuccess(res, admin, 'Admin created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const admin = await adminService.getProfile(req.auth.accountId);
    sendSuccess(res, admin, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const admin = await adminService.updateProfile(req.auth.accountId, req.body);
    sendSuccess(res, admin, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const getAdmins = async (req, res, next) => {
  try {
    const result = await adminService.getAdmins(req.query);
    sendSuccess(res, result, 'Admins fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getAdminById = async (req, res, next) => {
  try {
    const admin = await adminService.getAdminById(req.params.id);
    sendSuccess(res, admin, 'Admin fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateAdminStatus = async (req, res, next) => {
  try {
    const admin = await adminService.updateAdminStatus(req.params.id, req.body.status, req.auth.role);
    sendSuccess(res, admin, 'Admin status updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateAdminRole = async (req, res, next) => {
  try {
    const admin = await adminService.updateAdminRole(req.params.id, req.body, req.auth.role);
    sendSuccess(res, admin, 'Admin role updated successfully');
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, stats, 'Dashboard stats fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdmin,
  getProfile,
  updateProfile,
  getAdmins,
  getAdminById,
  updateAdminStatus,
  updateAdminRole,
  getDashboardStats
};
