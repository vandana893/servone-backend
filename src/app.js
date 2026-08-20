const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sendSuccess } = require('./utils/response');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const routes = require('./routes');
const env = require('./config/env');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiting (Disabled for Dev)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: { success: false, message: 'Too many requests', error: { code: 'RATE_LIMIT_EXCEEDED' } }
// });
// app.use('/api', limiter);

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Request Logger
app.use((req, res, next) => {
  console.log(`[API HIT] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files (like uploaded images) - Removed local serving for Cloudinary migration


// Base Route
app.get('/', (req, res) => {
  sendSuccess(res, { environment: env.nodeEnv }, 'ServOne / Seva Platform API is running');
});

// API Routes
app.use('/api', routes);

// Centralized Error Handler
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  logger.warn(`404 - Endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: { code: 'NOT_FOUND' }
  });
});

module.exports = app;
