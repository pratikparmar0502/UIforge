import { request as httpRequest } from "node:http";
import { env } from "../../../config/env.js";
import { AppError } from "../../../utils/app-error.js";

const REQUEST_TIMEOUT_MS = 900_000;

function isTimeoutError(error) {
  return error?.name === "AbortError" || error?.name === "TimeoutError";
}

function postJson(url, payload, signal) {
  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const request = httpRequest(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        signal,
      },
      (response) => {
        let responseBody = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () => {
          resolve({ statusCode: response.statusCode, body: responseBody });
        });
      },
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

export function createOllamaProvider() {
  const baseUrl = env.ollamaBaseUrl.replace(/\/$/, "");
  const model = env.ollamaModel;

  async function chat({ label, messages, format }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const body = { model, stream: false, think: false, messages };

      if (format) {
        body.format = format;
      }

      const response = await postJson(`${baseUrl}/api/chat`, body, controller.signal);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        console.error("Ollama request failed:", response.statusCode, response.body);

        if (response.statusCode === 404) {
          throw new AppError("AI model is unavailable.", 503, "AI_MODEL_UNAVAILABLE");
        }

        throw new AppError(`${label} service is unavailable.`, 503, "AI_UNAVAILABLE");
      }

      const payload = JSON.parse(response.body);
      const text = payload?.message?.content;

      if (typeof text !== "string" || !text.trim()) {
        throw new AppError(`${label} returned an empty response.`, 422, "INVALID_AI_RESPONSE");
      }

      return {
        text,
        model: typeof payload.model === "string" && payload.model ? payload.model : model,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (isTimeoutError(error)) {
        throw new AppError(`${label} timed out.`, 504, "AI_TIMEOUT");
      }

      console.error("Ollama connection failed:", error.message);
      throw new AppError(`${label} service is unavailable.`, 503, "AI_UNAVAILABLE");
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    name: "ollama",

    analyzeImage({ prompt, imageBuffer }) {
      return chat({
        label: "AI analysis",
        format: "json",
        messages: [
          {
            role: "user",
            content: prompt,
            images: [Buffer.from(imageBuffer).toString("base64")],
          },
        ],
      });
    },

    // Text-only: the screenshot is never sent here.
    generateCode({ prompt }) {
      return chat({
        label: "AI code generation",
        messages: [{ role: "user", content: prompt }],
      });
    },
  };
}
