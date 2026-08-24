export type WorkOrderStatus = 'PENDING' | 'ASSIGNED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type WorkOrderCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type WorkOrderTechnician = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

export type WorkOrderCreatedBy = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export type WorkOrderListItem = {
  id: string;

  workOrderNumber: string;

  title: string;

  description: string;

  scheduledAt: string;

  status: WorkOrderStatus;

  completedAt: string | null;

  createdAt: string;

  updatedAt: string;

  customer: WorkOrderCustomer;

  technician: WorkOrderTechnician | null;

  createdBy: WorkOrderCreatedBy;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type WorkOrderListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: WorkOrderStatus;
};

export type WorkOrderListResponse = {
  success: true;
  message: string;

  data: WorkOrderListItem[];

  meta: PaginationMeta;
};

export type DashboardSummary = {
  totalWorkOrders: number;
  completedWorkOrders: number;
  totalCustomers: number;
  totalTechnicians: number;
};

export type AttachmentType = 'BEFORE' | 'AFTER' | 'OTHER';

export type WorkOrderStatusHistory = {
  id: string;

  previousStatus: WorkOrderStatus | null;

  newStatus: WorkOrderStatus;

  notes: string | null;

  createdAt: string;

  changedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type WorkOrderAttachment = {
  id: string;

  fileUrl: string;

  fileName: string;

  fileType: string;

  fileSize: string;

  attachmentType: AttachmentType;

  description: string | null;

  createdAt: string;

  uploadedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type WorkOrderDetail = {
  id: string;

  workOrderNumber: string;

  title: string;

  description: string;

  scheduledAt: string;

  status: WorkOrderStatus;

  completedAt: string | null;

  createdAt: string;

  updatedAt: string;

  customer: {
    id: string;

    name: string;

    phone: string;

    email: string | null;

    address: string;

    notes: string | null;

    createdAt: string;

    updatedAt: string;
  };

  technician: {
    id: string;

    name: string;

    email: string;

    phone: string | null;

    role: string;

    isActive: boolean;

    createdAt: string;

    updatedAt: string;
  } | null;

  createdBy: {
    id: string;

    name: string;

    email: string;

    role: string;

    isActive: boolean;
  };

  statusHistories: WorkOrderStatusHistory[];

  attachments: WorkOrderAttachment[];
};

export type WorkOrderDetailResponse = {
  success: true;

  message: string;

  data: WorkOrderDetail;
};

export type CreateWorkOrderInput = {
  customerId: string;

  technicianId?: string | null;

  title: string;

  description: string;

  scheduledAt: string;
};

export type CreateWorkOrderResponse = {
  success: true;

  message: string;

  data: {
    id: string;

    workOrderNumber: string;

    status: WorkOrderStatus;
  };
};
