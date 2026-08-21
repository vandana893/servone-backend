const Booking = require('./booking.model');
const Partner = require('../partners/partner.model');
const Service = require('../catalog/service.model');

// Helper for auth model name
const getModelName = (accountType) => {
  if (accountType === 'USER') return 'User';
  if (accountType === 'PARTNER') return 'Partner';
  if (accountType === 'ADMIN') return 'Admin';
  return 'User';
};

const createBooking = async (userId, bookingData, auth) => {
  if (bookingData.address && bookingData.address.longitude && bookingData.address.latitude) {
    bookingData.address.location = {
      type: 'Point',
      coordinates: [bookingData.address.longitude, bookingData.address.latitude]
    };
  }

  const booking = new Booking({
    ...bookingData,
    userId,
    status: 'PENDING',
    paymentStatus: 'PENDING'
  });

  booking.timeline.push({
    status: 'PENDING',
    note: 'Booking created',
    updatedBy: auth.accountId,
    updatedByModel: getModelName(auth.accountType)
  });

  await booking.save();
  return booking;
};

const getBookings = async (query, auth) => {
  const { status, page = 1, limit = 20 } = query;
  const filter = {};

  if (auth.accountType === 'USER') {
    filter.userId = auth.accountId;
  } else if (auth.accountType === 'PARTNER') {
    const partner = await Partner.findById(auth.accountId);
    if (partner && partner.services && partner.services.length > 0) {
      filter.$or = [
        { partnerId: auth.accountId },
        { status: 'PENDING', serviceId: { $in: partner.services } }
      ];
    } else {
      filter.partnerId = auth.accountId;
    }
  }
  
  if (status) filter.status = status;
  
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Booking.find(filter)
      .populate('serviceId', 'name')
      .populate('userId', 'name phone')
      .populate('partnerId', 'name businessName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Booking.countDocuments(filter)
  ]);
  
  return { data, total, page, limit };
};

const getBookingById = async (bookingId, auth) => {
  const booking = await Booking.findById(bookingId)
    .populate('serviceId', 'name description pricingModel')
    .populate('userId', 'name phone email')
    .populate('partnerId', 'name businessName phone');
    
  if (!booking) return null;

  const isOwner = auth.accountType === 'USER' && booking.userId._id.toString() === auth.accountId.toString();
  const isAssigned = auth.accountType === 'PARTNER' && booking.partnerId && booking.partnerId._id.toString() === auth.accountId.toString();
  const isAdmin = auth.accountType === 'ADMIN';
  let isPendingPartner = false;
  if (auth.accountType === 'PARTNER' && booking.status === 'PENDING') {
    const partner = await Partner.findById(auth.accountId);
    if (partner && partner.services && partner.services.length > 0 && partner.services.includes(booking.serviceId)) {
      isPendingPartner = true;
    }
  }

  if (!isOwner && !isAssigned && !isAdmin && !isPendingPartner) {
    return null; // Access denied
  }

  return booking;
};

const getTimeline = async (bookingId, auth) => {
  const booking = await getBookingById(bookingId, auth);
  if (!booking) throw new Error('Booking not found or access denied');
  return booking.timeline;
};

// Valid transitions dictionary
const validTransitions = {
  'PENDING': ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  'ACCEPTED': ['ASSIGNED', 'EN_ROUTE', 'CANCELLED'],
  'ASSIGNED': ['EN_ROUTE', 'CANCELLED'],
  'EN_ROUTE': ['IN_PROGRESS', 'CANCELLED'],
  'IN_PROGRESS': ['COMPLETED', 'CANCELLED', 'RESCHEDULE_REQUESTED', 'QUOTE_REQUIRED'],
  'QUOTE_REQUIRED': ['IN_PROGRESS', 'CANCELLED'],
  'RESCHEDULE_REQUESTED': ['ACCEPTED', 'ASSIGNED', 'CANCELLED'],
  'COMPLETED': [],
  'CANCELLED': [],
  'REJECTED': []
};

