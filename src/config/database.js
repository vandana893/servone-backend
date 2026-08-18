const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');
const dns = require('dns');

// Fix DNS resolution issues on Windows/Local networks (Safe for merging)
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  // Safe fail-safe if custom DNS can't be applied
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`✅ MongoDB Cluster Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
