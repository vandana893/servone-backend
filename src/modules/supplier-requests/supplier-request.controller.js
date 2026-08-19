const { sendSuccess } = require('../../utils/response');

const getSupplierRequests = async (req, res, next) => {
  try {
    return sendSuccess(res, { data: [] }, 'Supplier requests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getSupplierRequestById = async (req, res, next) => {
  try {
    return sendSuccess(res, { data: null }, 'Supplier request retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupplierRequests,
  getSupplierRequestById
};
