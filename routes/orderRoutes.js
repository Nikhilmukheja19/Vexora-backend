import { Router } from 'express';
import { createOrder, getOrders, getOrder, updateOrderStatus, getCustomerOrders, getOrderAnalytics } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Customer routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getCustomerOrders);

// Admin routes
router.get('/', protect, authorize('admin'), getOrders);
router.get('/analytics', protect, authorize('admin'), getOrderAnalytics);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;
