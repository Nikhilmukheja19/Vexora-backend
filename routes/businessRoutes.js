import { Router } from 'express';
import { getBusinessProfile, updateBusiness, getDashboardStats, getBusinessBySlug } from '../controllers/businessController.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireBusiness } from '../middleware/tenantResolver.js';

const router = Router();

// Public
router.get('/public/:slug', getBusinessBySlug);

// Protected (admin only)
router.get('/profile', protect, authorize('admin'), getBusinessProfile);
router.put('/profile', protect, authorize('admin'), updateBusiness);
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

export default router;
