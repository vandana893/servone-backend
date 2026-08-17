const aiService = require('./ai.service');
const { sendSuccess } = require('../../utils/response');

const chatIntent = async (req, res, next) => {
  try {
    const { message } = req.body;
    const result = await aiService.resolveIntent(message);
    return sendSuccess(res, result, 'AI response generated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatIntent
};
