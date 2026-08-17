require('dotenv').config();
const app = require('./src/app');
const env = require('./src/config/env');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

const http = require('http');
const { Server } = require('socket.io');
const setupTrackingSockets = require('./src/sockets/tracking.socket');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create HTTP Server
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    const io = new Server(httpServer, {
      cors: {
        origin: '*', // Allow all origins for now
        methods: ['GET', 'POST']
      }
    });

    // Setup Sockets
    setupTrackingSockets(io);

    // Start HTTP server instead of Express app directly
    const server = httpServer.listen(env.port, () => {
      logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
