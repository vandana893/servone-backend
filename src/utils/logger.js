const winston = require('winston');
const env = require('../config/env');

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true })
    )
  })
];

const logger = winston.createLogger({
  level: env.nodeEnv === 'development' ? 'debug' : 'warn',
  levels: winston.config.npm.levels,
  format,
  transports
});

module.exports = logger;
