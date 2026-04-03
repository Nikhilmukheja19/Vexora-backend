import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  comparePrice: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String,
  }],
  category: {
    type: String,
    default: 'uncategorized',
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  sku: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

productSchema.index({ businessId: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
