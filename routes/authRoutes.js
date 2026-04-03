import { Router } from 'express';
import { register, login, getProfile, updateProfile, registerValidation, loginValidation } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
