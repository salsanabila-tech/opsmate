import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { createWorkOrder } from '../services/work-order.service.js';
import { createWorkOrderBodySchema } from '../validations/work-order.validation.js';

export async function createWorkOrderController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = createWorkOrderBodySchema.safeParse(request.body);

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

  if (!request.auth) {
    next(new AppError(401, 'Autentikasi diperlukan', 'AUTHENTICATION_REQUIRED'));
    return;
  }

  try {
    const workOrder = await createWorkOrder({
      customerId: validationResult.data.customerId,
      technicianId: validationResult.data.technicianId,
      title: validationResult.data.title,
      description: validationResult.data.description,
      scheduledAt: new Date(validationResult.data.scheduledAt),
      createdById: request.auth.userId,
    });

    response.status(201).json({
      success: true,
      message: 'Work order berhasil dibuat',
      data: workOrder,
    });
  } catch (error) {
    next(error);
  }
}
