import { z } from 'zod';

export const createCustomerBodySchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),

    phone: z.string().trim().min(8, 'Nomor telepon minimal 8 karakter').max(20, 'Nomor telepon maksimal 20 karakter'),

    email: z
      .union([
        z
          .string()
          .trim()
          .email('Format email tidak valid')
          .transform((email) => email.toLowerCase()),
        z.null(),
      ])
      .optional(),

    address: z.string().trim().min(5, 'Alamat minimal 5 karakter').max(500, 'Alamat maksimal 500 karakter'),

    notes: z.union([z.string().trim().max(1000, 'Catatan maksimal 1000 karakter'), z.null()]).optional(),
  })
  .strict();

export type CreateCustomerBody = z.infer<typeof createCustomerBodySchema>;
