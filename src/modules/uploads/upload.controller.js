const { sendSuccess, sendError } = require('../../utils/response');
const { uploadToCloudinary } = require('../../utils/upload');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 'BAD_REQUEST', 400);
    }

    // Upload buffer to Cloudinary in 'servone/images' folder
    const result = await uploadToCloudinary(req.file.buffer, 'servone/images');

    return sendSuccess(res, {
      url: result.secure_url,
      publicId: result.public_id
    }, 'Image uploaded successfully', 201);
  } catch (error) {
    if (error.name === 'Error' || error.message) {
      return sendError(res, error.message, 'UPLOAD_FAILED', 500);
    }
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No document file provided', 'BAD_REQUEST', 400);
    }

    // Upload buffer to Cloudinary in 'servone/documents' folder
    const result = await uploadToCloudinary(req.file.buffer, 'servone/documents');

    return sendSuccess(res, {
      url: result.secure_url,
      publicId: result.public_id
    }, 'Document uploaded successfully', 201);
  } catch (error) {
    if (error.name === 'Error' || error.message) {
      return sendError(res, error.message, 'UPLOAD_FAILED', 500);
    }
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadDocument
};
