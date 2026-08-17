const Admin = require('./admin.model');
const bcrypt = require('bcryptjs');
const User = require('../users/user.model');
const Booking = require('../bookings/booking.model');
const Partner = require('../partners/partner.model');
const Transaction = require('../finance/finance.model');
const SupportTicket = require('../support/support.model');

const throwError = (msg, code, statusCode) => {
  const error = new Error(msg);
  error.code = code;
  error.statusCode = statusCode;
  throw error;
};

const createAdmin = async (data) => {
  const { password, email, phone, ...rest } = data;
  
  const existingAdmin = await Admin.findOne({ $or: [{ email }, { phone }] });
  if (existingAdmin) {
    if (existingAdmin.email === email) {
      throwError('Email already exists', 'DUPLICATE_EMAIL', 409);
    }
    if (existingAdmin.phone === phone) {
      throwError('Phone already exists', 'DUPLICATE_PHONE', 409);
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const admin = new Admin({
    email,
    phone,
    ...rest,
    password: hashedPassword
  });
  
  await admin.save();
  return admin;
};

const getProfile = async (accountId) => {
  const admin = await Admin.findById(accountId);
  if (!admin) throwError('Admin not found', 'NOT_FOUND', 404);
  return admin;
};

const updateProfile = async (accountId, data) => {
  const admin = await Admin.findByIdAndUpdate(
    accountId,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!admin) throwError('Admin not found', 'NOT_FOUND', 404);
  return admin;
};

const getAdmins = async (query) => {
  const { page = 1, limit = 10, role, status, search } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const [admins, total] = await Promise.all([
    Admin.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Admin.countDocuments(filter)
  ]);

  return {
    admins,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

const getAdminById = async (id) => {
  const admin = await Admin.findById(id);
  if (!admin) throwError('Admin not found', 'NOT_FOUND', 404);
  return admin;
};

const updateAdminStatus = async (id, status, currentUserRole) => {
  if (currentUserRole !== 'SuperAdmin') {
    throwError('Only SuperAdmin can change status', 'FORBIDDEN', 403);
  }

  const admin = await Admin.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!admin) throwError('Admin not found', 'NOT_FOUND', 404);
  return admin;
};

const updateAdminRole = async (id, data, currentUserRole) => {
  if (currentUserRole !== 'SuperAdmin') {
    throwError('Only SuperAdmin can change roles', 'FORBIDDEN', 403);
  }
  
  const admin = await Admin.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!admin) throwError('Admin not found', 'NOT_FOUND', 404);
  return admin;
};

const getDashboardStats = async () => {
  const [totalUsers, totalBookings, activePartners, pendingTickets, revenueAggr] = await Promise.all([
    User.countDocuments(),
    Booking.countDocuments(),
    Partner.countDocuments({ status: 'APPROVED' }),
    SupportTicket.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
    Transaction.aggregate([
      { $match: { status: 'SUCCESS', type: { $in: ['PAYMENT', 'COMMISSION'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  return {
    totalUsers,
    totalBookings,
    activePartners,
    revenue: revenueAggr.length > 0 ? revenueAggr[0].total : 0,
    pendingTickets
  };
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
