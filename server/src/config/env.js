import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(moduleDirectory, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
};
