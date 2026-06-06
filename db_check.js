import mongoose from 'mongoose';
import Business from './models/Business.js';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localboost-ai');
    console.log('Connected to DB');
    
    const businesses = await Business.find();
    console.log('--- Businesses ---');
    console.log(businesses.map(b => ({ id: b._id, name: b.name, slug: b.slug, isActive: b.settings?.isActive })));
    
    const products = await Product.find();
    console.log('--- Products ---');
    console.log(products.map(p => ({ id: p._id, name: p.name, businessId: p.businessId, isActive: p.isActive })));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

checkDB();
