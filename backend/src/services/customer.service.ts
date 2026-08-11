import { prisma } from '../lib/prisma.js';

type CreatedCustomerInput = {
  name: string;
  phone: string;
  email?: string | null;
  address: string;
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
