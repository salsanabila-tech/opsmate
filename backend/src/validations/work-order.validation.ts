import { z } from 'zod';

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

export type CreateWorkOrderBody = z.infer<typeof createWorkOrderBodySchema>;
