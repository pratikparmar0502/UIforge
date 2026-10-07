import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.mongodbUri) {
    console.warn('MONGODB_URI is not set; MongoDB connection is disabled.');
    return false;
  }

  try {
    await mongoose.connect(env.mongodbUri);
    console.info(`MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
}

export function getDatabaseStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  if (!env.mongodbUri) {
    return 'not_configured';
  }

  return states[mongoose.connection.readyState] ?? 'unknown';
}
