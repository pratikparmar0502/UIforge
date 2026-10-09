import { AppError } from "../utils/app-error.js";

const MIN_LENGTH = 40;
const MAX_LENGTH = 100_000;

function invalidCode(detail) {
  console.error("Generated code validation failed:", detail);
  return new AppError("AI code generation returned invalid code.", 422, "INVALID_GENERATED_CODE");
}

// Removes a single wrapping Markdown fence. Anything else is left for validation to reject.
export function stripMarkdownFences(rawText) {
  const trimmed = rawText.trim();
  const fenced = trimmed.match(/^```[\w+-]*[ \t]*\r?\n([\s\S]*?)\r?\n?```$/);

  return fenced ? fenced[1].trim() : trimmed;
}

export function validateGeneratedCode(rawText) {
  if (rawText === undefined || rawText === null) {
    throw invalidCode("Response was missing.");
  }

  if (typeof rawText !== "string") {
    throw invalidCode("Response was not a string.");
  }

  const code = stripMarkdownFences(rawText);

  if (!code) {
    throw invalidCode("Response was empty.");
  }

  if (code.length < MIN_LENGTH) {
    throw invalidCode("Response was too short.");
  }

  if (code.length > MAX_LENGTH) {
    throw invalidCode("Response exceeded the maximum size.");
  }

  if (code.includes("```")) {
    throw invalidCode("Response still contained Markdown fences.");
  }

  if (/<!doctype|<html[\s>]/i.test(code)) {
    throw invalidCode("Response was a full HTML document, not a React component.");
  }

  const hasComponent =
    /export\s+default\b/.test(code) ||
    /\bfunction\s+[A-Z]\w*\s*\(/.test(code) ||
    /\bconst\s+[A-Z]\w*\s*=/.test(code);

  const hasJsx = /<[A-Za-z][\w.-]*(?:\s|\/?>)/.test(code);

  if (!hasComponent || !hasJsx) {
    throw invalidCode("Response did not look like a React component.");
  }

  if (!/\bclassName\s*=/.test(code)) {
    throw invalidCode("Response did not use Tailwind className styling.");
  }

  return code;
}
