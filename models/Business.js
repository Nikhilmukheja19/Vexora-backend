import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  logo: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    default: 'general',
    enum: ['general', 'restaurant', 'retail', 'services', 'healthcare', 'education', 'technology', 'other'],
  },
  contactEmail: {
    type: String,
    default: '',
  },
  contactPhone: {
    type: String,
    default: '',
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  theme: {
    primaryColor: { type: String, default: '#6366f1' },
    secondaryColor: { type: String, default: '#8b5cf6' },
    accentColor: { type: String, default: '#06b6d4' },
    darkMode: { type: Boolean, default: false },
  },
  socialLinks: {
    website: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  },
  settings: {
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    enableChat: { type: Boolean, default: true },
    enableOrders: { type: Boolean, default: true },
  },
}, {
  timestamps: true,
});

businessSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

const Business = mongoose.model('Business', businessSchema);
export default Business;
