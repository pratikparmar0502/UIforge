import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(moduleDirectory, '../../.env') });

function integerFromEnv(name, fallback) {
  const raw = process.env[name];

  if (raw === undefined || raw === '') {
    return fallback;
  }

  const value = Number(raw);

  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  aiProvider: process.env.AI_PROVIDER || 'ollama',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen3-vl:4b',
  aiAnalysisCooldownSeconds: integerFromEnv('AI_ANALYSIS_COOLDOWN_SECONDS', 15),
  aiAnalysisMaxPerHour: integerFromEnv('AI_ANALYSIS_MAX_PER_HOUR', 10),
  aiAnalysisMaxPerDay: integerFromEnv('AI_ANALYSIS_MAX_PER_DAY', 20),
};
