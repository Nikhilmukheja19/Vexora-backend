import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import XLSX from 'xlsx';
import fs from 'fs';

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
export const bulkCreateProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return errorResponse(res, 'The uploaded file is empty', 400);
    }

    // Map and validate data
    const productsToCreate = data.map(item => ({
      name: item.Name || item.name,
      description: item.Description || item.description || '',
      price: Number(item.Price || item.price),
      comparePrice: Number(item.ComparePrice || item.comparePrice || 0),
      category: item.Category || item.category || 'uncategorized',
      stock: Number(item.Stock || item.stock || 0),
      sku: item.SKU || item.sku || '',
      images: item.ImageURL || item.image || [],
      businessId: req.user.businessId,
      isActive: true,
    }));

    // Filter out invalid products (missing name or price)
    const validProducts = productsToCreate.filter(p => p.name && !isNaN(p.price));

    if (validProducts.length === 0) {
      return errorResponse(res, 'No valid products found in the file. Ensure you have "Name" and "Price" columns.', 400);
    }

    const products = await Product.insertMany(validProducts);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    successResponse(res, { count: products.length }, `${products.length} products imported successfully`, 201);
  } catch (error) {
    // Attempt to clean up file on error
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};
