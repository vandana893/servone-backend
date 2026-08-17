const mongoose = require('mongoose');
const Review = require('./review.model');
const Service = require('../catalog/service.model');
const Partner = require('../partners/partner.model');
const Booking = require('../bookings/booking.model');

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const createReview = async (userId, data) => {
  const { bookingId, targetId, targetModel } = data;

  // 1. Verify Booking
  const booking = await Booking.findById(bookingId);
  if (!booking) throwError('Booking not found', 404);
  
  if (booking.userId.toString() !== userId.toString()) {
    throwError('You are not authorized to review this booking', 403);
  }

  if (booking.status !== 'COMPLETED') {
    throwError('You can only review completed bookings', 400);
  }

  // 2. Verify Target matches Booking
  if (targetModel === 'Service' && booking.serviceId.toString() !== targetId.toString()) {
    throwError('This service is not associated with the booking', 403);
  }
  
  if (targetModel === 'Partner' && booking.partnerId?.toString() !== targetId.toString()) {
    throwError('This partner is not associated with the booking', 403);
  }

  // 3. Duplicate check before DB index crash
  const existingReview = await Review.findOne({ userId, bookingId, targetId });
  if (existingReview) {
    throwError('You have already reviewed this service/partner for this booking.', 409);
  }

  // 4. Create Review
  const review = new Review({
    ...data,
    userId
  });

  await review.save();

  // 5. Update target statistics safely
  try {
    const Model = targetModel === 'Service' ? Service : Partner;
    
    const stats = await Review.aggregate([
      { $match: { targetId: new mongoose.Types.ObjectId(targetId), targetModel, isApproved: true } },
      { $group: { _id: '$targetId', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      const averageRating = Math.round(stats[0].avgRating * 10) / 10;
      const totalReviews = stats[0].numReviews;

      if (targetModel === 'Service') {
        await Model.findByIdAndUpdate(targetId, { averageRating, totalReviews });
      } else {
        await Model.findByIdAndUpdate(targetId, { rating: averageRating, reviewCount: totalReviews });
      }
    }
  } catch (error) {
    console.error('Failed to update target statistics:', error);
  }

  return review;
};

const getReviews = async (query) => {
  const { targetId, targetModel, page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const filter = { targetId, targetModel, isApproved: true };

  const [data, total] = await Promise.all([
    Review.find(filter)
      .populate('userId', 'name photo')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Review.countDocuments(filter)
  ]);

  return { data, total, page, limit };
};

module.exports = {
  createReview,
  getReviews
};
