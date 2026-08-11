import type { NextFunction, Request, Response } from 'express';
import { createCustomer } from '../services/customer.service.js';
import { createCustomerBodySchema } from '../validations/customer.validation.js';

export async function createCustomerController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = createCustomerBodySchema.safeParse(request.body);

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
    const customer = await createCustomer({
      name: validationResult.data.name,
      phone: validationResult.data.phone,
      email: validationResult.data.email,
      address: validationResult.data.address,
      notes: validationResult.data.notes,
    });

    response.status(201).json({
      success: true,
      message: 'Customer berhasil dibuat',
      data: {
        customer,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
