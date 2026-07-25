import type { NextFunction, Request, Response } from 'express';
import { createTechnician, listTechnicians } from '../services/user.service.js';
import { createTechnicianBodySchema, listTechniciansQuerySchema } from '../validations/user.validation.js';
import { success } from 'zod';

export async function createTechnicianController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = createTechnicianBodySchema.safeParse(request.body);

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
    const technician = await createTechnician({
      name: validationResult.data.name,
      email: validationResult.data.email,
      phone: validationResult.data.phone,
      password: validationResult.data.password,
    });

    response.status(201).json({
      success: true,
      message: 'Akun teknisi berhasil dibuat',
      data: {
        technician,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function listTechniciansController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = listTechniciansQuerySchema.safeParse(request.query);

  if (!validationResult.success) {
    response.status(422).json({
      success: false,
      message: 'Validasi query gagal',
      code: 'VALIDATION_ERROR',
      errors: validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'query',
        message: issue.message,
      })),
    });

    return;
  }
  try {
    const result = await listTechnicians({
      page: validationResult.data.page,
      limit: validationResult.data.limit,
      search: validationResult.data.search,
      status: validationResult.data.status,
    });

    response.status(200).json({
      success: true,
      message: 'Daftar teknisi berhasil diambil',
      data: {
        technicians: result.technicians,
        pagination: result.pagination,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
