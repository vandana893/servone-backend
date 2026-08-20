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
router.get('/users/stats', requirePermission('Users'), adminUserController.getUserStats);
router.get('/users/login-attempts', requirePermission('Users'), adminUserController.getLoginAttempts);
router.get('/users/activity-logs', requirePermission('Users'), adminUserController.getActivityLogs);
router.get('/users/:id', requirePermission('Users'), adminUserController.getUserById);
router.patch('/users/:id/status', requirePermission('Users'), adminUserController.updateUserStatus);

// === PARTNERS ===
router.get('/partners', requirePermission('Partners'), adminPartnerController.getPartners);
router.get('/partners/stats', requirePermission('Partners'), adminPartnerController.getPartnerStats);
router.get('/partners/:id', requirePermission('Partners'), adminPartnerController.getPartnerById);
router.patch('/partners/:id/status', requirePermission('Partners'), adminPartnerController.updatePartnerStatus);
router.patch('/partners/:id/kyc-verify', requirePermission('PartnerVerification'), adminPartnerController.verifyPartnerKyc);

// Worker Management
router.get('/workers', requirePermission('Partners'), adminPartnerController.getAllWorkers);
router.get('/workers/complaints', requirePermission('Partners'), adminPartnerController.getWorkerComplaints);
router.get('/workers/availability', requirePermission('Partners'), adminPartnerController.getWorkerAvailability);
router.get('/workers/assignments', requirePermission('Partners'), adminPartnerController.getWorkerAssignments);
router.get('/partners/:id/workers', requirePermission('Partners'), adminPartnerController.getWorkers);
router.post('/partners/:id/workers', requirePermission('Partners'), adminPartnerController.addWorker);
router.put('/partners/:id/workers/:workerId', requirePermission('Partners'), adminPartnerController.updateWorker);
router.delete('/partners/:id/workers/:workerId', requirePermission('Partners'), adminPartnerController.deleteWorker);

// === BOOKINGS ===
router.get('/bookings', requirePermission('Bookings'), adminBookingController.getBookings);
router.get('/bookings/:id', requirePermission('Bookings'), adminBookingController.getBookingById);
router.put('/bookings/:id/assign', requirePermission('Bookings'), adminBookingController.assignBooking);
router.put('/bookings/:id/cancel', requirePermission('Bookings'), adminBookingController.cancelBooking);
router.put('/bookings/:id/reschedule', requirePermission('Bookings'), adminBookingController.rescheduleBooking);
router.put('/bookings/:id/timeline', requirePermission('Bookings'), adminBookingController.updateTimeline);

// === FINANCE / PAYOUTS ===
const adminFinanceController = require('./admin.finance.controller');
router.get('/finance/payouts', requirePermission('Finance'), adminFinanceController.getPayouts);
router.get('/finance/payouts/failed', requirePermission('Finance'), adminFinanceController.getFailedPayouts);
router.get('/finance/payouts/queue', requirePermission('Finance'), adminFinanceController.getPayoutQueue);
router.get('/finance/payouts/ledger', requirePermission('Finance'), adminFinanceController.getPayoutLedger);
router.get('/finance/payouts/processing', requirePermission('Finance'), adminFinanceController.getProcessingPayouts);
router.get('/finance/payouts/pending', requirePermission('Finance'), adminFinanceController.getPendingPayouts);
router.post('/finance/payouts/:id/process', requirePermission('Finance'), adminFinanceController.processPayout);

// === SUBSCRIPTIONS ===
const adminSubscriptionController = require('./admin.subscription.controller');
router.get('/subscriptions', requirePermission('Subscriptions'), adminSubscriptionController.getAllSubscriptions);
router.get('/subscriptions/:id', requirePermission('Subscriptions'), adminSubscriptionController.getSubscriptionById);

// Admin Management (ID routes moved to bottom to prevent shadowing static routes like /users)
router.get('/:id', authorize('SuperAdmin'), adminController.getAdminById);
router.patch('/:id/status', authorize('SuperAdmin'), validate(updateAdminStatusSchema), adminController.updateAdminStatus);
router.patch('/:id/role', authorize('SuperAdmin'), validate(updateAdminRoleSchema), adminController.updateAdminRole);

// === SUPPORT TICKETS ===
const adminSupportController = require('./admin.support.controller');
const supportController = require('../support/support.controller');
router.get('/support/tickets', requirePermission('Support'), supportController.getTickets);
router.get('/support/tickets/:id', requirePermission('Support'), supportController.getTicketById);
router.put('/support/tickets/:id/assign', requirePermission('Support'), adminSupportController.assignTicket);
router.put('/support/tickets/:id/resolve', requirePermission('Support'), adminSupportController.resolveTicket);

// === REPORTS ===
const adminReportController = require('./admin.report.controller');
router.get('/reports/bookings', requirePermission('Reports'), adminReportController.getBookingReports);
router.get('/reports/users', requirePermission('Reports'), adminReportController.getUserReports);
router.get('/reports/revenue', requirePermission('Reports'), adminReportController.getRevenueReports);

module.exports = router;
