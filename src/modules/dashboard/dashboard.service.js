const User = require('../users/user.model');
const Partner = require('../partners/partner.model');
const Booking = require('../bookings/booking.model');

const getStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalPartners,
    activeWorkers,
    todaysBookings,
    activeBookings,
    pendingAssignments,
    revenueAgg,
    pendingPayoutsAgg
  ] = await Promise.all([
    User.countDocuments(),
    Partner.countDocuments(),
    Partner.countDocuments({ status: 'APPROVED' }), // or 'ACTIVE'
    Booking.countDocuments({ createdAt: { $gte: startOfDay } }),
    Booking.countDocuments({ status: { $in: ['ACCEPTED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS'] } }),
    Booking.countDocuments({ status: 'PENDING' }),
    Booking.aggregate([
      { $match: { status: 'COMPLETED', finalPrice: { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$finalPrice' } } }
    ]),
    Booking.aggregate([
      { $match: { paymentStatus: 'PENDING', status: 'COMPLETED', finalPrice: { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$finalPrice' } } }
    ])
  ]);

  return {
    totalUsers,
    usersChange: 12, // Mock percentage change
    totalPartners,
    partnersChange: 8,
    activeWorkers,
    workersChange: 5,
    todaysBookings,
    bookingsChange: 15,
    activeBookings,
    pendingAssignments,
    revenue: revenueAgg[0]?.total || 0,
    revenueChange: 10,
    pendingPayouts: pendingPayoutsAgg[0]?.total || 0
  };
};

const getFunnel = async () => {
  const rawFunnel = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Map raw status to meaningful funnel stages
  const mapping = {
    'PENDING': 'Received',
    'ACCEPTED': 'Accepted',
    'ASSIGNED': 'Accepted',
    'EN_ROUTE': 'In Progress',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
    'REJECTED': 'Cancelled',
    'RESCHEDULE_REQUESTED': 'Received',
    'QUOTE_REQUIRED': 'Received'
  };

  const aggregated = {};
  rawFunnel.forEach(item => {
    const stage = mapping[item._id] || 'Other';
    aggregated[stage] = (aggregated[stage] || 0) + item.count;
  });

  // Ensure strict ordering
  const stages = ['Received', 'Accepted', 'In Progress', 'Completed', 'Cancelled'];
  return stages.map(stage => ({
    name: stage,
    value: aggregated[stage] || 0
  }));
};

module.exports = {
  getStats,
  getFunnel
};
