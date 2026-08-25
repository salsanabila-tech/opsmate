import type { NextFunction, Request, Response } from 'express';
import { getCurrentUser, login, logoutCurrentSession, refreshAuthentication, registerCustomer } from '../services/auth.service.js';
import { loginBodySchema, refreshTokenBodySchema, registerCustomerBodySchema } from '../validations/auth.validations.js';
import { AppError } from '../errors/app-error.js';

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

export async function refreshTokenController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = refreshTokenBodySchema.safeParse(request.body);

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
    const result = await refreshAuthentication({
      refreshToken: validationResult.data.refreshToken,
    });

    response.status(200).json({
      success: true,
      message: 'Token berhasil diperbarui',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshTokenHash,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getMeController(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    if (!request.auth) {
      throw new AppError(401, 'Authentication diperlukan', 'AUTHENTICATION_REQUIRED');
    }

    const user = await getCurrentUser(request.auth.userId);

    response.status(200).json({
      success: true,
      message: 'Profil pengguna berhasil diambil',
      data: {
        user,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function logoutController(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    if (!request.auth) {
      throw new AppError(401, 'Authentication diperlukan', 'AUTHENTICATION_REQUIRED');
    }

    await logoutCurrentSession({
      userId: request.auth.userId,
      sessionId: request.auth.sessionId,
    });

    response.status(200).json({
      success: true,
      message: 'Logout Berhasil',
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function registerCustomerController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = registerCustomerBodySchema.safeParse(request.body);

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
    const result = await registerCustomer(validationResult.data);

    response.status(201).json({
      success: true,

      message: 'Registrasi customer berhasil',

      data: {
        user: result.user,

        customer: result.customer,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
