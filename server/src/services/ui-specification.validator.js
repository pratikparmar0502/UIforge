import { AppError } from '../utils/app-error.js';

function invalidSpecification(detail) {
  console.error('UI specification validation failed:', detail);
  return new AppError(
    'AI analysis returned an invalid UI specification.',
    422,
    'INVALID_AI_RESPONSE',
  );
}

function assertObject(value, name) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw invalidSpecification(`${name} must be an object.`);
  }
}

function assertArray(value, name) {
  if (!Array.isArray(value)) {
    throw invalidSpecification(`${name} must be an array.`);
  }
}

export function extractJsonPayload(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw invalidSpecification('Response was empty.');
  }

  const trimmed = rawText.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue with fence/surrounding-text extraction.
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch) {
    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch {
      throw invalidSpecification('Fenced response was not valid JSON.');
    }
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (start !== -1 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      throw invalidSpecification('Extracted response was not valid JSON.');
    }
  }

  throw invalidSpecification('Response was not valid JSON.');
}

export function validateUiSpecification(specification) {
  assertObject(specification, 'UI specification');

  const requiredArrayKeys = ['sections', 'components', 'content', 'assets', 'responsiveHints'];
  const requiredObjectKeys = ['page', 'layout', 'styles'];

  for (const key of requiredObjectKeys) {
    if (!(key in specification)) {
      throw invalidSpecification(`Missing ${key}.`);
    }

    assertObject(specification[key], key);
  }

  for (const key of requiredArrayKeys) {
    if (!(key in specification)) {
      throw invalidSpecification(`Missing ${key}.`);
    }

    assertArray(specification[key], key);
  }

  assertArray(specification.styles.colors, 'styles.colors');
  assertArray(specification.styles.typography, 'styles.typography');
  assertArray(specification.styles.spacing, 'styles.spacing');

  return specification;
}

export function parseAndValidateUiSpecification(rawText) {
  return validateUiSpecification(extractJsonPayload(rawText));
}
