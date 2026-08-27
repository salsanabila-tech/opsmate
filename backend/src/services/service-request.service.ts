import { randomUUID } from 'node:crypto';

import { Prisma, ServiceRequestStatus, UserRole, WorkOrderStatus } from '../generated/prisma/client.js';

import { AppError } from '../errors/app-error.js';

import { prisma } from '../lib/prisma.js';

function generateServiceRequestNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const suffix = randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();

  return `SR-${date}-${suffix}`;
}

function generateWorkOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const suffix = randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();

  return `WO-${date}-${suffix}`;
}

type StatusFilter = ServiceRequestStatus | 'all';

type CreateServiceRequestInput = {
  userId: string;
  serviceType: string;
  title: string;
  description: string;
  serviceAddress: string;
  contactPhone: string;
  preferredSchedule?: Date | null;
};

type ListMyServiceRequestsInput = {
  userId: string;
  page: number;
  limit: number;
  status: StatusFilter;
};

type GetMyServiceRequestInput = {
  userId: string;
  serviceRequestId: string;
};

type CancelMyServiceRequestInput = {
  userId: string;
  serviceRequestId: string;
  notes?: string;
};

type ListServiceRequestsInput = {
  page: number;
  limit: number;
  search?: string;
  status: StatusFilter;
};

type AdminServiceRequestStatus = 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';

type UpdateServiceRequestStatusInput = {
  serviceRequestId: string;
  adminUserId: string;
  status: AdminServiceRequestStatus;
  notes?: string;
};

type ConvertServiceRequestInput = {
  serviceRequestId: string;

  adminUserId: string;

  technicianId: string;

  scheduledAt: Date;
};

async function findCustomerByUserId(userId: string) {
  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },

    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new AppError(409, 'Profil customer belum tersedia', 'CUSTOMER_PROFILE_REQUIRED');
  }

  return customer;
}

