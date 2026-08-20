import { randomUUID } from 'crypto';
import { ListTechnicianWorkOrdersQuerySchema, ListWorkOrdersQuery } from '../validations/work-order.validation.js';
import { UserRole, WorkOrderStatus } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/app-error.js';
import { meta } from 'zod/v4/core';

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

type GetWorkOrderDetailsInput = {
  workOrderId: string;
};

type ListTechnicianWorkOrdersInput = ListTechnicianWorkOrdersQuerySchema & {
  technicianId: string;
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

export async function listWorkOrders(query: ListWorkOrdersQuery) {
  const { page, limit, search, status, technicianId, customerId, fromDate, toDate } = query;

  const skip = (page - 1) * limit;

  const where = {
    ...(search
      ? {
          OR: [
            {
              workOrderNumber: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              title: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),

    ...(status
      ? {
          status,
        }
      : {}),

    ...(technicianId
      ? {
          technicianId,
        }
      : {}),

    ...(customerId
      ? {
          customerId,
        }
      : {}),

    ...(fromDate || toDate
      ? {
          scheduledAt: {
            ...(fromDate
              ? {
                  gte: new Date(fromDate),
                }
              : {}),

            ...(toDate
              ? {
                  lte: new Date(toDate),
                }
              : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      skip,
      take: limit,

      orderBy: [
        {
          scheduledAt: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },

        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    }),

    prisma.workOrder.count({
      where,
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function listTechnicianWorkOrders(input: ListTechnicianWorkOrdersInput) {
  const { technicianId, page, limit, search, status, fromDate, toDate } = input;

  const skip = (page - 1) * limit;

  const where = {
    technicianId,

    ...(search
      ? {
          OR: [
            {
              workOrderNumber: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              title: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),

    ...(status
      ? {
          status,
        }
      : {}),

    ...(fromDate || toDate
      ? {
          scheduledAt: {
            ...(fromDate
              ? {
                  gte: new Date(fromDate),
                }
              : {}),

            ...(toDate
              ? {
                  lte: new Date(toDate),
                }
              : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,

      skip,

      take: limit,

      orderBy: [
        {
          scheduledAt: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],

      select: {
        id: true,
        workOrderNumber: true,
        title: true,
        description: true,
        scheduledAt: true,
        status: true,
        completedAt: true,
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
      },
    }),

    prisma.workOrder.count({
      where,
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    items,

    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getWorkOrderDetails(input: GetWorkOrderDetailsInput) {
  const workOrder = await prisma.workOrder.findUnique({
    where: {
      id: input.workOrderId,
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
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      technician: {
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
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      statusHistories: {
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          previousStatus: true,
          newStatus: true,
          notes: true,
          createdAt: true,
          changedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      attachments: {
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          fileUrl: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          attachmentType: true,
          description: true,
          createdAt: true,
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!workOrder) {
    throw new AppError(404, 'Work order tidak ditemukan', 'WORK_ORDER_NOT_FOUND');
  }
  return {
    ...workOrder,
    attachments: workOrder.attachments.map((attachment) => ({
      ...attachment,
      fileSize: attachment.fileSize.toString(),
    })),
  };
}
