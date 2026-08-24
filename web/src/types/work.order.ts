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
