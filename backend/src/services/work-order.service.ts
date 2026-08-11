import { randomUUID } from 'crypto';

import { UserRole, WorkOrderStatus } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/app-error.js';

function generateWorkOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const suffix = randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();

  return `WO-${date}-${suffix}`;
}

type CreateWorkOrderInput = {
  customerId: string;
  technicianId?: string | null;
  title: string;
  description: string;
  scheduledAt: Date;
  createdById: string;
};

export async function createWorkOrder(input: CreateWorkOrderInput) {
  return prisma.$transaction(async (transaction) => {
    const customer = await transaction.customer.findUnique({
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

    if (input.technicianId) {
      const technician = await transaction.user.findUnique({
        where: {
          id: input.technicianId,
        },
        select: {
          id: true,
          role: true,
          isActive: true,
        },
      });

      if (!technician || technician.role !== UserRole.TECHNICIAN) {
        throw new AppError(404, 'Teknisi tidak ditemukan', 'TECHNICIAN_NOT_FOUND');
      }

      if (!technician.isActive) {
        throw new AppError(409, 'Teknisi sedang tidak aktif', 'TECHNICIAN_INACTIVE');
      }
    }

    const initialStatus = input.technicianId ? WorkOrderStatus.ASSIGNED : WorkOrderStatus.PENDING;

    const workOrderNumber = generateWorkOrderNumber();

    const workOrder = await transaction.workOrder.create({
      data: {
        workOrderNumber,
        customerId: input.customerId,
        technicianId: input.technicianId ?? null,
        title: input.title,
        description: input.description,
        scheduledAt: input.scheduledAt,
        status: initialStatus,
        completedAt: null,
        createdById: input.createdById,
      },

      select: {
        id: true,
        workOrderNumber: true,
        title: true,
        description: true,
        scheduledAt: true,
        status: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,

        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
          },
        },

        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await transaction.workOrderStatusHistory.create({
      data: {
        workOrderId: workOrder.id,

        previousStatus: null,

        newStatus: initialStatus,

        changedById: input.createdById,

        notes: input.technicianId ? 'Work order dibuat dan ditugaskan ke teknisi' : 'Work order dibuat',
      },
    });

    return workOrder;
  });
}
