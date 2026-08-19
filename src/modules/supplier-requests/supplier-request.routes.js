const express = require('express');
const router = express.Router();
const supplierRequestController = require('./supplier-request.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');

router.use(auth);
router.use(authorize('SuperAdmin', 'Manager'));

router.get('/', supplierRequestController.getSupplierRequests);
router.get('/:id', supplierRequestController.getSupplierRequestById);

module.exports = router;
