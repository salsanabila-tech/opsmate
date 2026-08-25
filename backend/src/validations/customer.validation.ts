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

export const listCustomerQuerySchema = z
  .object({
    page: z.coerce.number().int('Page harus berupa bilangan bulat').min(1, 'Halaman minimal 1').default(1),

    limit: z.coerce.number().int('Limit harus berupa bilangan bulat').min(1, 'Limit minimal 1').max(100, 'Limit maksimal 100').default(10),

    search: z
      .string()
      .trim()
      .max(100, 'Search maksimal 100 karakter')
      .optional()
      .transform((value) => (value === '' ? undefined : value)),
  })
  .strict();

export type ListCustomerQuery = z.infer<typeof listCustomerQuerySchema>;

export const customerIdParamSchema = z
  .object({
    customerId: z.string().uuid('customerId harus berupa UUID yang valid'),
  })
  .strict();

export type CustomerIdParams = z.infer<typeof customerIdParamSchema>;

export const updateCustomerBodySchema = createCustomerBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'Minimal satu field harus diperbarui',
});

export type UpdateCustomerBody = z.infer<typeof updateCustomerBodySchema>;
