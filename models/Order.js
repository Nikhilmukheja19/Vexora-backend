import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  shippingFee: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: 'cod',
    enum: ['cod', 'card', 'upi', 'wallet'],
  },
  paymentId: {
    type: String,
    default: '',
  },
  shippingAddress: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments({ businessId: this.businessId });
    this.orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

orderSchema.index({ businessId: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
