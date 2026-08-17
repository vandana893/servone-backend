const materialService = require('./material.service');
const { sendSuccess } = require('../../utils/response');

const createRequest = async (req, res, next) => {
  try {
    const { accountId, partnerType } = req.auth;
    if (partnerType !== 'ISP' && partnerType !== 'BSP') {
      return res.status(403).json({ success: false, message: 'Only ISP or BSP can raise a material request' });
    }
    
    const request = await materialService.createRequest(accountId, req.body);
    return sendSuccess(res, request, 'Material request created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getProviderRequests = async (req, res, next) => {
  try {
    const { accountId } = req.auth;
    const requests = await materialService.getProviderRequests(accountId);
    return sendSuccess(res, requests, 'Provider material requests retrieved');
  } catch (error) {
    next(error);
  }
};

const getSupplierRequests = async (req, res, next) => {
  try {
    const { accountId, partnerType } = req.auth;
    if (partnerType !== 'BS') {
      return res.status(403).json({ success: false, message: 'Only BS (Business Supplier) can view these requests' });
    }
    const requests = await materialService.getSupplierRequests(accountId);
    return sendSuccess(res, requests, 'Supplier material requests retrieved');
  } catch (error) {
    next(error);
  }
};

const quoteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountId, partnerType } = req.auth;
    if (partnerType !== 'BS') {
      return res.status(403).json({ success: false, message: 'Only BS can quote a material request' });
    }
    
    const request = await materialService.quoteRequest(id, accountId, req.body.items);
    return sendSuccess(res, request, 'Quote submitted successfully');
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    const request = await materialService.updateStatus(id, status, rejectionReason);
    return sendSuccess(res, request, `Material request status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getProviderRequests,
  getSupplierRequests,
  quoteRequest,
  updateStatus
};
