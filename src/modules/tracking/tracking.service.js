const Tracking = require('./tracking.model');
const TrackingHistory = require('./trackingHistory.model');
const Booking = require('../bookings/booking.model');
const Partner = require('../partners/partner.model');

// Helper to throw formatted errors
const throwError = (message, statusCode = 500, code = 'INTERNAL_ERROR') => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  throw err;
};

// Helper to check ownership
const verifyAccess = async (bookingId, auth) => {
  const booking = await Booking.findById(bookingId).lean();
  if (!booking) {
    throwError('Booking not found', 404, 'NOT_FOUND');
  }

  if (auth.accountType === 'USER') {
    if (booking.userId.toString() !== auth.accountId.toString()) {
      throwError('You do not have permission to access this tracking', 403, 'FORBIDDEN');
    }
  }

  if (auth.accountType === 'PARTNER') {
    // Partner must be assigned to this booking
    if (booking.partnerId?.toString() !== auth.accountId.toString()) {
      throwError('You are not assigned to this booking', 403, 'FORBIDDEN');
    }

    // If booking has a workerId, verify the worker actually belongs to this Partner
    if (booking.workerId) {
      const partner = await Partner.findById(auth.accountId).lean();
      if (!partner) {
        throwError('Partner account not found', 404, 'NOT_FOUND');
      }
      const workerExists = partner.workers?.some(w => w._id.toString() === booking.workerId.toString());
      if (!workerExists) {
        throwError('Assigned worker does not belong to your partner account', 403, 'FORBIDDEN');
      }
    }
  }

  return booking;
};

const checkActiveBookingStatus = (status) => {
  const inactiveStatuses = ['COMPLETED', 'CANCELLED', 'REJECTED'];
  if (inactiveStatuses.includes(status)) {
    throwError('Booking is not in a valid state for tracking', 409, 'CONFLICT');
  }
};

const startTracking = async (bookingId, auth) => {
  const booking = await verifyAccess(bookingId, auth);

  if (auth.accountType !== 'PARTNER') {
    throwError('Only assigned partners can start tracking', 403, 'FORBIDDEN');
  }

  checkActiveBookingStatus(booking.status);

  let tracking = await Tracking.findOne({ bookingId });
  
  if (tracking) {
    if (tracking.isLive) {
      throwError('Tracking is already active', 409, 'CONFLICT');
    }
    if (tracking.trackingStatus === 'STOPPED') {
      throwError('Cannot restart a stopped tracking session', 409, 'CONFLICT');
    }
    // Any other state should logically not be startable again without being live,
    // but just to be strict:
    throwError('Tracking session already exists and cannot be restarted', 409, 'CONFLICT');
  }

  try {
    tracking = await Tracking.create({
      bookingId,
      partnerId: booking.partnerId,
      workerId: booking.workerId,
      trackingStatus: 'EN_ROUTE',
      isLive: true,
      lastLocationUpdate: new Date()
    });
  } catch (err) {
    if (err.code === 11000) {
      throwError('Tracking session already exists', 409, 'CONFLICT');
    }
    throw err;
  }

  return tracking;
};

const updateLocation = async (bookingId, locationData, auth) => {
  const booking = await verifyAccess(bookingId, auth);

  if (auth.accountType !== 'PARTNER') {
    throwError('Only assigned partners can update location', 403, 'FORBIDDEN');
  }

  checkActiveBookingStatus(booking.status);

  const tracking = await Tracking.findOne({ bookingId });
  if (!tracking) {
    throwError('Tracking session not started', 404, 'NOT_FOUND');
  }
  
  if (!tracking.isLive || tracking.trackingStatus === 'STOPPED') {
    throwError('Tracking session is not active', 409, 'CONFLICT');
  }

  tracking.currentLocation = {
    type: 'Point',
    coordinates: [locationData.longitude, locationData.latitude] // GeoJSON [lng, lat]
  };
  tracking.heading = locationData.heading;
  tracking.speed = locationData.speed;
  tracking.accuracy = locationData.accuracy;
  tracking.lastLocationUpdate = new Date();

  await tracking.save();

  // Create history using backend-derived IDs
  await TrackingHistory.create({
    bookingId: booking._id,
    partnerId: booking.partnerId,
    workerId: booking.workerId,
    location: tracking.currentLocation,
    heading: tracking.heading,
    speed: tracking.speed,
    accuracy: tracking.accuracy,
    recordedAt: tracking.lastLocationUpdate
  });

  return tracking;
};

const getCurrentTracking = async (bookingId, auth) => {
  if (auth.accountType !== 'ADMIN') {
    await verifyAccess(bookingId, auth);
  }

  const tracking = await Tracking.findOne({ bookingId }).lean();
  if (!tracking) {
    throwError('Tracking not found for this booking', 404, 'NOT_FOUND');
  }

  return tracking;
};

const getTrackingHistory = async (bookingId, auth, page, limit) => {
  if (auth.accountType !== 'ADMIN') {
    await verifyAccess(bookingId, auth);
  }

  const skip = (page - 1) * limit;
  const history = await TrackingHistory.find({ bookingId })
    .sort({ recordedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await TrackingHistory.countDocuments({ bookingId });

  return {
    history,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

const stopTracking = async (bookingId, auth) => {
  if (auth.accountType !== 'ADMIN') {
    await verifyAccess(bookingId, auth);
    if (auth.accountType !== 'PARTNER') {
      throwError('Only assigned partners or admins can stop tracking', 403, 'FORBIDDEN');
    }
  }

  const tracking = await Tracking.findOne({ bookingId });
  if (!tracking) {
    throwError('Tracking not found', 404, 'NOT_FOUND');
  }

  if (tracking.trackingStatus === 'STOPPED' || !tracking.isLive) {
    throwError('Tracking is already stopped', 409, 'CONFLICT');
  }

  tracking.trackingStatus = 'STOPPED';
  tracking.isLive = false;
  
  await tracking.save();
  return tracking;
};

module.exports = {
  startTracking,
  updateLocation,
  getCurrentTracking,
  getTrackingHistory,
  stopTracking
};
