import { errorResponse } from '../utils/apiResponse.js';

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return errorResponse(res, 'Validation Error', 400, messages);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `Duplicate value for ${field}`, 400);
  }

  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid ID format', 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  return errorResponse(res, message, statusCode);
};

export default errorHandler;