export async function createServiceRequest(input: CreateServiceRequestInput) {
  const customer = await findCustomerByUserId(input.userId);

  return prisma.$transaction(async (transaction) => {
    const requestNumber = generateServiceRequestNumber();

    const serviceRequest = await transaction.serviceRequest.create({
      data: {
        requestNumber,

        customerId: customer.id,

        serviceType: input.serviceType,

        title: input.title,

        description: input.description,

        serviceAddress: input.serviceAddress,

        contactPhone: input.contactPhone,

        preferredSchedule: input.preferredSchedule ?? null,

        status: ServiceRequestStatus.SUBMITTED,

        workOrderId: null,
      },

      select: {
        id: true,
        requestNumber: true,
        serviceType: true,
        title: true,
        description: true,
        serviceAddress: true,
        contactPhone: true,
        preferredSchedule: true,
        status: true,
        workOrderId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await transaction.serviceRequestStatusHistory.create({
      data: {
        serviceRequestId: serviceRequest.id,

        previousStatus: null,

        newStatus: ServiceRequestStatus.SUBMITTED,

        changedById: input.userId,

        notes: 'Service request dibuat oleh customer',
      },
    });

    return serviceRequest;
  });
}

export async function listMyServiceRequests(input: ListMyServiceRequestsInput) {
  const customer = await findCustomerByUserId(input.userId);

  const skip = (input.page - 1) * input.limit;

  const where: Prisma.ServiceRequestWhereInput = {
    customerId: customer.id,

    ...(input.status === 'all'
      ? {}
      : {
          status: input.status,
        }),
  };

  const [serviceRequests, total] = await prisma.$transaction([
    prisma.serviceRequest.findMany({
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
        requestNumber: true,
        serviceType: true,
        title: true,
        preferredSchedule: true,
        status: true,
        workOrderId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.serviceRequest.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / input.limit);

  return {
    serviceRequests,

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

export async function getMyServiceRequest(input: GetMyServiceRequestInput) {
  const customer = await findCustomerByUserId(input.userId);

  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: {
      id: input.serviceRequestId,

      customerId: customer.id,
    },

    select: {
      id: true,
      requestNumber: true,
      serviceType: true,
      title: true,
      description: true,
      serviceAddress: true,
      contactPhone: true,
      preferredSchedule: true,
      status: true,
      workOrderId: true,
      createdAt: true,
      updatedAt: true,

      workOrder: {
        select: {
          id: true,
          workOrderNumber: true,
          status: true,
          scheduledAt: true,

          technician: {
            select: {
              id: true,
              name: true,
            },
          },
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
              role: true,
            },
          },
        },
      },
    },
  });

  if (!serviceRequest) {
    throw new AppError(404, 'Service request tidak ditemukan', 'SERVICE_REQUEST_NOT_FOUND');
  }

  return serviceRequest;
}

export async function cancelMyServiceRequest(input: CancelMyServiceRequestInput) {
  const customer = await findCustomerByUserId(input.userId);

  return prisma.$transaction(async (transaction) => {
    const serviceRequest = await transaction.serviceRequest.findFirst({
      where: {
        id: input.serviceRequestId,

        customerId: customer.id,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!serviceRequest) {
      throw new AppError(404, 'Service request tidak ditemukan', 'SERVICE_REQUEST_NOT_FOUND');
    }

    const allowed = serviceRequest.status === ServiceRequestStatus.SUBMITTED || serviceRequest.status === ServiceRequestStatus.UNDER_REVIEW;

    if (!allowed) {
      throw new AppError(409, 'Service request pada status ini tidak dapat dibatalkan', 'SERVICE_REQUEST_CANNOT_BE_CANCELLED');
    }

    const updated = await transaction.serviceRequest.update({
      where: {
        id: serviceRequest.id,
      },

      data: {
        status: ServiceRequestStatus.CANCELLED,
      },

      select: {
        id: true,
        requestNumber: true,
        status: true,
        updatedAt: true,
      },
    });

    await transaction.serviceRequestStatusHistory.create({
      data: {
        serviceRequestId: serviceRequest.id,

        previousStatus: serviceRequest.status,

        newStatus: ServiceRequestStatus.CANCELLED,

        changedById: input.userId,

        notes: input.notes ?? 'Service request dibatalkan oleh customer',
      },
    });

    return updated;
  });
}

export async function listServiceRequests(input: ListServiceRequestsInput) {
  const skip = (input.page - 1) * input.limit;

  const where: Prisma.ServiceRequestWhereInput = {
    ...(input.status === 'all'
      ? {}
      : {
          status: input.status,
        }),

    ...(input.search
      ? {
          OR: [
            {
              requestNumber: {
                contains: input.search,

                mode: 'insensitive',
              },
            },

            {
              serviceType: {
                contains: input.search,

                mode: 'insensitive',
              },
            },

            {
              title: {
                contains: input.search,

                mode: 'insensitive',
              },
            },

            {
              customer: {
                name: {
                  contains: input.search,

                  mode: 'insensitive',
                },
              },
            },

            {
              customer: {
                phone: {
                  contains: input.search,
                },
              },
            },

            {
              customer: {
                email: {
                  contains: input.search,

                  mode: 'insensitive',
                },
              },
            },
          ],
        }
      : {}),
  };

  const [serviceRequests, total] = await prisma.$transaction([
    prisma.serviceRequest.findMany({
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
        requestNumber: true,
        serviceType: true,
        title: true,
        preferredSchedule: true,
        status: true,
        workOrderId: true,
        createdAt: true,
        updatedAt: true,

        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    }),

    prisma.serviceRequest.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / input.limit);

  return {
    serviceRequests,

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

export async function getServiceRequestDetails(serviceRequestId: string) {
  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: {
      id: serviceRequestId,
    },

    select: {
      id: true,
      requestNumber: true,
      serviceType: true,
      title: true,
      description: true,
      serviceAddress: true,
      contactPhone: true,
      preferredSchedule: true,
      status: true,
      workOrderId: true,
      createdAt: true,
      updatedAt: true,

      customer: {
        select: {
          id: true,
          userId: true,
          name: true,
          phone: true,
          email: true,
          address: true,
        },
      },

      workOrder: {
        select: {
          id: true,
          workOrderNumber: true,
          status: true,
          scheduledAt: true,
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
              role: true,
            },
          },
        },
      },
    },
  });

  if (!serviceRequest) {
    throw new AppError(404, 'Service request tidak ditemukan', 'SERVICE_REQUEST_NOT_FOUND');
  }

  return serviceRequest;
}

const adminTransitions: Partial<Record<ServiceRequestStatus, Set<ServiceRequestStatus>>> = {
  [ServiceRequestStatus.SUBMITTED]: new Set([ServiceRequestStatus.UNDER_REVIEW, ServiceRequestStatus.ACCEPTED, ServiceRequestStatus.REJECTED]),

  [ServiceRequestStatus.UNDER_REVIEW]: new Set([ServiceRequestStatus.ACCEPTED, ServiceRequestStatus.REJECTED]),
};

export async function updateServiceRequestStatus(input: UpdateServiceRequestStatusInput) {
  return prisma.$transaction(async (transaction) => {
    const current = await transaction.serviceRequest.findUnique({
      where: {
        id: input.serviceRequestId,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!current) {
      throw new AppError(404, 'Service request tidak ditemukan', 'SERVICE_REQUEST_NOT_FOUND');
    }

    const allowed = adminTransitions[current.status];

    if (!allowed?.has(input.status)) {
      throw new AppError(409, `Perubahan status ${current.status} → ${input.status} tidak diizinkan`, 'INVALID_SERVICE_REQUEST_STATUS_TRANSITION');
    }

    if (input.status === ServiceRequestStatus.REJECTED && !input.notes?.trim()) {
      throw new AppError(422, 'Alasan penolakan wajib diisi', 'REJECTION_REASON_REQUIRED');
    }

    const updated = await transaction.serviceRequest.update({
      where: {
        id: current.id,
      },

      data: {
        status: input.status,
      },

      select: {
        id: true,
        requestNumber: true,
        status: true,
        updatedAt: true,
      },
    });

    await transaction.serviceRequestStatusHistory.create({
      data: {
        serviceRequestId: current.id,

        previousStatus: current.status,

        newStatus: input.status,

        changedById: input.adminUserId,

        notes: input.notes ?? null,
      },
    });

    return updated;
  });
}

export async function convertServiceRequestToWorkOrder(input: ConvertServiceRequestInput) {
  if (input.scheduledAt.getTime() <= Date.now()) {
    throw new AppError(422, 'Jadwal Work Order harus berada di masa depan', 'WORK_ORDER_SCHEDULE_INVALID');
  }

  return prisma.$transaction(async (transaction) => {
    const serviceRequest = await transaction.serviceRequest.findUnique({
      where: {
        id: input.serviceRequestId,
      },

      select: {
        id: true,

        requestNumber: true,

        customerId: true,

        title: true,

        description: true,

        status: true,

        workOrderId: true,
      },
    });

    if (!serviceRequest) {
      throw new AppError(404, 'Service request tidak ditemukan', 'SERVICE_REQUEST_NOT_FOUND');
    }

    if (serviceRequest.status !== ServiceRequestStatus.ACCEPTED) {
      throw new AppError(409, 'Hanya Service Request berstatus ACCEPTED yang dapat dikonversi menjadi Work Order', 'SERVICE_REQUEST_NOT_ACCEPTED');
    }

    if (serviceRequest.workOrderId) {
      throw new AppError(409, 'Service Request sudah memiliki Work Order', 'SERVICE_REQUEST_ALREADY_CONVERTED');
    }

    const technician = await transaction.user.findUnique({
      where: {
        id: input.technicianId,
      },

      select: {
        id: true,

        name: true,

        email: true,

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

    const workOrderNumber = generateWorkOrderNumber();

    const workOrder = await transaction.workOrder.create({
      data: {
        workOrderNumber,

        customerId: serviceRequest.customerId,

        technicianId: technician.id,

        title: serviceRequest.title,

        description: serviceRequest.description,

        scheduledAt: input.scheduledAt,

        status: WorkOrderStatus.ASSIGNED,

        completedAt: null,

        createdById: input.adminUserId,
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

        technician: {
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

        newStatus: WorkOrderStatus.ASSIGNED,

        changedById: input.adminUserId,

        notes: `Work Order dibuat dari ${serviceRequest.requestNumber} dan ditugaskan ke ${technician.name}`,
      },
    });

    const updateResult = await transaction.serviceRequest.updateMany({
      where: {
        id: serviceRequest.id,

        status: ServiceRequestStatus.ACCEPTED,

        workOrderId: null,
      },

      data: {
        status: ServiceRequestStatus.CONVERTED,

        workOrderId: workOrder.id,
      },
    });

    if (updateResult.count !== 1) {
      throw new AppError(409, 'Service Request telah berubah atau sudah dikonversi', 'SERVICE_REQUEST_CONVERSION_CONFLICT');
    }

    await transaction.serviceRequestStatusHistory.create({
      data: {
        serviceRequestId: serviceRequest.id,

        previousStatus: ServiceRequestStatus.ACCEPTED,

        newStatus: ServiceRequestStatus.CONVERTED,

        changedById: input.adminUserId,

        notes: `Dikonversi menjadi Work Order ${workOrder.workOrderNumber}`,
      },
    });

    const updatedServiceRequest = await transaction.serviceRequest.findUnique({
      where: {
        id: serviceRequest.id,
      },

      select: {
        id: true,

        requestNumber: true,

        status: true,

        workOrderId: true,

        updatedAt: true,
      },
    });

    return {
      serviceRequest: updatedServiceRequest,

      workOrder,
    };
  });
}
