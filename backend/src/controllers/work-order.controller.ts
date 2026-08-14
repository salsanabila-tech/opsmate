import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { createWorkOrder, listWorkOrders } from '../services/work-order.service.js';
import { createWorkOrderBodySchema, listWorkOrdersQuerySchema } from '../validations/work-order.validation.js';

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
export async function listWorkOrderssController(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listWorkOrdersQuerySchema.parse(req.query);

    const result = await listWorkOrders(query);

    return res.status(200).json({
      status: true,
      message: 'Work Orders berhasil diambil',
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}
