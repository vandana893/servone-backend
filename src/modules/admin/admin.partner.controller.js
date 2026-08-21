const partnerService = require('../partners/partner.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getPartners = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, verificationStatus, partnerType, search } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (partnerType) query.partnerType = partnerType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const partners = await partnerService.getAllPartners(query, pageNum, limitNum);
    sendSuccess(res, partners, 'Partners retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getPartnerById = async (req, res, next) => {
  try {
    const partner = await partnerService.getPartnerById(req.params.id);
    if (!partner) return sendError(res, 'Partner not found', 'NOT_FOUND', 404);
    sendSuccess(res, partner, 'Partner retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updatePartnerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const partner = await partnerService.updatePartnerStatus(req.params.id, status);
    sendSuccess(res, partner, `Partner status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

const verifyPartnerKyc = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const partner = await partnerService.verifyKyc(req.params.id, status, notes);
    sendSuccess(res, partner, `Partner KYC verification updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

const getWorkers = async (req, res, next) => {
  try {
    const partner = await partnerService.getPartnerById(req.params.id);
    if (!partner) return sendError(res, 'Partner not found', 'NOT_FOUND', 404);
    sendSuccess(res, partner.workers || [], 'Workers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const addWorker = async (req, res, next) => {
  try {
    const workers = await partnerService.addWorker(req.params.id, req.body);
    sendSuccess(res, workers, 'Worker added successfully');
  } catch (error) {
    next(error);
  }
};

const updateWorker = async (req, res, next) => {
  try {
    const workers = await partnerService.updateWorker(req.params.id, req.params.workerId, req.body);
    sendSuccess(res, workers, 'Worker updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteWorker = async (req, res, next) => {
  try {
    const workers = await partnerService.deleteWorker(req.params.id, req.params.workerId);
    sendSuccess(res, workers, 'Worker deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getPartnerStats = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, { total: 0, active: 0, newThisMonth: 0 }, 'Partner stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getAllWorkers = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, [], 'All workers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getWorkerComplaints = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, [], 'Worker complaints retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getWorkerAvailability = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, [], 'Worker availability retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getWorkerAssignments = async (req, res, next) => {
  try {
    // Stub implementation
    sendSuccess(res, [], 'Worker assignments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPartners,
  getPartnerById,
  updatePartnerStatus,
  verifyPartnerKyc,
  getWorkers,
  addWorker,
  updateWorker,
  deleteWorker,
  getPartnerStats,
  getAllWorkers,
  getWorkerComplaints,
  getWorkerAvailability,
  getWorkerAssignments
};
