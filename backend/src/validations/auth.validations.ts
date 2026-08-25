import { z } from 'zod';
export const loginBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .email('Format email tidak valid')
      .transform((email) => email.toLowerCase()),

    password: z.string().min(1, 'Password tidak boleh kosong').max(128, 'Password tidak boleh lebih dari 128 karakter'),
  })
  .strict();

export const refreshTokenBodySchema = z
  .object({
    refreshToken: z.string().trim().min(1, 'Refresh token wajib diisi'),
  })
  .strict();

export const registerCustomerBodySchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),

    email: z
      .string()
      .trim()
      .email('Format email tidak valid')
      .transform((email) => email.toLowerCase()),

    phone: z.string().trim().min(8, 'Nomor telepon minimal 8 karakter').max(20, 'Nomor telepon maksimal 20 karakter'),

    password: z.string().min(8, 'Password minimal 8 karakter').max(128, 'Password maksimal 128 karakter'),

    address: z.string().trim().min(5, 'Alamat minimal 5 karakter').max(500, 'Alamat maksimal 500 karakter'),
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;

export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>;

export type RegisterCustomerBody = z.infer<typeof registerCustomerBodySchema>;
