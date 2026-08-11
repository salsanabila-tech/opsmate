import type { NextFunction, Request, Response } from 'express';
import { createCustomer, getCustomerDetails, listCustomers } from '../services/customer.service.js';
import { createCustomerBodySchema, customerIdParamSchema, listCustomerQuerySchema } from '../validations/customer.validation.js';

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

export async function listCustomersController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = listCustomerQuerySchema.safeParse(request.query);

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
    const result = await listCustomers({
      page: validationResult.data.page,
      limit: validationResult.data.limit,
      search: validationResult.data.search,
    });

    response.status(200).json({
      success: true,
      message: 'Daftar customer berhasil diambil',
      data: {
        customers: result.customers,
        pagination: result.pagination,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getCustomerDetailsController(request: Request, response: Response, next: NextFunction): Promise<void> {
  const validationResult = customerIdParamSchema.safeParse(request.params);

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
    const customer = await getCustomerDetails({
      customerId: validationResult.data.customerId,
    });

    response.status(200).json({
      success: true,
      message: 'Detail customer berhasil diambil',
      data: {
        customer,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
