const contentService = require('./content.service');
const { sendSuccess, sendError } = require('../../utils/response');

const createContent = async (req, res, next) => {
  try {
    const content = await contentService.createContent(req.body);
    sendSuccess(res, content, 'Content created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getContent = async (req, res, next) => {
  try {
    const isAdmin = req.auth && req.auth.accountType === 'ADMIN';
    const result = await contentService.getContent(req.query, isAdmin);
    sendSuccess(res, result, 'Content fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getContentBySlug = async (req, res, next) => {
  try {
    const content = await contentService.getContentBySlug(req.params.slug);
    if (!content) return sendError(res, 'Content not found', 'NOT_FOUND', 404);
    
    sendSuccess(res, content, 'Content fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateContent = async (req, res, next) => {
  try {
    const content = await contentService.updateContent(req.params.id, req.body);
    if (!content) return sendError(res, 'Content not found', 'NOT_FOUND', 404);
    
    sendSuccess(res, content, 'Content updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateContentStatus = async (req, res, next) => {
  try {
    const content = await contentService.updateContentStatus(req.params.id, req.body.isActive);
    sendSuccess(res, content, req.body.isActive ? 'Content activated successfully' : 'Content deactivated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteContent = async (req, res, next) => {
  try {
    const content = await contentService.deleteContent(req.params.id);
    if (!content) return sendError(res, 'Content not found', 'NOT_FOUND', 404);
    
    sendSuccess(res, content, 'Content deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getPages = async (req, res, next) => {
  try {
    sendSuccess(res, { data: [] }, 'Pages fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getSeo = async (req, res, next) => {
  try {
    sendSuccess(res, { data: [] }, 'SEO fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getFaqs = async (req, res, next) => {
  try {
    sendSuccess(res, { data: [] }, 'FAQs fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getPolicies = async (req, res, next) => {
  try {
    sendSuccess(res, { data: [] }, 'Policies fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContent,
  getContent,
  getContentBySlug,
  updateContent,
  updateContentStatus,
  deleteContent,
  getPages,
  getSeo,
  getFaqs,
  getPolicies
};
