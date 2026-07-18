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

export type LoginBody = z.infer<typeof loginBodySchema>;
