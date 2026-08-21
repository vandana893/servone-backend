const catalogService = require('./catalog.service');
const { sendSuccess, sendError } = require('../../utils/response');

// ==========================================
// Categories
// ==========================================
const getCategories = async (req, res, next) => {
  try {
    const result = await catalogService.getCategories(req.query);
    sendSuccess(res, result, 'Categories fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await catalogService.getCategoryById(req.params.id);
    if (!category) return sendError(res, 'Category not found', 'NOT_FOUND', 404);
    
    sendSuccess(res, category, 'Category fetched successfully');
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await catalogService.createCategory(req.body);
    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await catalogService.updateCategory(req.params.id, req.body);
    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateCategoryStatus = async (req, res, next) => {
  try {
    const category = await catalogService.updateCategoryStatus(req.params.id, req.body.isActive);
    sendSuccess(res, category, `Category ${req.body.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const result = await catalogService.deleteCategory(req.params.id);
    sendSuccess(res, result, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Subcategories
// ==========================================
const getAllSubcategories = async (req, res, next) => {
  try {
    const result = await catalogService.getAllSubcategories(req.query);
    sendSuccess(res, result, 'All subcategories fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getSubcategories = async (req, res, next) => {
  try {
    const result = await catalogService.getSubcategories(req.params.id, req.query);
    sendSuccess(res, result, 'Subcategories fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getSubcategoryById = async (req, res, next) => {
  try {
    const subcategory = await catalogService.getSubcategoryById(req.params.id);
    if (!subcategory) return sendError(res, 'Subcategory not found', 'NOT_FOUND', 404);
    
    sendSuccess(res, subcategory, 'Subcategory fetched successfully');
  } catch (error) {
    next(error);
  }
};

const createSubcategory = async (req, res, next) => {
  try {
    const subcategory = await catalogService.createSubcategory(req.params.id, req.body);
    sendSuccess(res, subcategory, 'Subcategory created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateSubcategory = async (req, res, next) => {
  try {
    const subcategory = await catalogService.updateSubcategory(req.params.id, req.body);
    sendSuccess(res, subcategory, 'Subcategory updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateSubcategoryStatus = async (req, res, next) => {
  try {
    const subcategory = await catalogService.updateSubcategoryStatus(req.params.id, req.body.isActive);
    sendSuccess(res, subcategory, `Subcategory ${req.body.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

const deleteSubcategory = async (req, res, next) => {
  try {
    const result = await catalogService.deleteSubcategory(req.params.id);
    sendSuccess(res, result, 'Subcategory deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Services
// ==========================================
const getServices = async (req, res, next) => {
  try {
    const result = await catalogService.getServices(req.query);
    sendSuccess(res, result, 'Services fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const service = await catalogService.getServiceById(req.params.id);
    if (!service) return sendError(res, 'Service not found', 'NOT_FOUND', 404);
    
    sendSuccess(res, service, 'Service fetched successfully');
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const service = await catalogService.createService(req.body);
    sendSuccess(res, service, 'Service created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const service = await catalogService.updateService(req.params.id, req.body);
    sendSuccess(res, service, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateServiceStatus = async (req, res, next) => {
  try {
    const service = await catalogService.updateServiceStatus(req.params.id, req.body.isActive);
    sendSuccess(res, service, `Service ${req.body.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const result = await catalogService.deleteService(req.params.id);
    sendSuccess(res, result, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
  
  getAllSubcategories,
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  updateSubcategoryStatus,
  deleteSubcategory,
  
  getServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
  deleteService
};
