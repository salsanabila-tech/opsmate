import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { createWorkOrder, getWorkOrderDetails, listWorkOrders } from '../services/work-order.service.js';
import { createWorkOrderBodySchema, listWorkOrdersQuerySchema, workOrderIdParamSchema } from '../validations/work-order.validation.js';
import { success } from 'zod';

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
  const validationResult = listWorkOrdersQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    res.status(422).json({
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
    const result = await listWorkOrders(validationResult.data);

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

export async function getWorkOrderDetailsController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = workOrderIdParamSchema.safeParse(request.params);

  if (!validationResult.success) {
    response.status(422).json({
      success: false,
      message: 'Validasi parameter gagal',
      code: 'VALIDATION_ERROR',
      errors: validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'params',
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const workOrder = await getWorkOrderDetails({
      workOrderId: validationResult.data.workOrderId,
    });

    response.status(200).json({
      success: true,
      message: 'Detail work order berhasil diambil',
      data: workOrder,
    });
  } catch (error: unknown) {
    next(error);
  }
}
