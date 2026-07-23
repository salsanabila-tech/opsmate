import type { RequestHandler } from 'express';
import type { UserRole } from '../generated/prisma/client.js';
import { AppError } from '../errors/app-error.js';
import { request } from 'node:http';

export function authorizeRoles(...allowedRoles: UserRole[]): RequestHandler {
  return (request, _response, next): void => {
    if (!request.auth) {
      next(new AppError(401, 'Authentication diperlukan', 'AUTHENTICATION_REQUIRED'));

      return;
    }

    if (!allowedRoles.includes(request.auth.role)) {
      next(new AppError(403, 'Kamu tidak memiliki izin untuk mengakses fitur ini', 'FORBIDDEN'));

      return;
    }

    next();
  };
}
