import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { createTechnicianWorkOrderAttachment, createWorkOrder, getTechnicianWorkOrderDetails, getWorkOrderDetails, listTechnicianWorkOrders, listWorkOrders, updateTechnicianWorkOrderStatus } from '../services/work-order.service.js';
import {
  createTechnicianWorkOrderAttachmentBodySchema,
  createWorkOrderBodySchema,
  listTechnicianWorkOrdersQuerySchema,
  listWorkOrdersQuerySchema,
  updateTechnicianWorkOrderStatusBodySchema,
  workOrderIdParamSchema,
} from '../validations/work-order.validation.js';
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
export async function listWorkOrdersController(req: Request, res: Response, next: NextFunction) {
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
      success: true,
      message: 'Work Orders berhasil diambil',
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function listTechnicianWorkOrdersController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = listTechnicianWorkOrdersQuerySchema.safeParse(request.query);

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

  if (!request.auth) {
    next(new AppError(401, 'Autentikasi diperlukan', 'AUTHENTICATION_REQUIRED'));

    return;
  }

  try {
    const result = await listTechnicianWorkOrders({
      technicianId: request.auth.userId,

      ...validationResult.data,
    });

    response.status(200).json({
      success: true,

      message: 'Daftar tugas teknisi berhasil diambil',

      data: result.items,

      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTechnicianWorkOrderDetailsController(request: Request, response: Response, next: NextFunction): Promise<void> {
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

  if (!request.auth) {
    next(new AppError(401, 'Autentikasi diperlukan', 'AUTHENTICATION_REQUIRED'));

    return;
  }

  try {
    const workOrder = await getTechnicianWorkOrderDetails({
      workOrderId: validationResult.data.workOrderId,
      technicianId: request.auth.userId,
    });

    response.status(200).json({
      success: true,
      message: 'Detail tugas teknisi berhasil diambil',
      data: workOrder,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateTechnicianWorkOrderStatusController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const paramsValidation = workOrderIdParamSchema.safeParse(request.params);

  if (!paramsValidation.success) {
    response.status(422).json({
      success: false,
      message: 'Validasi parameter gagal',
      code: 'VALIDATION_ERROR',

      errors: paramsValidation.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'params',
        message: issue.message,
      })),
    });

    return;
  }
  const bodyValidation = updateTechnicianWorkOrderStatusBodySchema.safeParse(request.body);

  if (!bodyValidation.success) {
    response.status(422).json({
      success: false,
      message: 'Validasi data gagal',
      code: 'VALIDATION_ERROR',

      errors: bodyValidation.error.issues.map((issue) => ({
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
    const workOrder = await updateTechnicianWorkOrderStatus({
      workOrderId: paramsValidation.data.workOrderId,
      technicianId: request.auth.userId,
      status: bodyValidation.data.status,
      notes: bodyValidation.data.notes,
    });

    response.status(200).json({
      success: true,
      message: 'Status work order berhasil diperbarui',
      data: workOrder,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function createTechnicianWorkOrderAttachmentController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const paramsValidation = workOrderIdParamSchema.safeParse(request.params);

  if (!paramsValidation.success) {
    response.status(422).json({
      success: false,
      message: 'Validasi parameter gagal',
      code: 'VALIDATION_ERROR',

      errors: paramsValidation.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'params',

        message: issue.message,
      })),
    });

    return;
  }

  const bodyValidation = createTechnicianWorkOrderAttachmentBodySchema.safeParse(request.body);

  if (!bodyValidation.success) {
    response.status(422).json({
      success: false,
      message: 'Validasi data gagal',
      code: 'VALIDATION_ERROR',

      errors: bodyValidation.error.issues.map((issue) => ({
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

  if (!request.file) {
    next(new AppError(422, 'File attachment wajib disertakan', 'ATTACHMENT_FILE_REQUIRED'));

    return;
  }

  try {
    const attachment = await createTechnicianWorkOrderAttachment({
      workOrderId: paramsValidation.data.workOrderId,

      technicianId: request.auth.userId,

      attachmentType: bodyValidation.data.attachmentType,

      description: bodyValidation.data.description,

      file: {
        buffer: request.file.buffer,

        originalName: request.file.originalname,

        size: request.file.size,
      },
    });

    response.status(201).json({
      success: true,

      message: 'Attachment work order berhasil diunggah',

      data: attachment,
    });
  } catch (error: unknown) {
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
