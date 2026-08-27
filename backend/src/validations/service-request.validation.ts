import { z } from 'zod';

const serviceRequestStatusSchema = z.enum(['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'CONVERTED']);

export const createServiceRequestBodySchema = z
  .object({
    serviceType: z.string().trim().min(2, 'Jenis service minimal 2 karakter').max(100, 'Jenis service maksimal 100 karakter'),

    title: z.string().trim().min(3, 'Judul minimal 3 karakter').max(150, 'Judul maksimal 150 karakter'),

    description: z.string().trim().min(5, 'Deskripsi minimal 5 karakter').max(5000, 'Deskripsi maksimal 5000 karakter'),

    serviceAddress: z.string().trim().min(5, 'Alamat service minimal 5 karakter').max(500, 'Alamat service maksimal 500 karakter'),

    contactPhone: z.string().trim().min(8, 'Nomor telepon minimal 8 karakter').max(20, 'Nomor telepon maksimal 20 karakter'),

    preferredSchedule: z
      .union([
        z.coerce.date().refine((date) => date.getTime() > Date.now(), {
          message: 'Jadwal harus berada di masa depan',
        }),

        z.null(),
      ])
      .optional(),
  })
  .strict();

export const listServiceRequestsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => (value === '' ? undefined : value)),

    status: z.union([z.literal('all'), serviceRequestStatusSchema]).default('all'),
  })
  .strict();

export const listMyServiceRequestsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    status: z.union([z.literal('all'), serviceRequestStatusSchema]).default('all'),
  })
  .strict();

export const serviceRequestIdParamSchema = z
  .object({
    serviceRequestId: z.string().uuid('serviceRequestId harus berupa UUID valid'),
  })
  .strict();

export const updateServiceRequestStatusBodySchema = z
  .object({
    status: z.enum(['UNDER_REVIEW', 'ACCEPTED', 'REJECTED']),

    notes: z.string().trim().min(1, 'Catatan tidak boleh kosong').max(1000, 'Catatan maksimal 1000 karakter').optional(),
  })
  .strict()
  .refine((data) => data.status !== 'REJECTED' || Boolean(data.notes?.trim()), {
    message: 'Alasan penolakan wajib diisi',
    path: ['notes'],
  });

export const convertServiceRequestBodySchema = z
  .object({
    technicianId: z.string().uuid('Technician ID harus berupa UUID valid'),

    scheduledAt: z
      .string()
      .datetime({
        offset: true,
      })
      .refine((value) => new Date(value).getTime() > Date.now(), {
        message: 'Jadwal Work Order harus berada di masa depan',
      }),
  })
  .strict();

export const cancelServiceRequestBodySchema = z
  .object({
    notes: z.string().trim().min(1).max(500).optional(),
  })
  .strict();
