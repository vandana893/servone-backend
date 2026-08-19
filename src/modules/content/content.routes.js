const express = require('express');
const router = express.Router();
const contentController = require('./content.controller');
const auth = require('../../middlewares/auth');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { idSchema, createContentSchema, updateContentSchema, contentStatusSchema, queryContentSchema } = require('./content.validation');

// Optional auth for public routes to allow admin overrides
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) {
    return auth(req, res, next);
  }
  next();
};

// Public routes
router.get('/', optionalAuth, validate(queryContentSchema), contentController.getContent);
router.get('/pages', optionalAuth, contentController.getPages);
router.get('/seo', optionalAuth, contentController.getSeo);
router.get('/faqs', optionalAuth, contentController.getFaqs);
router.get('/policies', optionalAuth, contentController.getPolicies);
router.get('/slug/:slug', contentController.getContentBySlug);

// Admin only routes
router.use(auth);
router.use(authorize('SuperAdmin', 'Manager'));

router.post('/', validate(createContentSchema), contentController.createContent);
router.put('/:id', validate(idSchema), validate(updateContentSchema), contentController.updateContent);
router.patch('/:id/status', validate(idSchema), validate(contentStatusSchema), contentController.updateContentStatus);
router.delete('/:id', validate(idSchema), contentController.deleteContent);

module.exports = router;
