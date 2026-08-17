const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../utils/logger');

// Store active connections for reference if needed
const activeConnections = new Map(); // socketId -> { userId, userType }

const setupTrackingSockets = (io) => {
  // Middleware for Authentication
  io.use((socket, next) => {
    // Sockets can send auth via auth payload or headers
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication Error: Token missing'));
    }

    try {
      // Decode JWT based on user type (since both User and Partner use the same secret, we just verify)
      const decoded = jwt.verify(token, env.jwtAccessSecret);
      socket.user = decoded; // { accountId, accountType }
      next();
    } catch (err) {
      return next(new Error('Authentication Error: Invalid token'));
    }
  });

  // Socket Connection Event
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user.accountId}, Type: ${socket.user.accountType})`);
    activeConnections.set(socket.id, socket.user);

    // 1. Join a Booking Room
    // Client emits this when they open the tracking screen for a specific booking
    socket.on('join-booking', (bookingId) => {
      if (!bookingId) return;
      
      socket.join(bookingId);
      logger.info(`Socket ${socket.id} joined room: ${bookingId}`);
      
      // Notify the room that someone joined (useful for UI indicators)
      io.to(bookingId).emit('room-event', {
        message: `${socket.user.accountType} connected`,
        timestamp: new Date()
      });
    });

    // 2. Partner emits location update
    socket.on('partner-location-update', (data) => {
      // Expecting data: { bookingId: 'BKG-123456', lat: 28.7041, lng: 77.1025, heading: 90 }
      const { bookingId, lat, lng, heading } = data;
      
      if (!bookingId || !lat || !lng) return;

      // Ensure only Partners can emit location updates
      if (socket.user.accountType === 'User') {
        return; // Customers shouldn't be broadcasting location updates to this channel
      }

      // Broadcast this location to everyone in the room (Customer)
      // socket.to(room) emits to everyone EXCEPT the sender
      socket.to(bookingId).emit('live-location', {
        bookingId,
        partnerId: socket.user.accountId,
        lat,
        lng,
        heading, // Direction facing
        timestamp: new Date()
      });
    });

    // 3. Disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      activeConnections.delete(socket.id);
    });
  });
};

module.exports = setupTrackingSockets;
