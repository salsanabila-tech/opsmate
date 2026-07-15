import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

export const errorMiddleware: ErrorRequestHandler = (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
): void => {
    console.error(error);

    response.status(500).json({
        status: false,
        message: 'Terjadi kesalahan pada server',
    });
}