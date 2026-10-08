import { readFile, unlink } from 'node:fs/promises';
import { basename, isAbsolute, relative, resolve } from 'node:path';
import { uploadsDirectory } from '../middleware/screenshot-upload.middleware.js';
import { AppError } from './app-error.js';

export async function removeUploadedFile(filePath) {
  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to remove uploaded screenshot:', error.message);
    }
  }
}

export function resolveScreenshotFilePath(screenshotReference) {
  if (typeof screenshotReference !== 'string' || !screenshotReference.trim()) {
    throw new AppError('Generation does not have a screenshot to analyze.', 400, 'SCREENSHOT_MISSING');
  }

  const filename = basename(screenshotReference);
  const filePath = resolve(uploadsDirectory, filename);
  const relativePath = relative(resolve(uploadsDirectory), filePath);

  if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new AppError('Generation does not have a screenshot to analyze.', 400, 'SCREENSHOT_MISSING');
  }

  return filePath;
}

export async function readScreenshotFile(screenshotReference) {
  const filePath = resolveScreenshotFilePath(screenshotReference);

  try {
    return await readFile(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new AppError('Screenshot file is missing on the server.', 400, 'SCREENSHOT_MISSING');
    }

    throw error;
  }
}
