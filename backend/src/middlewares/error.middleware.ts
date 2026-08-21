import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../errors/app-error.js';
import { success } from 'zod';

export const errorMiddleware: ErrorRequestHandler = (error: Error, _request: Request, response: Response, _next: NextFunction): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      response.status(413).json({
        success: false, message: 'Ukuran file maksimal 5 MB', code: 'ATTACHMENT_FILE_TOO_LARGE',
      });

      return;
    }

    response.status(400).json({
      success: false, message: 'Upload file tidak valid', code: 'INVALID_FILE_UPLOAD',
    });

    return;
  }
  
  console.error('Unhandled server error:', error);

  response.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    code: 'INTERNAL_SERVER_ERROR',
  });
};
