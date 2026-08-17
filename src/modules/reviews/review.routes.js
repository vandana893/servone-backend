const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createReviewSchema, queryReviewSchema } = require('./review.validation');
const { sendError } = require('../../utils/response');

const requireUser = (req, res, next) => {
  if (req.auth.accountType !== 'USER') {
    return sendError(res, 'Only authenticated users can leave a review', 'FORBIDDEN', 403);
  }
  next();
};

// Public route to view reviews
router.get('/', validate(queryReviewSchema), reviewController.getReviews);

// Protected routes
router.use(auth);
router.post('/', requireUser, validate(createReviewSchema), reviewController.createReview);

module.exports = router;
