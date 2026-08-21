const express = require('express');
const router = express.Router();
const catalogController = require('./catalog.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const { 
  idSchema, 
  categoryQuerySchema, 
  createCategorySchema,
  updateCategorySchema,
  categoryStatusSchema,
  createSubcategorySchema,
  updateSubcategorySchema,
  subcategoryStatusSchema,
  serviceQuerySchema,
  createServiceSchema,
  updateServiceSchema,
  serviceStatusSchema
} = require('./catalog.validation');

// ==========================================
// Categories
// ==========================================
// Public/User/Partner access
router.get('/categories', validate(categoryQuerySchema), catalogController.getCategories);
router.get('/categories/:id', validate(idSchema), catalogController.getCategoryById);

// Admin only mutations
router.post('/categories', auth, authorize('SuperAdmin', 'Manager'), validate(createCategorySchema), catalogController.createCategory);
router.put('/categories/:id', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), validate(updateCategorySchema), catalogController.updateCategory);
router.patch('/categories/:id/status', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), validate(categoryStatusSchema), catalogController.updateCategoryStatus);
router.delete('/categories/:id', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), catalogController.deleteCategory);

// ==========================================
// Subcategories
// ==========================================
// Public/User/Partner access
router.get('/subcategories', validate(categoryQuerySchema), catalogController.getAllSubcategories);
router.get('/categories/:id/subcategories', validate(idSchema), validate(categoryQuerySchema), catalogController.getSubcategories);
router.get('/subcategories/:id', validate(idSchema), catalogController.getSubcategoryById);

// Admin only mutations
router.post('/categories/:id/subcategories', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), validate(createSubcategorySchema), catalogController.createSubcategory);
router.put('/subcategories/:id', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), validate(updateSubcategorySchema), catalogController.updateSubcategory);
router.patch('/subcategories/:id/status', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), validate(subcategoryStatusSchema), catalogController.updateSubcategoryStatus);
router.delete('/subcategories/:id', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), catalogController.deleteSubcategory);

// ==========================================
// Services
// ==========================================
// Public/User/Partner access
router.get('/services', validate(serviceQuerySchema), catalogController.getServices);
router.get('/services/:id', validate(idSchema), catalogController.getServiceById);

// Admin only mutations
router.post('/services', auth, authorize('SuperAdmin', 'Manager'), validate(createServiceSchema), catalogController.createService);
router.put('/services/:id', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), validate(updateServiceSchema), catalogController.updateService);
router.patch('/services/:id/status', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), validate(serviceStatusSchema), catalogController.updateServiceStatus);
router.delete('/services/:id', auth, authorize('SuperAdmin', 'Manager'), validate(idSchema), catalogController.deleteService);

module.exports = router;
