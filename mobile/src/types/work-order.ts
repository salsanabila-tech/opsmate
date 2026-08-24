export type WorkOrderStatus = 'PENDING' | 'ASSIGNED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type WorkOrderCustomer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export type TechnicianWorkOrder = {
  id: string;
  workOrderNumber: string;
  title: string;
  description: string;
  scheduledAt: string;
  status: WorkOrderStatus;
  completedAt: string | null;
  updatedAt: string;

  customer: WorkOrderCustomer;
};

export type WorkOrderListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TechnicianWorkOrderListResponse = {
  success: true;
  message: string;

  data: TechnicianWorkOrder[];

  meta: WorkOrderListMeta;
};

export type TechnicianWorkOrderListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: WorkOrderStatus;
};

export type AttachmentType = 'BEFORE' | 'AFTER' | 'OTHER';

export type WorkOrderActor = {
  id: string;
  name: string;
  role?: string;
};

export type WorkOrderStatusHistory = {
  id: string;
  previousStatus: WorkOrderStatus | null;
  newStatus: WorkOrderStatus;
  notes: string | null;
  createdAt: string;

  changedBy: WorkOrderActor;
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

  uploadedBy: WorkOrderActor;
};

export type TechnicianWorkOrderDetail = {
  id: string;
  workOrderNumber: string;
  title: string;
  description: string;
  scheduledAt: string;
  status: WorkOrderStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;

  customer: WorkOrderCustomer & {
    notes: string | null;
  };

  createdBy: {
    id: string;
    name: string;
    email: string;
  };

  statusHistories: WorkOrderStatusHistory[];

  attachments: WorkOrderAttachment[];
};

export type TechnicianWorkOrderDetailResponse = {
  success: true;
  message: string;
  data: TechnicianWorkOrderDetail;
};

export type TechnicianWorkOrderNextStatus = 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED';

export type UpdateTechnicianWorkOrderStatusInput = {
  status: TechnicianWorkOrderNextStatus;
  notes?: string;
};

export type UpdateTechnicianWorkOrderStatusResponse = {
  success: true;
  message: string;

  data: {
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
  };
};
