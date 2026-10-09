/**
 * UIForge Frontend API Service Layer
 * Native fetch helper for backend integration.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Standardized HTTP response handler
 */
async function handleResponse(response) {
  let responseData = null;

  try {
    responseData = await response.json();
  } catch (err) {
    // Response had no JSON body or failed to parse
    responseData = null;
  }

  if (!response.ok) {
    const errorMessage =
      (responseData && responseData.message) ||
      (responseData && responseData.error) ||
      `HTTP Error ${response.status}: ${response.statusText}`;

    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData;
}

/**
 * 1. Upload screenshot and create generation record
 * POST /api/generations
 * Uses FormData. Does NOT manually set 'Content-Type' header.
 */
export async function createGeneration(file, options = {}) {
  const formData = new FormData();
  formData.append("screenshot", file);

  if (options.targetFramework) {
    formData.append("targetFramework", options.targetFramework);
  }
  if (options.stylingFramework) {
    formData.append("stylingFramework", options.stylingFramework);
  }
  if (options.componentType) {
    formData.append("componentType", options.componentType);
  }

  const response = await fetch(`${API_BASE_URL}/api/generations`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

/**
 * 2. Trigger AI screenshot analysis
 * POST /api/generations/:id/analyze
 */
export async function analyzeGeneration(id, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/generations/${id}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  return handleResponse(response);
}

/**
 * 3. Trigger React/Tailwind code generation
 * POST /api/generations/:id/generate-code
 */
export async function generateCode(id, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/generations/${id}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  return handleResponse(response);
}

/**
 * 4. Fetch single generation by ID
 * GET /api/generations/:id
 */
export async function getGenerationById(id) {
  const response = await fetch(`${API_BASE_URL}/api/generations/${id}`);
  return handleResponse(response);
}

/**
 * 5. Fetch recent generations
 * GET /api/generations
 */
export async function getGenerations() {
  const response = await fetch(`${API_BASE_URL}/api/generations`);
  return handleResponse(response);
}
