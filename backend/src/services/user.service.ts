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

type ListTechniciansInput = {
  page: number;
  limit: number;
  search?: string;
  status: 'all' | 'active' | 'inactive';
};

type GetTechnicianDetailInput = {
  technicianId: string;
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

export async function listTechnicians(input: ListTechniciansInput) {
  const skip = (input.page - 1) * input.limit;

  const where: Prisma.UserWhereInput = {
    role: UserRole.TECHNICIAN,

    ...(input.search
      ? {
          OR: [
            {
              name: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}),

    ...(input.status === 'all'
      ? {}
      : {
          isActive: input.status === 'active',
        }),
  };

  const [technicians, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: input.limit,

      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],

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
    }),

    prisma.user.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / input.limit);

  return {
    technicians,

    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages,
      hasPreviousPage: input.page > 1,
      hasNextPage: input.page < totalPages,
    },
  };
}

export async function getTechnicianDetail(input: GetTechnicianDetailInput) {
  const technician = await prisma.user.findFirst({
    where: {
      id: input.technicianId,
      role: UserRole.TECHNICIAN,
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

      _count: {
        select: {
          assignedWorkOrders: true,
        },
      },
    },
  });

  if (!technician) {
    throw new AppError(404, 'Teknisi tidak ditemukan', 'TECHNICIAN_NOT_FOUND');
  }

  return {
    id: technician.id,
    name: technician.name,
    email: technician.email,
    phone: technician.phone,
    role: technician.role,
    isActive: technician.isActive,
    createdAt: technician.createdAt,
    updatedAt: technician.updatedAt,
    assignedWorkOrdersCount: technician._count.assignedWorkOrders,
  };
}
