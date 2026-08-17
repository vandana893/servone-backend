const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response');

const sendUserOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await authService.sendOtp(phone);
    sendSuccess(res, result.data, 'OTP sent successfully');
  } catch (error) {
    next(error);
  }
};

const resendUserOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await authService.sendOtp(phone);
    sendSuccess(res, result.data, 'OTP resent successfully');
  } catch (error) {
    next(error);
  }
};

const verifyUserOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const result = await authService.verifyUserOtp(phone, otp);
    sendSuccess(res, result, 'User OTP verified successfully');
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('Maximum')) {
      return sendError(res, error.message, 'UNAUTHORIZED', 401);
    }
    next(error);
  }
};

const sendPartnerOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await authService.sendOtp(phone);
    sendSuccess(res, result.data, 'OTP sent successfully');
  } catch (error) {
    next(error);
  }
};

const resendPartnerOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await authService.sendOtp(phone);
    sendSuccess(res, result.data, 'OTP resent successfully');
  } catch (error) {
    next(error);
  }
};

const verifyPartnerOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const result = await authService.verifyPartnerOtp(phone, otp);
    sendSuccess(res, result, 'Partner OTP verified successfully');
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('Maximum')) {
      return sendError(res, error.message, 'UNAUTHORIZED', 401);
    }
    next(error);
  }
};

const registerPartner = async (req, res, next) => {
  try {
    const result = await authService.registerPartner(req.body);
    sendSuccess(res, result, 'Partner registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin(email, password);
    sendSuccess(res, result, 'Admin login successful');
  } catch (error) {
    if (error.message === 'Invalid email or password' || error.message.includes('inactive')) {
      return sendError(res, error.message, 'UNAUTHORIZED', 401);
    }
    next(error);
  }
};

const setupInitialAdmin = async (req, res, next) => {
  try {
    const result = await authService.setupInitialAdmin(req.body);
    sendSuccess(res, result, 'Initial Admin setup successful', 201);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return sendError(res, error.message, 'FORBIDDEN', 403);
    }
    next(error);
  }
};



const getMe = async (req, res, next) => {
  try {
    sendSuccess(res, req.auth, 'Current account retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result, 'Token refreshed successfully');
  } catch (error) {
    return sendError(res, error.message, 'UNAUTHORIZED', 401);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // req.auth should be populated by authMiddleware
    if (!req.auth || req.auth.accountType !== 'ADMIN') {
      return sendError(res, 'Only admins can change password', 'FORBIDDEN', 403);
    }
    await authService.changePassword(req.auth.accountId, currentPassword, newPassword);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      return sendError(res, error.message, 'BAD_REQUEST', 400);
    }
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    sendSuccess(res, result, 'Password reset instructions sent');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    const result = await authService.resetPassword(resetToken, newPassword);
    sendSuccess(res, result, 'Password reset successfully');
  } catch (error) {
    return sendError(res, error.message, 'BAD_REQUEST', 400);
  }
};

module.exports = {
  sendUserOtp,
  resendUserOtp,
  verifyUserOtp,
  sendPartnerOtp,
  resendPartnerOtp,
  verifyPartnerOtp,
  registerPartner,
  loginAdmin,
  setupInitialAdmin,

  getMe,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword
};
