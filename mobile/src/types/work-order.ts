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
