import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileTypeFromBuffer } from 'file-type';
import { randomUUID } from 'crypto';
import { ListTechnicianWorkOrdersQuerySchema, ListWorkOrdersQuery } from '../validations/work-order.validation.js';
import { AttachmentType, UserRole, WorkOrderStatus } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/app-error.js';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const backendRootDirectory = path.resolve(currentDirectory, '../..');
const workOrderUploadDirectory = path.join(backendRootDirectory, 'uploads', 'work-orders');

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

type GetTechnicianWorkOrderDetailsInput = {
  workOrderId: string;
  technicianId: string;
};

type UpdateTechnicianWorkOrderStatusInput = {
  workOrderId: string;
  technicianId: string;
  status: WorkOrderStatus;
  notes?: string;
};

type ListTechnicianWorkOrdersInput = ListTechnicianWorkOrdersQuerySchema & {
  technicianId: string;
};

type CreateTechnicianWorkOrderAttachmentInput = {
  workOrderId: string;
  technicianId: string;
  attachmentType: AttachmentType;
  description?: string;
  file: {
    buffer: Buffer;
    originalName: string;
    size: number;
  };
};

const technicianWorkOrderStatusTransitions: Partial<Record<WorkOrderStatus, WorkOrderStatus>> = {
  [WorkOrderStatus.ASSIGNED]: WorkOrderStatus.ON_THE_WAY,
  [WorkOrderStatus.ON_THE_WAY]: WorkOrderStatus.IN_PROGRESS,
  [WorkOrderStatus.IN_PROGRESS]: WorkOrderStatus.COMPLETED,
};

function sanitizeOriginalFileName(originalName: string): string {
  const cleanName = path
    .basename(originalName)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();

  return (cleanName || 'attachment').slice(0, 255);
}

const technicianOtherAttachmentAllowedStatuses = new Set<WorkOrderStatus>([WorkOrderStatus.ASSIGNED, WorkOrderStatus.ON_THE_WAY, WorkOrderStatus.IN_PROGRESS]);

function assertTechnicianAttachmentAllowed(status: WorkOrderStatus, attachmentType: AttachmentType): void {
  if (attachmentType === AttachmentType.BEFORE && status !== WorkOrderStatus.ON_THE_WAY) {
    throw new AppError(409, 'Evidence BEFORE hanya dapat diunggah saat status ON_THE_WAY', 'BEFORE_EVIDENCE_NOT_ALLOWED');
  }

  if (attachmentType === AttachmentType.AFTER && status !== WorkOrderStatus.IN_PROGRESS) {
    throw new AppError(409, 'Evidence AFTER hanya dapat diunggah saat status IN_PROGRESS', 'AFTER_EVIDENCE_NOT_ALLOWED');
  }

  if (attachmentType === AttachmentType.OTHER && !technicianOtherAttachmentAllowedStatuses.has(status)) {
    throw new AppError(409, 'Attachment tidak dapat diunggah pada status work order saat ini', 'ATTACHMENT_UPLOAD_NOT_ALLOWED');
  }
}

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

