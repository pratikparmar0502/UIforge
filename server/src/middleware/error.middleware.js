import { AppError } from '../utils/app-error.js';

export function errorHandler(error, _request, response, _next) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return response.status(413).json({
      status: 'error',
      message: 'Screenshot must be 5 MB or smaller.',
    });
  }

  if (error.code === 'INVALID_FILE_TYPE') {
    return response.status(error.statusCode ?? 400).json({
      status: 'error',
      message: error.message,
    });
  }

  if (error.name === 'MulterError') {
    return response.status(400).json({
      status: 'error',
      message: 'Screenshot upload failed.',
    });
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      console.error(error);
    }

    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  console.error(error);

  response.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred.',
  });
}
