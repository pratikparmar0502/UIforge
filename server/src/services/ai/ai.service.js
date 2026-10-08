import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';
import { SCREENSHOT_ANALYSIS_PROMPT } from './ai.prompts.js';
import { createOllamaProvider } from './providers/ollama.provider.js';

const providerFactories = {
  ollama: createOllamaProvider,
};

export function getAiProvider(providerName = env.aiProvider) {
  const factory = providerFactories[providerName];

  if (!factory) {
    throw new AppError('AI provider is not configured.', 500, 'UNSUPPORTED_AI_PROVIDER');
  }

  return factory();
}

export async function analyzeScreenshot({ imageBuffer }) {
  const provider = getAiProvider();
  const result = await provider.analyzeImage({
    prompt: SCREENSHOT_ANALYSIS_PROMPT,
    imageBuffer,
  });

  return {
    text: result.text,
    model: result.model,
    prompt: SCREENSHOT_ANALYSIS_PROMPT,
    provider: provider.name,
  };
}
