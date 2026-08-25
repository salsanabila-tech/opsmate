import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import { AppError } from '../errors/app-error.js';

type CreatedCustomerInput = {
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  notes?: string | null;
};

type ListCustomerInput = {
  page: number;
  limit: number;
  search?: string;
};

type GetCustomerDetailsInput = {
  customerId: string;
};

type UpdateCustomerInput = {
  customerId: string;

  name?: string;

  phone?: string;

  email?: string | null;

  address?: string;

  notes?: string | null;
};

export async function createCustomer(input: CreatedCustomerInput) {
  return prisma.customer.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      address: input.address,
      notes: input.notes ?? null,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function listCustomers(input: ListCustomerInput) {
  const skip = (input.page - 1) * input.limit;

  const where: Prisma.CustomerWhereInput = input.search
    ? {
        OR: [{ name: { contains: input.search, mode: 'insensitive' } }, { phone: { contains: input.search } }, { email: { contains: input.search, mode: 'insensitive' } }],
      }
    : {};

  const [customers, total] = await prisma.$transaction([
    prisma.customer.findMany({
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
        phone: true,
        email: true,
        address: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / input.limit);

  return {
    customers,

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

export async function getCustomerDetails(input: GetCustomerDetailsInput) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: input.customerId,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!customer) {
    throw new AppError(404, 'Customer tidak ditemukan', 'CUSTOMER_NOT_FOUND');
  }

  return customer;
}

export async function updateCustomer(input: UpdateCustomerInput) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: input.customerId,
    },

    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new AppError(404, 'Customer tidak ditemukan', 'CUSTOMER_NOT_FOUND');
  }

  return prisma.customer.update({
    where: {
      id: input.customerId,
    },

    data: {
      ...(input.name !== undefined
        ? {
            name: input.name,
          }
        : {}),

      ...(input.phone !== undefined
        ? {
            phone: input.phone,
          }
        : {}),

      ...(input.email !== undefined
        ? {
            email: input.email,
          }
        : {}),

      ...(input.address !== undefined
        ? {
            address: input.address,
          }
        : {}),

      ...(input.notes !== undefined
        ? {
            notes: input.notes,
          }
        : {}),
    },

    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
