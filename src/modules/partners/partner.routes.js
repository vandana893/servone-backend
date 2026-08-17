const express = require('express');
const router = express.Router();
const partnerController = require('./partner.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { updatePartnerProfileSchema, addWorkerSchema, updateWorkerSchema, workerIdSchema, submitKycSchema, verifyKycSchema } = require('./partner.validation');
const { sendError } = require('../../utils/response');
const authorize = require('../../middlewares/authorize');
const auditLogger = require('../../middlewares/auditLogger');

const requirePartner = (req, res, next) => {
  if (req.auth.accountType !== 'PARTNER') {
    return sendError(res, 'You do not have permission to access partner resources', 'FORBIDDEN', 403);
  }
  next();
};

router.use(auth);
router.use(requirePartner);

// Profile routes (ISP, BSP, BS)
router.get('/profile', partnerController.getProfile);
router.put('/profile', validate(updatePartnerProfileSchema), partnerController.updateProfile);

// Worker routes (BSP only)
router.post('/workers', validate(addWorkerSchema), partnerController.addWorker);
router.put('/workers/:workerId', validate(workerIdSchema), validate(updateWorkerSchema), partnerController.updateWorker);
router.delete('/workers/:workerId', validate(workerIdSchema), partnerController.deleteWorker);

// KYC
router.put('/me/kyc', validate(submitKycSchema), partnerController.submitKyc);

// Admin KYC verify
router.put('/admin/:id/kyc-verify', authorize('SuperAdmin', 'Manager'), auditLogger('VERIFY_KYC', 'Partner'), validate(verifyKycSchema), partnerController.verifyKyc);

module.exports = router;
