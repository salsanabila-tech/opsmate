import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

export const errorMiddleware: ErrorRequestHandler = (error: Error, _request: Request, response: Response, _next: NextFunction): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
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
