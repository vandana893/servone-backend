const express = require('express');
const router = express.Router();
const materialController = require('./material.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createMaterialRequestSchema, quoteMaterialRequestSchema, updateStatusSchema } = require('./material.validation');
const Joi = require('joi');

const objectIdSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

router.use(auth); // Protect all routes

// Provider raises request
router.post(
  '/',
  validate({ body: createMaterialRequestSchema }),
  materialController.createRequest
);

// Provider views own requests
router.get(
  '/provider',
  materialController.getProviderRequests
);

// Supplier views requests
router.get(
  '/supplier',
  materialController.getSupplierRequests
);

// Supplier provides quote
router.put(
  '/:id/quote',
  validate({ params: objectIdSchema, body: quoteMaterialRequestSchema }),
  materialController.quoteRequest
);

// Update status (Accept, Fulfill, Reject)
router.put(
  '/:id/status',
  validate({ params: objectIdSchema, body: updateStatusSchema }),
  materialController.updateStatus
);

module.exports = router;
