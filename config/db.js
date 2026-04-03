import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(env.MONGODB_URI);
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error('💥 Could not connect to MongoDB. Please check your MONGODB_URI in server/.env');
        console.error('   For local MongoDB, ensure mongod is running.');
        console.error('   For Atlas: update MONGODB_URI=mongodb+srv://... in server/.env');
        process.exit(1);
      }
    }
  }
};

export default connectDB;
