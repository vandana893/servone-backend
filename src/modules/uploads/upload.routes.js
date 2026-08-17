const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');
const auth = require('../../middlewares/auth');
const { uploadImage, uploadDocument } = require('../../utils/upload');

// Both endpoints are protected to prevent anonymous spam uploads
router.use(auth);

// 'file' is the key expected in the multipart/form-data request
router.post('/image', uploadImage.single('file'), uploadController.uploadImage);
router.post('/document', uploadDocument.single('file'), uploadController.uploadDocument);

module.exports = router;
