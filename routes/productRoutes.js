import { Router } from 'express';
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct, getPublicProducts, getPublicProduct, bulkCreateProducts } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { resolveTenant } from '../middleware/tenantResolver.js';
import upload from '../middleware/upload.js';

const router = Router();

// Public routes (by business slug)
router.get('/public/:businessSlug', resolveTenant, getPublicProducts);
router.get('/public/:businessSlug/:id', resolveTenant, getPublicProduct);

// Admin routes
router.post('/bulk', protect, authorize('admin'), upload.single('file'), bulkCreateProducts);
router.post('/', protect, authorize('admin'), createProduct);
router.get('/', protect, authorize('admin'), getProducts);
router.get('/:id', protect, authorize('admin'), getProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
