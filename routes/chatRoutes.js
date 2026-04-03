import { Router } from 'express';
import { sendMessage, getChatHistory, getBusinessChats } from '../controllers/chatController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public (optional auth for visitors)
router.post('/message', optionalAuth, sendMessage);
router.get('/history/:sessionId', getChatHistory);

// Admin
router.get('/business', protect, authorize('admin'), getBusinessChats);

export default router;
