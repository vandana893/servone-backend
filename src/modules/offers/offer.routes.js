const express = require('express');
const router = express.Router();
const offerController = require('./offer.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { createOfferSchema, applyOfferSchema, updateStatusSchema } = require('./offer.validation');
const Joi = require('joi');

const objectIdSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

// Public / User routes
router.get('/', offerController.getActiveOffers);
router.post('/apply', auth, validate({ body: applyOfferSchema }), offerController.applyOffer);

// Admin routes
router.use('/admin', auth, authorize('SuperAdmin', 'Manager'));

router.post(
  '/admin',
  validate({ body: createOfferSchema }),
  offerController.createOffer
);

router.put(
  '/admin/:id/status',
  validate({ params: objectIdSchema, body: updateStatusSchema }),
  offerController.updateOfferStatus
);

router.get('/admin/promocodes', offerController.getPromocodes);
router.get('/admin/sales', offerController.getSales);
router.get('/admin/banners', offerController.getBanners);

router.post('/admin/banners', offerController.createBanner);
router.put('/admin/banners/:id/status', offerController.updateBannerStatus);
router.delete('/admin/banners/:id', offerController.deleteBanner);

module.exports = router;
