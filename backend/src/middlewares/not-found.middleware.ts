import type { Request, Response } from 'express';

export const notFoundMiddleware = (
    request: Request,
    response: Response,
): void => {
    response.status(404).json({
        status: false,
        message:  `Route ${request.method} ${request.originalUrl} tidak ditemukan`,
    });
}