export async function getTechnicianWorkOrderDetails(input: GetTechnicianWorkOrderDetailsInput) {
  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id: input.workOrderId,
      technicianId: input.technicianId,
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
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
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

export async function updateTechnicianWorkOrderStatus(input: UpdateTechnicianWorkOrderStatusInput) {
  return prisma.$transaction(async (transaction) => {
    const workOrder = await transaction.workOrder.findFirst({
      where: {
        id: input.workOrderId,
        technicianId: input.technicianId,
      },

      select: {
        id: true,
        workOrderNumber: true,
        status: true,
      },
    });

    if (!workOrder) {
      throw new AppError(404, 'Work order tidak ditemukan', 'WORK_ORDER_NOT_FOUND');
    }

    const allowedNextStatus = technicianWorkOrderStatusTransitions[workOrder.status];

    if (!allowedNextStatus || allowedNextStatus !== input.status) {
      throw new AppError(409, `Perubahan status dari ${workOrder.status} ke ${input.status} tidak diizinkan`, 'INVALID_STATUS_TRANSITION');
    }

    if (workOrder.status === WorkOrderStatus.ON_THE_WAY && input.status === WorkOrderStatus.IN_PROGRESS) {
      const beforeEvidenceCount = await transaction.workOrderAttachment.count({
        where: {
          workOrderId: workOrder.id,
          attachmentType: AttachmentType.BEFORE,
        },
      });

      if (beforeEvidenceCount < 1) {
        throw new AppError(409, 'Evidence BEFORE wajib diunggah sebelum memulai pekerjaan', 'BEFORE_EVIDENCE_REQUIRED');
      }
    }

    if (workOrder.status === WorkOrderStatus.IN_PROGRESS && input.status === WorkOrderStatus.COMPLETED) {
      const afterEvidenceCount = await transaction.workOrderAttachment.count({
        where: {
          workOrderId: workOrder.id,

          attachmentType: AttachmentType.AFTER,
        },
      });

      if (afterEvidenceCount < 1) {
        throw new AppError(409, 'Evidence AFTER wajib diunggah sebelum menyelesaikan pekerjaan', 'AFTER_EVIDENCE_REQUIRED');
      }
    }
    const completedAt = input.status === WorkOrderStatus.COMPLETED ? new Date() : null;
    const updateResult = await transaction.workOrder.updateMany({
      where: {
        id: workOrder.id,
        technicianId: input.technicianId,
        status: workOrder.status,
      },

      data: {
        status: input.status,
        completedAt,
      },
    });

    if (updateResult.count !== 1) {
      throw new AppError(409, 'Status work order telah berubah. Silahkan muat ulang data.', 'WORK_ORDER_STATUS_CHANGED');
    }

    await transaction.workOrderStatusHistory.create({
      data: {
        workOrderId: workOrder.id,
        previousStatus: workOrder.status,
        newStatus: input.status,
        changedById: input.technicianId,
        notes: input.notes ?? null,
      },
    });

    const updatedWorkOrder = await transaction.workOrder.findUnique({
      where: {
        id: workOrder.id,
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
      },
    });

    if (!updatedWorkOrder) {
      throw new AppError(404, 'Work order tidak ditemukan', 'WORK_ORDER_NOT_FOUND');
    }

    return updatedWorkOrder;
  });
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

export async function createTechnicianWorkOrderAttachment(input: CreateTechnicianWorkOrderAttachmentInput) {
  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id: input.workOrderId,
      technicianId: input.technicianId,
    },

    select: {
      id: true,
      status: true,
    },
  });

  if (!workOrder) {
    throw new AppError(404, 'Work order tidak ditemukan', 'WORK_ORDER_NOT_FOUND');
  }

  assertTechnicianAttachmentAllowed(workOrder.status, input.attachmentType);

  const detectedFileType = await fileTypeFromBuffer(input.file.buffer);

  const allowedActualMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  if (!detectedFileType || !allowedActualMimeTypes.has(detectedFileType.mime)) {
    throw new AppError(415, 'Isi file harus berupa JPEG, PNG, atau WEBP yang valid', 'UNSUPPORTED_ATTACHMENT_FILE_TYPE');
  }

  await mkdir(workOrderUploadDirectory, {
    recursive: true,
  });

  const storedFileName = `${randomUUID()}.${detectedFileType.ext}`;

  const absoluteFilePath = path.join(workOrderUploadDirectory, storedFileName);

  await writeFile(absoluteFilePath, input.file.buffer);

  const fileUrl = `/uploads/work-orders/${storedFileName}`;

  try {
    const attachment = await prisma.workOrderAttachment.create({
      data: {
        workOrderId: workOrder.id,

        uploadedById: input.technicianId,

        fileUrl,

        fileName: sanitizeOriginalFileName(input.file.originalName),

        fileType: detectedFileType.mime,

        fileSize: BigInt(input.file.size),

        attachmentType: input.attachmentType,

        description: input.description ?? null,
      },

      select: {
        id: true,
        workOrderId: true,
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
            role: true,
          },
        },
      },
    });

    return {
      ...attachment,

      fileSize: attachment.fileSize.toString(),
    };
  } catch (error) {
    await unlink(absoluteFilePath).catch(() => undefined);

    throw error;
  }
}
