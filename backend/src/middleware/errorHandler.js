const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { message: err.message, statusCode: err.statusCode };

  // Log error with structured logger (avoids noisy console + enables redaction)
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    stack: err.stack,
    name: err.name
  });

  // Sequelize unique constraint (e.g. duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors && err.errors[0] ? err.errors[0].path : 'field';
    error = { message: `Duplicate value for ${field}`, statusCode: 400 };
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = (err.errors || []).map(e => e.message).join(', ') || 'Validation error';
    error = { message, statusCode: 400 };
  }

  // Sequelize foreign key violation
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = { message: 'Related resource not found or still referenced', statusCode: 409 };
  }

  // Sequelize DB connection error
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    error = { message: 'Database temporarily unavailable', statusCode: 503 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 };
  }
  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired', statusCode: 401 };
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : 'File upload error';
    error = { message, statusCode: 400 };
  }

  const statusCode = error.statusCode || 500;
  // In production, never leak internal error details for 5xx responses.
  const isProd = process.env.NODE_ENV === 'production';
  const message = (isProd && statusCode >= 500) ? 'Server Error' : (error.message || 'Server Error');

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(!isProd && { stack: err.stack })
  });
};

module.exports = errorHandler;
