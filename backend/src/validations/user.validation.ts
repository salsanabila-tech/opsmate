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

export const listTechniciansQuerySchema = z
  .object({
    page: z.coerce.number().int('page harus berupa bilangan bulat').min(1, 'Page minimal 1').default(1),

    limit: z.coerce.number().int('Limit harus berupa bilangan bulat').min(1, 'Limit minimal 1').max(100, 'Limit maximal 100').default(10),

    search: z
      .string()
      .trim()
      .max(100, 'Pencarian maksimal 100 karakter')
      .optional()
      .transform((value) => (value === '' ? undefined : value)),

    status: z.enum(['all', 'active', 'inactive']).default('all'),
  })
  .strict();

export type ListTechniciansQuery = z.infer<typeof listTechniciansQuerySchema>;

export const technicianIdParamSchema = z
  .object({
    technicianId: z.string().uuid('technicianId harus berupa UUID yang valid'),
  })
  .strict();

export type TechnicianIdParam = z.infer<typeof technicianIdParamSchema>;

export const updateTechnicianStatusBodySchema = z
  .object({
    isActive: z.boolean({
      message: 'isActive harus berupa boolean',
    }),
  })
  .strict();

export type UpdateTechnicianStatusBody = z.infer<typeof updateTechnicianStatusBodySchema>;
