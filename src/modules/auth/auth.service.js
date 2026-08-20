const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const Auth = require('./auth.model');
const User = require('../users/user.model');
const Partner = require('../partners/partner.model');
const Admin = require('../admin/admin.model');
const OTP = require('./otp.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const env = require('../../config/env');

// Dummy OTP sender for development
const sendSms = async (phone, otp) => {
  console.log(`\n\n=== MOCK SMS ===`);
  console.log(`To: ${phone}`);
  console.log(`OTP: ${otp}`);
  console.log(`================\n\n`);
};

const sendOtp = async (phone) => {
  // Check if OTP was sent recently (cooldown)
  const recentOtp = await OTP.findOne({ phone }).sort({ createdAt: -1 });
  if (recentOtp && (Date.now() - recentOtp.createdAt.getTime()) < (env.otpResendCooldownSeconds * 1000)) {
    throw new Error(`Please wait ${env.otpResendCooldownSeconds} seconds before requesting a new OTP.`);
  }

  // Invalidate previous OTPs
  await OTP.deleteMany({ phone });

  // Generate 6-digit OTP (Static for development/testing)
  const otp = env.nodeEnv === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash OTP
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  // Store OTP
  const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60000);
  await OTP.create({ phone, otpHash, expiresAt });

  // Send OTP
  await sendSms(phone, otp);
  
  return { 
    success: true, 
    message: 'OTP sent successfully',
    data: {
      expiresIn: env.otpExpiryMinutes * 60,
      resendAvailableIn: env.otpResendCooldownSeconds
    }
  };
};

const verifyUserOtp = async (phone, otp) => {
  const otpRecord = await OTP.findOne({ phone }).sort({ createdAt: -1 });
  
  if (!otpRecord) throw new Error('Invalid or expired OTP');
  if (otpRecord.isExpired()) throw new Error('OTP has expired');
  if (otpRecord.attempts >= env.otpMaxAttempts) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error('Maximum OTP verification attempts reached. Request a new OTP.');
  }

  const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error('Invalid OTP');
  }

  // OTP is valid, delete it
  await OTP.deleteOne({ _id: otpRecord._id });

  // Find or create user
  let user = await User.findOne({ phone });
  let isNewUser = false;
  if (!user) {
    // Basic user creation
    user = await User.create({ 
      phone, 
      name: 'User', // Placeholder name
      status: 'ACTIVE',
      profileCompleted: false
    });
    isNewUser = true;
  }

  if (user.status === 'BLOCKED' || user.status === 'INACTIVE') {
    throw new Error('Account is inactive or blocked');
  }

  const tokens = await generateTokensForAccount(user._id, 'USER');
  
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accountType: 'USER',
    profileCompleted: user.profileCompleted,
    user: {
      id: user._id,
      mobile: user.phone,
      name: user.name
    }
  };
};

const verifyPartnerOtp = async (phone, otp) => {
  const otpRecord = await OTP.findOne({ phone }).sort({ createdAt: -1 });
  
  if (!otpRecord) throw new Error('Invalid or expired OTP');
  if (otpRecord.isExpired()) throw new Error('OTP has expired');
  if (otpRecord.attempts >= env.otpMaxAttempts) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error('Maximum OTP verification attempts reached. Request a new OTP.');
  }

  const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error('Invalid OTP');
  }

  // OTP is valid, delete it
  await OTP.deleteOne({ _id: otpRecord._id });

  const partner = await Partner.findOne({ phone });
  
  if (!partner) {
    return {
      message: 'OTP verified. Partner not found. Proceed to registration.',
      accountType: 'PARTNER',
      status: 'NOT_REGISTERED',
      phone
    };
  }

  if (partner.status === 'SUSPENDED' || partner.status === 'REJECTED') {
    throw new Error('Account is suspended or rejected');
  }

  const tokens = await generateTokensForAccount(partner._id, 'PARTNER');

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accountType: 'PARTNER',
    partnerType: partner.partnerType,
    status: partner.status
  };
};

const registerPartner = async (data) => {
  const { name, phone, email, address, partnerType } = data;

  const existingPartner = await Partner.findOne({ phone });
  if (existingPartner) {
    throw new Error('Partner with this phone number already exists');
  }

  const partner = await Partner.create({
    name,
    phone,
    email,
    address: address ? { locality: address } : undefined,
    partnerType,
    status: 'PENDING',
    verificationStatus: 'PENDING'
  });

  const tokens = await generateTokensForAccount(partner._id, 'PARTNER');

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accountType: 'PARTNER',
    partnerType: partner.partnerType,
    status: partner.status
  };
};

const loginAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error('Invalid email or password');
  
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error('Invalid email or password');
  
  if (admin.status === 'INACTIVE' || admin.status === 'SUSPENDED') {
    throw new Error('Account is inactive or suspended');
  }
  
  const tokens = await generateTokensForAccount(admin._id, 'ADMIN');
  
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accountType: 'ADMIN',
    admin: {
      id: admin._id,
      name: admin.name,
      role: admin.role
    }
  };
};

const setupInitialAdmin = async (data) => {
  const { name, email, phone, password } = data;
  
  // Security check: Only allow if no admins exist
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    throw new Error('Initial setup locked. Admin already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admin = await Admin.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: 'SuperAdmin',
    status: 'ACTIVE',
    permissions: [
      'Dashboard', 'Users', 'Partners', 'PartnerVerification', 'BSPWorkers', 
      'Categories', 'Subcategories', 'Services', 'Bookings', 'SupplierRequests', 
      'Finance', 'Referrals', 'CMS', 'Support', 'Offers', 'Reports', 
      'Notifications', 'Settings', 'Subscriptions'
    ]
  });

  const tokens = await generateTokensForAccount(admin._id, 'ADMIN');

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accountType: 'ADMIN',
    admin: {
      id: admin._id,
      name: admin.name,
      role: admin.role
    }
  };
};



const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new Error('Invalid or expired refresh token signature');
  }

  const authRecord = await Auth.findOne({ refreshToken });
  if (!authRecord) throw new Error('Invalid refresh token');
  
  if (authRecord.expiresAt < new Date()) {
    await Auth.deleteOne({ _id: authRecord._id });
    throw new Error('Refresh token expired');
  }

  // Cryptographically verify ownership matches DB record
  if (authRecord.userId.toString() !== decoded.sub) {
    throw new Error('Refresh token ownership mismatch');
  }

  const tokens = await generateTokensForAccount(authRecord.userId, authRecord.userModel);
  
  // Rotate refresh token: invalidate old one
  await Auth.deleteOne({ _id: authRecord._id });
  
  return tokens;
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    await Auth.deleteOne({ refreshToken });
  }
};

const generateTokensForAccount = async (accountId, accountType) => {
  const payload = { sub: accountId, accountType };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  const expiresAt = new Date();
  
  // Parse '7d' or similar from env
  const expiresInStr = env.jwtRefreshExpiresIn || '7d';
  if (expiresInStr.endsWith('d')) {
    const days = parseInt(expiresInStr.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + (isNaN(days) ? 7 : days));
  } else if (expiresInStr.endsWith('h')) {
    const hours = parseInt(expiresInStr.replace('h', ''));
    expiresAt.setHours(expiresAt.getHours() + (isNaN(hours) ? 24 : hours));
  } else {
    expiresAt.setDate(expiresAt.getDate() + 7); // Default fallback
  }

  const userModelType = accountType === 'USER' ? 'User' : (accountType === 'PARTNER' ? 'Partner' : 'Admin');
  
  await Auth.findOneAndUpdate(
    { userId: accountId, userModel: userModelType },
    {
      refreshToken: refreshToken,
      expiresAt: expiresAt
    },
    { upsert: true, new: true }
  );

  return { accessToken, refreshToken };
};

const changePassword = async (accountId, currentPassword, newPassword) => {
  const admin = await Admin.findById(accountId);
  if (!admin) throw new Error('Account not found');

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) throw new Error('Invalid current password');

  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(newPassword, salt);
  await admin.save();

  // Revoke existing refresh tokens
  await Auth.deleteMany({ userId: accountId });
};

const forgotPassword = async (email) => {
  const admin = await Admin.findOne({ email });
  if (!admin) return { success: true, message: 'If the account exists, password reset instructions have been sent.' };
  
  // Create reset token using crypto
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set expire to 10 minutes
  admin.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  await admin.save();

  console.log(`\n\n=== MOCK EMAIL ===\nPassword reset for: ${email}\nReset Token: ${resetToken}\n================\n\n`);
  return { success: true, message: 'If the account exists, password reset instructions have been sent.' };
};

const resetPassword = async (resetToken, newPassword) => {
  // Hash token to compare with db
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const admin = await Admin.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!admin) throw new Error('Invalid or expired password reset token');

  // Set new password
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(newPassword, salt);
  
  // Clear reset token fields
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpire = undefined;
  await admin.save();

  // Revoke existing refresh tokens
  await Auth.deleteMany({ userId: admin._id });

  return { success: true, message: 'Password reset successfully' };
};

module.exports = {
  sendOtp,
  verifyUserOtp,
  verifyPartnerOtp,
  registerPartner,
  loginAdmin,
  setupInitialAdmin,

  refreshAccessToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
};
