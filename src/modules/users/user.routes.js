const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { updateProfileSchema, addressSchema } = require('./user.validation');

// All user routes require authentication
router.use(auth);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

// Address routes
router.get('/addresses', userController.getAddresses);
router.post('/addresses', validate(addressSchema), userController.addAddress);
router.put('/addresses/:addressId', validate(addressSchema), userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

module.exports = router;
