import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return errorResponse(res, 'Validation failed', 400, messages);
  }
  next();
};
