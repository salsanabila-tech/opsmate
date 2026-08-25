import type { NextFunction, Request, Response } from 'express';

import type { ZodError } from 'zod';

import { AppError } from '../errors/app-error.js';

import { cancelMyServiceRequest, createServiceRequest, getMyServiceRequest, getServiceRequestDetails, listMyServiceRequests, listServiceRequests, updateServiceRequestStatus } from '../services/service-request.service.js';

import {
  cancelServiceRequestBodySchema,
  createServiceRequestBodySchema,
  listMyServiceRequestsQuerySchema,
  listServiceRequestsQuerySchema,
  serviceRequestIdParamSchema,
  updateServiceRequestStatusBodySchema,
} from '../validations/service-request.validation.js';

function sendValidationError(response: Response, error: ZodError): void {
  response.status(422).json({
    success: false,

    message: 'Validasi data gagal',

    code: 'VALIDATION_ERROR',

    errors: error.issues.map((issue) => ({
      field: issue.path.join('.') || 'request',

      message: issue.message,
    })),
  });
}

export async function createServiceRequestController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validation = createServiceRequestBodySchema.safeParse(request.body);

  if (!validation.success) {
    sendValidationError(response, validation.error);

    return;
  }

  try {
    if (!request.auth) {
      throw new AppError(401, 'Authentication diperlukan', 'AUTHENTICATION_REQUIRED');
    }

    const result = await createServiceRequest({
      userId: request.auth.userId,

      ...validation.data,
    });

    response.status(201).json({
      success: true,

      message: 'Service request berhasil dibuat',

      data: {
        serviceRequest: result,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function listMyServiceRequestsController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validation = listMyServiceRequestsQuerySchema.safeParse(request.query);

  if (!validation.success) {
    sendValidationError(response, validation.error);

    return;
  }

  try {
    if (!request.auth) {
      throw new AppError(401, 'Authentication diperlukan', 'AUTHENTICATION_REQUIRED');
    }

    const result = await listMyServiceRequests({
      userId: request.auth.userId,

      ...validation.data,
    });

    response.status(200).json({
      success: true,

      message: 'Daftar service request berhasil diambil',

      data: result,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getMyServiceRequestController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validation = serviceRequestIdParamSchema.safeParse(request.params);

  if (!validation.success) {
    sendValidationError(response, validation.error);

    return;
  }

  try {
    if (!request.auth) {
      throw new AppError(401, 'Authentication diperlukan', 'AUTHENTICATION_REQUIRED');
    }

    const result = await getMyServiceRequest({
      userId: request.auth.userId,

      serviceRequestId: validation.data.serviceRequestId,
    });

    response.status(200).json({
      success: true,

      message: 'Detail service request berhasil diambil',

      data: {
        serviceRequest: result,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function cancelMyServiceRequestController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const paramsValidation = serviceRequestIdParamSchema.safeParse(request.params);

  if (!paramsValidation.success) {
    sendValidationError(response, paramsValidation.error);

    return;
  }

  const bodyValidation = cancelServiceRequestBodySchema.safeParse(request.body);

  if (!bodyValidation.success) {
    sendValidationError(response, bodyValidation.error);

    return;
  }

  try {
    if (!request.auth) {
      throw new AppError(401, 'Authentication diperlukan', 'AUTHENTICATION_REQUIRED');
    }

    const result = await cancelMyServiceRequest({
      userId: request.auth.userId,

      serviceRequestId: paramsValidation.data.serviceRequestId,

      notes: bodyValidation.data.notes,
    });

    response.status(200).json({
      success: true,

      message: 'Service request berhasil dibatalkan',

      data: {
        serviceRequest: result,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function listServiceRequestsController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validation = listServiceRequestsQuerySchema.safeParse(request.query);

  if (!validation.success) {
    sendValidationError(response, validation.error);

    return;
  }

  try {
    const result = await listServiceRequests(validation.data);

    response.status(200).json({
      success: true,

      message: 'Daftar service request berhasil diambil',

      data: result,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getServiceRequestDetailsController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validation = serviceRequestIdParamSchema.safeParse(request.params);

  if (!validation.success) {
    sendValidationError(response, validation.error);

    return;
  }

  try {
    const result = await getServiceRequestDetails(validation.data.serviceRequestId);

    response.status(200).json({
      success: true,

      message: 'Detail service request berhasil diambil',

      data: {
        serviceRequest: result,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateServiceRequestStatusController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const paramsValidation = serviceRequestIdParamSchema.safeParse(request.params);

  if (!paramsValidation.success) {
    sendValidationError(response, paramsValidation.error);

    return;
  }

  const bodyValidation = updateServiceRequestStatusBodySchema.safeParse(request.body);

  if (!bodyValidation.success) {
    sendValidationError(response, bodyValidation.error);

    return;
  }

  try {
    if (!request.auth) {
      throw new AppError(401, 'Authentication diperlukan', 'AUTHENTICATION_REQUIRED');
    }

    const result = await updateServiceRequestStatus({
      serviceRequestId: paramsValidation.data.serviceRequestId,

      adminUserId: request.auth.userId,

      status: bodyValidation.data.status,

      notes: bodyValidation.data.notes,
    });

    response.status(200).json({
      success: true,

      message: 'Status service request berhasil diperbarui',

      data: {
        serviceRequest: result,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
