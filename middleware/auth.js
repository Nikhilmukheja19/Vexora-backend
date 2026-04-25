import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import env from '../config/env.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return errorResponse(res, 'Not authorized, no token', 401);
    }
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Try finding in User first (Admins)
    let user = await User.findById(decoded.id).select('-password');
    let userModel = 'User';
    
    // If not found, try finding in Customer
    if (!user) {
      user = await Customer.findById(decoded.id).select('-password');
      if (user) {
        user.role = 'customer'; 
        userModel = 'Customer';
      }
    }

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 401);
    }
    req.user = user;
    req.userModel = userModel;
    next();
  } catch (error) {
    return errorResponse(res, 'Not authorized, token failed', 401);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Not authorized for this action', 403);
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      let user = await User.findById(decoded.id).select('-password');
      let userModel = 'User';
      if (!user) {
        user = await Customer.findById(decoded.id).select('-password');
        if (user) {
          user.role = 'customer';
          userModel = 'Customer';
        }
      }
      req.user = user;
      req.userModel = userModel;
    }
    next();
  } catch {
    next();
  }
};
