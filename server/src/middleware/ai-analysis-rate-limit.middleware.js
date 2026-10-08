import { env } from '../config/env.js';

const analysisRequestsByClient = new Map();

function getClientKey(request) {
  return request.ip || request.socket?.remoteAddress || 'unknown';
}

function pruneExpiredTimestamps(timestamps, now, dayMs) {
  return timestamps.filter((timestamp) => now - timestamp < dayMs);
}

export function aiAnalysisRateLimit(request, response, next) {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;
  const cooldownMs = env.aiAnalysisCooldownSeconds * 1000;
  const clientKey = getClientKey(request);
  const recentRequests = pruneExpiredTimestamps(
    analysisRequestsByClient.get(clientKey) ?? [],
    now,
    dayMs,
  );

  const lastRequestAt = recentRequests.at(-1);

  if (lastRequestAt && now - lastRequestAt < cooldownMs) {
    const retryAfterSeconds = Math.ceil((cooldownMs - (now - lastRequestAt)) / 1000);
    response.set('Retry-After', String(retryAfterSeconds));

    return response.status(429).json({
      status: 'error',
      message: 'Please wait before requesting another analysis.',
    });
  }

  const hourCount = recentRequests.filter((timestamp) => now - timestamp < hourMs).length;

  if (hourCount >= env.aiAnalysisMaxPerHour) {
    return response.status(429).json({
      status: 'error',
      message: 'Hourly analysis limit reached. Try again later.',
    });
  }

  if (recentRequests.length >= env.aiAnalysisMaxPerDay) {
    return response.status(429).json({
      status: 'error',
      message: 'Daily analysis limit reached. Try again later.',
    });
  }

  recentRequests.push(now);
  analysisRequestsByClient.set(clientKey, recentRequests);
  return next();
}
