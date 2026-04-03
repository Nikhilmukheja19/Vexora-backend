import { Router } from 'express';
import { createTicket, getTickets, getTicket, updateTicket, addTicketMessage } from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createTicket);
router.get('/', protect, authorize('admin'), getTickets);
router.get('/:id', protect, getTicket);
router.put('/:id', protect, authorize('admin'), updateTicket);
router.post('/:id/message', protect, addTicketMessage);

export default router;
