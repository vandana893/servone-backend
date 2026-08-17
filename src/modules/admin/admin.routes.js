const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { 
  createAdminSchema, 
  updateProfileSchema,
  updateAdminStatusSchema,
  updateAdminRoleSchema,
  getAdminsQuerySchema
} = require('./admin.validation');

const adminUserController = require('./admin.user.controller');
const adminPartnerController = require('./admin.partner.controller');
const adminBookingController = require('./admin.booking.controller');
const requirePermission = require('../../middlewares/requirePermission');

router.use(auth);

// Profile and Dashboard operations
router.get('/profile', adminController.getProfile);
router.put('/profile', validate(updateProfileSchema), adminController.updateProfile);
router.get('/dashboard', requirePermission('Dashboard'), adminController.getDashboardStats);

// Admin Management
router.post('/', authorize('SuperAdmin'), validate(createAdminSchema), adminController.createAdmin);
router.get('/', authorize('SuperAdmin'), validate(getAdminsQuerySchema), adminController.getAdmins);

// === USERS ===
router.get('/users', requirePermission('Users'), adminUserController.getUsers);
router.get('/users/:id', requirePermission('Users'), adminUserController.getUserById);
router.patch('/users/:id/status', requirePermission('Users'), adminUserController.updateUserStatus);

// === PARTNERS ===
router.get('/partners', requirePermission('Partners'), adminPartnerController.getPartners);
router.get('/partners/:id', requirePermission('Partners'), adminPartnerController.getPartnerById);
router.patch('/partners/:id/status', requirePermission('Partners'), adminPartnerController.updatePartnerStatus);
router.patch('/partners/:id/kyc-verify', requirePermission('PartnerVerification'), adminPartnerController.verifyPartnerKyc);

// === BOOKINGS ===
router.get('/bookings', requirePermission('Bookings'), adminBookingController.getBookings);
router.get('/bookings/:id', requirePermission('Bookings'), adminBookingController.getBookingById);

// === SUBSCRIPTIONS ===
const adminSubscriptionController = require('./admin.subscription.controller');
router.get('/subscriptions', requirePermission('Subscriptions'), adminSubscriptionController.getAllSubscriptions);
router.get('/subscriptions/:id', requirePermission('Subscriptions'), adminSubscriptionController.getSubscriptionById);

// Admin Management (ID routes moved to bottom to prevent shadowing static routes like /users)
router.get('/:id', authorize('SuperAdmin'), adminController.getAdminById);
router.patch('/:id/status', authorize('SuperAdmin'), validate(updateAdminStatusSchema), adminController.updateAdminStatus);
router.patch('/:id/role', authorize('SuperAdmin'), validate(updateAdminRoleSchema), adminController.updateAdminRole);

module.exports = router;
