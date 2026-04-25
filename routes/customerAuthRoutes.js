import { Router } from 'express';
import { customerLogin, customerRegister } from '../controllers/customerAuthController.js';

const router = Router();

router.post('/login', customerLogin);
router.post('/register', customerRegister);

export default router;
