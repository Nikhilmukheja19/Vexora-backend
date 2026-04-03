import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  customerName: {
    type: String,
    default: 'Visitor',
  },
  customerEmail: {
    type: String,
    default: '',
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'closed', 'escalated'],
    default: 'active',
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    default: null,
  },
}, {
  timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