const updateBookingStatus = async (bookingId, updateData, auth) => {
  const booking = await getBookingById(bookingId, auth);
  if (!booking) throw new Error('Booking not found or access denied');

  const { status, note } = updateData;

  if (auth.accountType !== 'ADMIN') {
    if (auth.accountType === 'USER') throw new Error('Users cannot arbitrarily change status');
    if (auth.accountType === 'PARTNER') {
      if (booking.partnerId && booking.partnerId._id.toString() !== auth.accountId.toString()) {
        throw new Error('Not authorized to update this booking');
      }
      if (auth.partnerType === 'ISP' && !['EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        throw new Error('ISPs can only set operational statuses: EN_ROUTE, IN_PROGRESS, COMPLETED');
      }
    }
  }

  // Check valid transition strictly for all actors, including ADMIN
  const adminValidTransitions = {
    ...validTransitions,
    'PENDING': ['ACCEPTED', 'REJECTED', 'CANCELLED', 'ASSIGNED'], // Admin might jump straight to assigned
    'ACCEPTED': ['ASSIGNED', 'EN_ROUTE', 'CANCELLED', 'IN_PROGRESS'], 
  };

  const allowedTransitions = auth.accountType === 'ADMIN' ? adminValidTransitions : validTransitions;

  if (!allowedTransitions[booking.status] || !allowedTransitions[booking.status].includes(status)) {
    throw new Error(`Invalid status transition from ${booking.status} to ${status}`);
  }

  booking.status = status;
  booking.timeline.push({
    status,
    note: note || `Status updated to ${status}`,
    updatedBy: auth.accountId,
    updatedByModel: getModelName(auth.accountType)
  });

  await booking.save();
  return booking;
};

const cancelBooking = async (bookingId, reason, auth) => {
  const booking = await getBookingById(bookingId, auth);
  if (!booking) throw new Error('Booking not found or access denied');

  if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
    throw new Error(`Cannot cancel a booking that is ${booking.status}`);
  }

  if (auth.accountType === 'PARTNER' && (!booking.partnerId || booking.partnerId._id.toString() !== auth.accountId.toString())) {
    throw new Error('Partners can only cancel their explicitly assigned bookings');
  }

  booking.status = 'CANCELLED';
  booking.cancellationReason = reason;
  
  booking.timeline.push({
    status: 'CANCELLED',
    note: `Cancelled: ${reason}`,
    updatedBy: auth.accountId,
    updatedByModel: getModelName(auth.accountType)
  });

  await booking.save();
  return booking;
};

const rescheduleBooking = async (bookingId, data, auth) => {
  const booking = await getBookingById(bookingId, auth);
  if (!booking) throw new Error('Booking not found or access denied');

  if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
    throw new Error('Cannot reschedule completed or cancelled booking');
  }

  if (auth.accountType === 'PARTNER' && (!booking.partnerId || booking.partnerId._id.toString() !== auth.accountId.toString())) {
    throw new Error('Partners can only reschedule their explicitly assigned bookings');
  }

  const { scheduledDate, scheduledTimeSlot, reason } = data;
  
  booking.scheduledDate = scheduledDate;
  booking.scheduledTimeSlot = scheduledTimeSlot;
  
  if (auth.accountType === 'USER') {
     booking.status = 'RESCHEDULE_REQUESTED';
  }

  booking.timeline.push({
    status: booking.status,
    note: `Rescheduled to ${scheduledDate} ${scheduledTimeSlot}. Reason: ${reason}`,
    updatedBy: auth.accountId,
    updatedByModel: getModelName(auth.accountType)
  });

  await booking.save();
  return booking;
};

const rebookBooking = async (bookingId, auth) => {
  const oldBooking = await Booking.findById(bookingId);
  if (!oldBooking) throw new Error('Original booking not found');

  if (oldBooking.userId.toString() !== auth.accountId.toString() && auth.accountType !== 'ADMIN') {
    throw new Error('Access denied');
  }

  if (oldBooking.status !== 'COMPLETED' && oldBooking.status !== 'CANCELLED') {
    throw new Error('Only completed or cancelled bookings can be rebooked');
  }

  const service = await Service.findById(oldBooking.serviceId);
  if (!service) throw new Error('Service no longer exists');

  const newBooking = new Booking({
    userId: oldBooking.userId,
    categoryId: oldBooking.categoryId,
    serviceId: oldBooking.serviceId,
    serviceVariant: oldBooking.serviceVariant,
    problemDescription: oldBooking.problemDescription,
    address: oldBooking.address,
    pricingModel: service.pricingModel, 
    status: 'PENDING',
    paymentStatus: 'PENDING',
    originalBookingId: oldBooking._id
  });

  newBooking.timeline.push({
    status: 'PENDING',
    note: `Rebooked from original booking ${oldBooking.bookingId}`,
    updatedBy: auth.accountId,
    updatedByModel: getModelName(auth.accountType)
  });

  await newBooking.save();
  return newBooking;
};

const acceptBooking = async (bookingId, auth) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  if (booking.status !== 'PENDING' && booking.status !== 'RESCHEDULE_REQUESTED') {
    throw new Error('Booking is not available to accept');
  }

  const partner = await Partner.findById(auth.accountId);
  if (!partner) throw new Error('Partner not found');
  if (partner.services && partner.services.length > 0 && !partner.services.includes(booking.serviceId)) {
    throw new Error('Partner is not eligible for this service type');
  }

  booking.partnerId = auth.accountId;
  booking.status = 'ACCEPTED';

  booking.timeline.push({
    status: 'ACCEPTED',
    note: 'Booking accepted by provider',
    updatedBy: auth.accountId,
    updatedByModel: getModelName(auth.accountType)
  });

  await booking.save();
  return booking;
};

