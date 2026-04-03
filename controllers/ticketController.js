import Ticket from '../models/Ticket.js';
import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const createTicket = async (req, res, next) => {
  try {
    const { subject, description, priority = 'medium', customerName, customerEmail } = req.body;
    const ticket = await Ticket.create({
      subject,
      description,
      priority,
      businessId: req.business?._id || req.user.businessId,
      customerId: req.user?._id || null,
      customerName: customerName || req.user?.name || '',
      customerEmail: customerEmail || req.user?.email || '',
      messages: [{ sender: 'customer', content: description }],
    });

    successResponse(res, { ticket }, 'Ticket created', 201);
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, sort = '-createdAt' } = req.query;
    const query = { businessId: req.user.businessId };
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    successResponse(res, {
      tickets,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .populate('chatId');
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);
    successResponse(res, { ticket });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const { status, priority } = req.body;
    const update = {};
    if (status) update.status = status;
    if (priority) update.priority = priority;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      update,
      { new: true }
    );
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);
    successResponse(res, { ticket }, 'Ticket updated');
  } catch (error) {
    next(error);
  }
};

export const addTicketMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const ticket = await Ticket.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    ticket.messages.push({
      sender: req.user.role === 'admin' ? 'admin' : 'customer',
      content,
    });

    if (ticket.status === 'open') ticket.status = 'in-progress';
    await ticket.save();

    // Notify customer if admin responds
    if (req.user.role === 'admin' && ticket.customerId) {
      await Notification.create({
        type: 'ticket',
        title: 'Ticket Response',
        message: `Response on ticket #${ticket.ticketNumber}`,
        userId: ticket.customerId,
        link: `/tickets/${ticket._id}`,
      });
    }

    successResponse(res, { ticket }, 'Message added');
  } catch (error) {
    next(error);
  }
};
