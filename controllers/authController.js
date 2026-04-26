import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Business from '../models/Business.js';
import env from '../config/env.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'customer']).withMessage('Invalid role'),
  body('businessName').optional().trim(),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'customer', businessName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
    }

    const user = await User.create({ name, email, password, role });

    // If registering as admin, create a business
    if (role === 'admin' && businessName) {
      const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingBusiness = await Business.findOne({ slug });
      if (existingBusiness) {
        return errorResponse(res, 'Business name already taken', 400);
      }
      const business = await Business.create({
        name: businessName,
        slug,
        owner: user._id,
        contactEmail: email,
      });
      user.businessId = business._id;
      await user.save();
    }

    const token = generateToken(user._id);

    successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
      },
      token,
    }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 401);
    }

    const token = generateToken(user._id);

    successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        avatar: user.avatar,
      },
      token,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    let user;
    if (req.userModel === 'Customer') {
      user = await Customer.findById(req.user._id).populate('businessId');
    } else {
      user = await User.findById(req.user._id).populate('businessId');
    }
    
    // Add role if it's a customer (since it's not in the schema)
    if (req.userModel === 'Customer' && user) {
      user = user.toObject();
      user.role = 'customer';
    }

    successResponse(res, { user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    let user;
    
    if (req.userModel === 'Customer') {
      user = await Customer.findByIdAndUpdate(
        req.user._id,
        { name, phone },
        { new: true, runValidators: true }
      );
    } else {
      user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, avatar },
        { new: true, runValidators: true }
      );
    }
    
    if (req.userModel === 'Customer' && user) {
      user = user.toObject();
      user.role = 'customer';
    }

    successResponse(res, { user }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};
