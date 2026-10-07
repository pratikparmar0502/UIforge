import { mkdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import multer from 'multer';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
export const uploadsDirectory = resolve(moduleDirectory, '../../uploads');

const fileExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDirectory,
  filename: (_request, file, callback) => {
    const extension = fileExtensions[file.mimetype] ?? extname(file.originalname);
    callback(null, `generation-${randomUUID()}${extension}`);
  },
});

function fileFilter(_request, file, callback) {
  if (!fileExtensions[file.mimetype]) {
    const error = new Error('Only PNG, JPEG, and WebP screenshots are supported.');
    error.statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    callback(error);
    return;
  }

  callback(null, true);
}

export const uploadScreenshot = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});
