import type { WorkOrderListMeta, WorkOrderStatus } from './work-order';

export type AdminWorkOrderCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type AdminWorkOrderTechnician = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

export type AdminWorkOrderCreatedBy = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export type AdminWorkOrderListItem = {
  id: string;

  workOrderNumber: string;

  title: string;

  description: string;

  scheduledAt: string;

  status: WorkOrderStatus;

  completedAt: string | null;

  createdAt: string;

  updatedAt: string;

  customer: AdminWorkOrderCustomer;

  technician: AdminWorkOrderTechnician | null;

  createdBy: AdminWorkOrderCreatedBy;
};

export type AdminWorkOrderListParams = {
  page?: number;

  limit?: number;

  search?: string;

  status?: WorkOrderStatus;
};

export type AdminWorkOrderListResponse = {
  success: true;

  message: string;

  data: AdminWorkOrderListItem[];

  meta: WorkOrderListMeta;
};
