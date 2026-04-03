import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['customer', 'admin', 'system'],
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

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
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
    default: '',
  },
  customerEmail: {
    type: String,
    default: '',
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    default: null,
  },
  messages: [ticketMessageSchema],
}, {
  timestamps: true,
});

ticketSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments({ businessId: this.businessId });
    this.ticketNumber = `TKT-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
