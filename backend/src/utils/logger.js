const fs = require('fs');
const path = require('path');
const winston = require('winston');

const transports = [];

// In test, stay silent (no files, no console noise).
if (process.env.NODE_ENV === 'test') {
  transports.push(new winston.transports.Console({ silent: true }));
} else {
  // Ensure the log directory exists so file transports don't fail.
  const logDir = path.resolve(process.cwd(), 'logs');
  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    transports.push(
      new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
      new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
    );
  } catch (e) {
    // Filesystem not writable (e.g. read-only container) — fall back to console only.
  }
  if (process.env.NODE_ENV !== 'production') {
    transports.push(new winston.transports.Console({ format: winston.format.simple() }));
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'placementhub-backend' },
  transports,
});

module.exports = logger;