const MaterialRequest = require('./material.model');
const Booking = require('../bookings/booking.model');

const createRequest = async (providerId, payload) => {
  const booking = await Booking.findById(payload.bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  const request = new MaterialRequest({
    bookingId: payload.bookingId,
    requestedBy: providerId,
    items: payload.items,
    urgency: payload.urgency || 'NORMAL',
    notes: payload.notes
  });

  await request.save();

  // Link to booking
  booking.materialRequestId = request._id;
  await booking.save();

  return request;
};

const getProviderRequests = async (providerId) => {
  return await MaterialRequest.find({ requestedBy: providerId }).sort({ createdAt: -1 });
};

const getSupplierRequests = async (supplierId) => {
  // Returns requests explicitly assigned to this supplier, or all PENDING ones if building an open marketplace
  return await MaterialRequest.find({
    $or: [{ supplierId: supplierId }, { status: 'PENDING' }]
  }).sort({ createdAt: -1 });
};

const quoteRequest = async (requestId, supplierId, items) => {
  const request = await MaterialRequest.findById(requestId);
  if (!request) {
    const error = new Error('Material request not found');
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== 'PENDING') {
    const error = new Error('Can only quote on PENDING requests');
    error.statusCode = 400;
    throw error;
  }

  // Update item prices
  items.forEach(quoteItem => {
    const item = request.items.find(i => i.name === quoteItem.name);
    if (item) item.priceQuote = quoteItem.priceQuote;
  });

  request.supplierId = supplierId;
  request.status = 'QUOTED';
  await request.save();

  return request;
};

const updateStatus = async (requestId, status, rejectionReason) => {
  const request = await MaterialRequest.findById(requestId);
  if (!request) {
    const error = new Error('Material request not found');
    error.statusCode = 404;
    throw error;
  }

  request.status = status;
  if (rejectionReason) request.rejectionReason = rejectionReason;
  
  await request.save();
  return request;
};

module.exports = {
  createRequest,
  getProviderRequests,
  getSupplierRequests,
  quoteRequest,
  updateStatus
};
