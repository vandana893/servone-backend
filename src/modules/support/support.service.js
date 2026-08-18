const SupportTicket = require('./support.model');
const Booking = require('../bookings/booking.model');
const Transaction = require('../finance/finance.model');

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const createTicket = async (creatorId, creatorModel, data) => {
  // Validate Booking if provided
  if (data.bookingId) {
    const booking = await Booking.findById(data.bookingId);
    if (!booking) throwError('Booking not found', 404);
    
    if (creatorModel === 'User' && booking.userId.toString() !== creatorId.toString()) {
      throwError('You are not authorized to reference this booking', 403);
    }
    if (creatorModel === 'Partner' && booking.partnerId?.toString() !== creatorId.toString()) {
      throwError('You are not authorized to reference this booking', 403);
    }
  }

  // Validate Transaction if provided
  if (data.transactionId) {
    const transaction = await Transaction.findById(data.transactionId);
    if (!transaction) throwError('Transaction not found', 404);
    
    if (creatorModel === 'User' && transaction.userId?.toString() !== creatorId.toString()) {
      throwError('You are not authorized to reference this transaction', 403);
    }
    if (creatorModel === 'Partner' && transaction.partnerId?.toString() !== creatorId.toString()) {
      throwError('You are not authorized to reference this transaction', 403);
    }
  }

  const ticket = new SupportTicket({
    ...data,
    creatorId,
    creatorModel
  });
  await ticket.save();
  return ticket;
};

const getTickets = async (query) => {
  const { creatorId, creatorModel, status, type, priority, page = 1, limit = 20 } = query;
  
  const filter = {};
  if (creatorId) {
    filter.creatorId = creatorId;
    filter.creatorModel = creatorModel; // Must always pair these for non-admin
  }
  
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    SupportTicket.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    SupportTicket.countDocuments(filter)
  ]);
  
  return { data, total, page, limit };
};

const getTicketById = async (ticketId, callerId, callerAccountType) => {
  const ticket = await SupportTicket.findById(ticketId).populate('creatorId', 'name phone email');
  if (!ticket) throwError('Ticket not found', 404);

  // Authorization Check
  if (callerAccountType !== 'ADMIN') {
    const expectedModel = callerAccountType === 'USER' ? 'User' : 'Partner';
    
    if (ticket.creatorModel !== expectedModel || ticket.creatorId._id.toString() !== callerId.toString()) {
      throwError('Ticket not found', 404); // Shield existence of other tickets
    }
  }

  return ticket;
};

const addMessage = async (ticketId, senderId, senderModel, callerAccountType, messageData) => {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throwError('Ticket not found', 404);

  // Authorization Check
  if (callerAccountType !== 'ADMIN') {
    if (ticket.creatorModel !== senderModel || ticket.creatorId.toString() !== senderId.toString()) {
      throwError('Ticket not found', 404);
    }
  }

  ticket.messages.push({
    senderId,
    senderModel,
    ...messageData
  });

  await ticket.save();
  return ticket;
};

const updateStatus = async (ticketId, status, resolutionNote) => {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throwError('Ticket not found', 404);

  // Status transitions
  const invalidTransitions = {
    'Closed': ['Open', 'In Progress', 'Resolved'],
    'Resolved': ['Open', 'In Progress']
  };

  if (invalidTransitions[ticket.status]?.includes(status)) {
    throwError(`Cannot transition ticket from ${ticket.status} to ${status}`, 400);
  }

  ticket.status = status;
  if (resolutionNote) {
    ticket.resolutionNote = resolutionNote;
  }

  await ticket.save();
  return ticket;
};

const assignTicket = async (ticketId, adminId) => {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throwError('Ticket not found', 404);

  ticket.assignedAdminId = adminId;
  if (ticket.status === 'Open') {
    ticket.status = 'In Progress';
  }

  await ticket.save();
  return ticket;
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
  updateStatus,
  assignTicket
};