const rejectBooking = async (bookingId, reason, auth) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  if (!booking.partnerId || booking.partnerId.toString() !== auth.accountId.toString()) {
     throw new Error('Not authorized to reject this booking - you are not assigned to it');
  }

  booking.status = 'REJECTED';
  booking.partnerId = null;
  booking.workerId = null;
  
  booking.timeline.push({
    status: 'REJECTED',
    note: `Rejected: ${reason}`,
    updatedBy: auth.accountId,
    updatedByModel: getModelName(auth.accountType)
  });

  await booking.save();
  return booking;
};

const getEligibleWorkers = async (bookingId, auth) => {
  if (auth.accountType === 'PARTNER' && auth.partnerType !== 'BSP') {
    throw new Error('Only BSP can manage workers');
  }

  if (auth.accountType === 'ADMIN') {
    throw new Error('Admin requires specific partner context to fetch workers');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const partner = await Partner.findById(auth.accountId);
  if (!partner || !partner.workers) return [];

  return partner.workers.filter(w => w.status === 'Active' && w.availability === true);
};

const assignWorker = async (bookingId, workerId, auth, isReassign = false) => {
  if (auth.accountType === 'PARTNER' && auth.partnerType !== 'BSP') {
    throw new Error('Only BSP can assign workers');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  let partner;
  if (auth.accountType === 'PARTNER') {
    if (booking.partnerId && booking.partnerId.toString() !== auth.accountId.toString()) {
      throw new Error('Not authorized to assign worker to this booking');
    }
    partner = await Partner.findById(auth.accountId);
  } else if (auth.accountType === 'ADMIN') {
    partner = await Partner.findOne({ 'workers._id': workerId });
  }

  if (!partner) {
    throw new Error('Partner not found for the given worker');
  }

  const worker = partner.workers.id(workerId);
  if (!worker || worker.status !== 'Active' || !worker.availability) {
    throw new Error('Worker not found or is currently inactive/unavailable');
  }

  booking.workerId = workerId;
  booking.partnerId = partner._id;
  booking.status = 'ASSIGNED';

  booking.timeline.push({
    status: 'ASSIGNED',
    note: isReassign ? 'Worker reassigned' : 'Worker assigned',
    updatedBy: auth.accountId,
    updatedByModel: getModelName(auth.accountType)
  });

  await booking.save();
  return booking;
};

const adminAssignBooking = async (bookingId, partnerId, workerId, auth) => {
  if (auth.accountType !== 'ADMIN') {
    throw new Error('Only admins can use manual assignment');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const partner = await Partner.findById(partnerId);
  if (!partner) throw new Error('Partner not found');

  booking.partnerId = partnerId;
  
  if (workerId) {
    const worker = partner.workers.id(workerId);
    if (!worker) throw new Error('Worker not found for this partner');
    booking.workerId = workerId;
  } else {
    booking.workerId = null;
  }

  booking.status = 'ASSIGNED';
  booking.timeline.push({
    status: 'ASSIGNED',
    note: 'Assigned manually by Admin',
    updatedBy: auth.accountId,
    updatedByModel: 'Admin'
  });

  await booking.save();
  return booking;
};

const adminUpdateTimeline = async (bookingId, note, auth) => {
  if (auth.accountType !== 'ADMIN') {
    throw new Error('Only admins can manually add timeline notes');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  booking.timeline.push({
    status: booking.status,
    note,
    updatedBy: auth.accountId,
    updatedByModel: 'Admin'
  });

  await booking.save();
  return booking;
};

const getBookingStats = async () => {
  const stats = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    disputed: 0
  };

  stats.forEach(s => {
    const status = s._id;
    const count = s.count;
    result.total += count;
    
    if (status === 'COMPLETED') result.completed += count;
    else if (status === 'CANCELLED' || status === 'REJECTED') result.cancelled += count;
    else if (status === 'DISPUTED') result.disputed += count;
    else result.active += count; // PENDING, ACCEPTED, ASSIGNED, EN_ROUTE, IN_PROGRESS, etc.
  });

  return result;
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  getTimeline,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  rebookBooking,
  acceptBooking,
  rejectBooking,
  getEligibleWorkers,
  assignWorker,
  adminAssignBooking,
  adminUpdateTimeline,
  getBookingStats
};
