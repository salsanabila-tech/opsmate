import { z } from 'zod';
import { WorkOrderStatus } from '../generated/prisma/client.js';

export const createWorkOrderBodySchema = z
  .object({
    customerId: z.string().uuid('Customer ID harus berupa UUID yang valid'),

    technicianId: z.union([z.string().uuid('Technician ID harus berupa UUID yang valid'), z.null()]).optional(),

    title: z.string().trim().min(3, 'Judul minimal 3 karakter').max(150, 'Judul maksimal 150 karakter'),

    description: z.string().trim().min(5, 'Deskripsi minimal 5 karakter').max(5000, 'Deskripsi maksimal 5000 karakter'),

    scheduledAt: z
      .string()
      .datetime({
        offset: true,
      })
      .refine((value) => new Date(value).getTime() > Date.now(), {
        message: 'Tanggal dan waktu yang dijadwalkan harus di masa depan',
      }),
  })
  .strict();

export const listWorkOrdersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).max(100).optional(),
    status: z.enum(WorkOrderStatus).optional(),
    technicianId: z.string().uuid().optional(),
    customerId: z.string().uuid().optional(),
    fromDate: z.iso.datetime().optional(),
    toDate: z.iso.datetime().optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (!data.fromDate || !data.toDate) {
        return true;
      }
      return new Date(data.fromDate) <= new Date(data.toDate);
    },
    {
      message: 'fromDate harus lebih kecil atau sama dengan toDate',
      path: ['fromDate'],
    },
  );

export type CreateWorkOrderBody = z.infer<typeof createWorkOrderBodySchema>;
export type ListWorkOrdersQuery = z.infer<typeof listWorkOrdersQuerySchema>;
