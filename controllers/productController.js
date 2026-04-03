import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      businessId: req.user.businessId,
    });
    successResponse(res, { product }, 'Product created', 201);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, sort = '-createdAt', active } = req.query;
    const query = { businessId: req.user.businessId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') query.category = category;
    if (active !== undefined) query.isActive = active === 'true';

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    successResponse(res, {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, { product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, { product }, 'Product updated');
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, null, 'Product deleted');
  } catch (error) {
    next(error);
  }
};

// Public: get products by business slug
export const getPublicProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, sort = '-createdAt' } = req.query;
    const query = { businessId: req.business._id, isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') query.category = category;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const categories = await Product.distinct('category', { businessId: req.business._id, isActive: true });

    successResponse(res, {
      products,
      categories,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.business._id, isActive: true });
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, { product });
  } catch (error) {
    next(error);
  }
};
