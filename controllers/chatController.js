import Chat from '../models/Chat.js';
import Ticket from '../models/Ticket.js';
import Notification from '../models/Notification.js';
import Business from '../models/Business.js';
import { getAIResponse } from '../services/aiService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { v4Fallback } from '../utils/helpers.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId, businessSlug, customerName, customerEmail } = req.body;

    const business = await Business.findOne({ slug: businessSlug });
    if (!business) return errorResponse(res, 'Business not found', 404);

    const chatSessionId = sessionId || v4Fallback();

    let chat = await Chat.findOne({ sessionId: chatSessionId, businessId: business._id });

    if (!chat) {
      chat = new Chat({
        sessionId: chatSessionId,
        businessId: business._id,
        customerId: req.user?._id || null,
        customerName: customerName || req.user?.name || 'Visitor',
        customerEmail: customerEmail || req.user?.email || '',
        messages: [],
      });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });

    // Generate AI response
    const aiResponse = await getAIResponse(message, chat.messages, business);
    chat.messages.push({ role: 'assistant', content: aiResponse });

    // Auto-escalate if keywords detected
    const escalateKeywords = ['speak to human', 'real person', 'agent', 'complaint', 'refund', 'urgent'];
    const shouldEscalate = escalateKeywords.some(k => message.toLowerCase().includes(k));

    if (shouldEscalate && !chat.ticketId) {
      const ticket = await Ticket.create({
        subject: `Chat Escalation: ${message.substring(0, 50)}`,
        description: `Auto-created from chat. Customer message: ${message}`,
        businessId: business._id,
        customerId: req.user?._id || null,
        customerName: chat.customerName,
        customerEmail: chat.customerEmail,
        chatId: chat._id,
        priority: 'high',
        messages: [{ sender: 'system', content: `Escalated from chat: ${message}` }],
      });
      chat.ticketId = ticket._id;
      chat.status = 'escalated';

      await Notification.create({
        type: 'ticket',
        title: 'New Support Ticket',
        message: `Chat escalated to ticket #${ticket.ticketNumber}`,
        userId: business.owner,
        businessId: business._id,
        link: `/dashboard/tickets/${ticket._id}`,
      });
    }

    await chat.save();

    successResponse(res, {
      sessionId: chatSessionId,
      message: aiResponse,
      escalated: shouldEscalate,
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const chat = await Chat.findOne({ sessionId });
    if (!chat) return errorResponse(res, 'Chat not found', 404);
    successResponse(res, { chat });
  } catch (error) {
    next(error);
  }
};

export const getBusinessChats = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { businessId: req.user.businessId };
    if (status) query.status = status;

    const total = await Chat.countDocuments(query);
    const chats = await Chat.find(query)
      .sort('-updatedAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    successResponse(res, { chats, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};
