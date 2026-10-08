import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import { SCREENSHOT_ANALYSIS_PROMPT, buildCodeGenerationPrompt } from "./ai.prompts.js";
import { createOllamaProvider } from "./providers/ollama.provider.js";

const providerFactories = {
  ollama: createOllamaProvider,
};

export function getAiProvider(providerName = env.aiProvider) {
  const factory = providerFactories[providerName];

  if (!factory) {
    throw new AppError("AI provider is not configured.", 500, "UNSUPPORTED_AI_PROVIDER");
  }

  return factory();
}

export async function analyzeScreenshot({ imageBuffer }) {
  const provider = getAiProvider();
  const result = await provider.analyzeImage({
    prompt: SCREENSHOT_ANALYSIS_PROMPT,
    imageBuffer,
  });
  console.log("AI analysis raw response:");
  console.log(result.text);

  return {
    text: result.text,
    model: result.model,
    prompt: SCREENSHOT_ANALYSIS_PROMPT,
    provider: provider.name,
  };
}

export async function generateCodeFromSpecification({ uiSpecification, framework, styling }) {
  const provider = getAiProvider();
  const prompt = buildCodeGenerationPrompt({ uiSpecification, framework, styling });
  const result = await provider.generateCode({ prompt });
  console.log("AI generated code raw response:");
  console.log(result.text);

  return {
    text: result.text,
    model: result.model,
    prompt,
    provider: provider.name,
  };
}
