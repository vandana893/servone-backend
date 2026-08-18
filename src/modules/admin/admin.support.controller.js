const supportService = require('../support/support.service');
const { sendSuccess, sendError } = require('../../utils/response');

const assignTicket = async (req, res, next) => {
  try {
    const { adminId } = req.body;
    // Default to self if not provided
    const assignedId = adminId || req.auth.accountId;
    const ticket = await supportService.assignTicket(req.params.id, assignedId);
    sendSuccess(res, ticket, 'Ticket assigned successfully');
  } catch (error) {
    next(error);
  }
};

const resolveTicket = async (req, res, next) => {
  try {
    const { resolutionNote } = req.body;
    const ticket = await supportService.updateStatus(req.params.id, 'Resolved', resolutionNote);
    sendSuccess(res, ticket, 'Ticket resolved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assignTicket,
  resolveTicket
};
