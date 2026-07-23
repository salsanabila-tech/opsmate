import * as argon2 from 'argon2';
import { Prisma, UserRole } from '../generated/prisma/client.js';
import { AppError } from '../errors/app-error.js';
import { prisma } from '../lib/prisma.js';

type CreatedTechnicianInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

export async function createTechnician(input: CreatedTechnicianInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new AppError(409, 'Email sudah digunakan', 'EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await argon2.hash(input.password);

  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        passwordHash,
        role: UserRole.TECHNICIAN,
        isActive: true,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Email sudah digunakan', 'EMAIL_ALREADY_EXISTS');
    }

    throw error;
  }
}
