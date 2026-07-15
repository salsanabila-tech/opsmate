import type { Request, Response } from 'express';

export function getHealthStatus(
    _request: Request,
    response: Response,
): void {
    response.status(200).json({
        status: true,
        message: 'OpsMate API is running',
        timestamp: new Date().toISOString(),
    });
}