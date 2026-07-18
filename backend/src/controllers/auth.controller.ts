import type { NextFunction, Request, Response } from 'express';
import { login } from '../services/auth.service.js';
import { loginBodySchema } from '../validations/auth.validations.js';
import { success } from 'zod';
import { access } from 'node:fs';

export async function loginController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = loginBodySchema.safeParse(request.body);

  if (!validationResult.success) {
    response.status(422).json({
      success: false,
      message: 'Validasi data gagal',
      code: 'VALIDATION_ERROR',
      errors: validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    });

    return;
  }

  try {
    const result = await login({
      email: validationResult.data.email,
      password: validationResult.data.password,
      userAgent: request.get('user-agent') ?? null,
      ipAddress: request.ip ?? null,
    });

    response.status(200).json({
      success: true,
      message: 'Login Berhasil',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
