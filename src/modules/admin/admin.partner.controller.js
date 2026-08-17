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

module.exports = {
  getPartners,
  getPartnerById,
  updatePartnerStatus,
  verifyPartnerKyc
};
