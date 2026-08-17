const supportService = require('./support.service');
const { sendSuccess } = require('../../utils/response');

const getModelFromAccountType = (accountType) => {
  if (accountType === 'USER') return 'User';
  if (accountType === 'PARTNER') return 'Partner';
  if (accountType === 'ADMIN') return 'Admin';
  return null;
};

const createTicket = async (req, res, next) => {
  try {
    const creatorModel = getModelFromAccountType(req.auth.accountType);
    const ticket = await supportService.createTicket(req.auth.accountId, creatorModel, req.body);
    sendSuccess(res, ticket, 'Ticket created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const query = { ...req.query };
    
    // Scoping based on role
    if (req.auth.accountType !== 'ADMIN') {
      query.creatorId = req.auth.accountId;
      query.creatorModel = getModelFromAccountType(req.auth.accountType);
    }

    const result = await supportService.getTickets(query);
    sendSuccess(res, result, 'Tickets fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await supportService.getTicketById(
      req.params.id,
      req.auth.accountId,
      req.auth.accountType
    );
    sendSuccess(res, ticket, 'Ticket fetched successfully');
  } catch (error) {
    next(error);
  }
};

const addMessage = async (req, res, next) => {
  try {
    const senderModel = getModelFromAccountType(req.auth.accountType);
    const ticket = await supportService.addMessage(
      req.params.id,
      req.auth.accountId,
      senderModel,
      req.auth.accountType,
      req.body
    );
    sendSuccess(res, ticket, 'Message added successfully');
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;
    const ticket = await supportService.updateStatus(req.params.id, status, resolutionNote);
    sendSuccess(res, ticket, 'Ticket status updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
  updateStatus
};
