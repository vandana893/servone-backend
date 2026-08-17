const express = require('express');
const router = express.Router();

// Import module routes here (to be created later)
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const partnerRoutes = require('./modules/partners/partner.routes');
const catalogRoutes = require('./modules/catalog/catalog.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const supportRoutes = require('./modules/support/support.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const contentRoutes = require('./modules/content/content.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const subscriptionRoutes = require('./modules/subscriptions/subscription.routes');
const referralRoutes = require('./modules/referrals/referral.routes');
const materialRoutes = require('./modules/materials/material.routes');
const offerRoutes = require('./modules/offers/offer.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const walletRoutes = require('./modules/wallets/wallet.routes');
const settingRoutes = require('./modules/settings/setting.routes');
const uploadRoutes = require('./modules/uploads/upload.routes');
const auditRoutes = require('./modules/audit/audit.routes');

const trackingRoutes = require('./modules/tracking/tracking.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/partners', partnerRoutes);
router.use('/catalog', catalogRoutes);
router.use('/bookings', bookingRoutes);
router.use('/finance', financeRoutes);
router.use('/support', supportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/content', contentRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/referrals', referralRoutes);
router.use('/materials', materialRoutes);
router.use('/offers', offerRoutes);
router.use('/ai', aiRoutes);
router.use('/wallets', walletRoutes);
router.use('/settings', settingRoutes);
router.use('/uploads', uploadRoutes);
router.use('/audit', auditRoutes);
router.use('/tracking', trackingRoutes);

module.exports = router;
