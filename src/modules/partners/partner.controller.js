const partnerService = require('./partner.service');
const { sendSuccess } = require('../../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const partner = await partnerService.getPartnerById(req.auth.accountId);
    sendSuccess(res, partner, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const partner = await partnerService.updatePartnerProfile(req.auth.accountId, req.body);
    sendSuccess(res, partner, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// BSP Workers
const addWorker = async (req, res, next) => {
  try {
    const workers = await partnerService.addWorker(req.auth.accountId, req.body);
    sendSuccess(res, workers, 'Worker added successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateWorker = async (req, res, next) => {
  try {
    const workers = await partnerService.updateWorker(req.auth.accountId, req.params.workerId, req.body);
    sendSuccess(res, workers, 'Worker updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteWorker = async (req, res, next) => {
  try {
    const workers = await partnerService.deleteWorker(req.auth.accountId, req.params.workerId);
    sendSuccess(res, workers, 'Worker deleted successfully');
  } catch (error) {
    next(error);
  }
};

const submitKyc = async (req, res, next) => {
  try {
    const partner = await partnerService.submitKyc(req.auth.accountId, req.body);
    sendSuccess(res, partner, 'KYC details submitted successfully');
  } catch (error) {
    next(error);
  }
};

const verifyKyc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const partner = await partnerService.verifyKyc(id, status, notes);
    sendSuccess(res, partner, `KYC status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addWorker,
  updateWorker,
  deleteWorker,
  submitKyc,
  verifyKyc
};
