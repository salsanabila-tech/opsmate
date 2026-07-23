import { z } from 'zod';

export const createTechnicianBodySchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),

    email: z
      .string()
      .trim()
      .email('Format email tidak valid')
      .transform((email) => email.toLowerCase()),

    phone: z.string().trim().min(8, 'Nomor telepon minimal 8 karakter').max(20, 'Nomor telepon maksimal 20 karakter').optional(),

    password: z.string().min(8, 'Password minimal 8 karakter').max(128, 'Password maksimal 128 karakter'),
  })

  .strict();

export type CreateTechnicianBody = z.infer<typeof createTechnicianBodySchema>;
