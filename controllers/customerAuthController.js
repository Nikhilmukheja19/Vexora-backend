import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Business from '../models/Business.js';
import env from '../config/env.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const customerRegister = async (req, res, next) => {
  try {
    const { name, email, password, businessSlug } = req.body;

    const business = await Business.findOne({ slug: businessSlug });
    if (!business) return errorResponse(res, 'Business not found', 404);

    const existingCustomer = await Customer.findOne({ email, businessId: business._id });
    if (existingCustomer) {
      return errorResponse(res, 'Email already registered with this store', 400);
    }

    const customer = await Customer.create({
      name,
      email,
      password,
      businessId: business._id,
    });

    const token = generateToken(customer._id);

    successResponse(res, {
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
        businessId: customer.businessId,
      },
      token,
    }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const customerLogin = async (req, res, next) => {
  try {
    const { email, password, businessSlug } = req.body;

    const business = await Business.findOne({ slug: businessSlug });
    if (!business) return errorResponse(res, 'Store not found', 404);

    const customer = await Customer.findOne({ email, businessId: business._id }).select('+password');
    if (!customer) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = generateToken(customer._id);

    successResponse(res, {
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
        businessId: customer.businessId,
      },
      token,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};
