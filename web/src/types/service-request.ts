import type { UserRole } from './auth';

import type { WorkOrderStatus } from './work.order';

export type ServiceRequestStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'CONVERTED';

export type AdminServiceRequestStatus = 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';

export type ServiceRequestCustomer = {
  id: string;

  name: string;

  phone: string;

  email: string | null;
};

export type ServiceRequestCustomerDetail = ServiceRequestCustomer & {
  userId: string | null;

  address: string;
};

export type ServiceRequestListItem = {
  id: string;

  requestNumber: string;

  serviceType: string;

  title: string;

  preferredSchedule: string | null;

  status: ServiceRequestStatus;

  workOrderId: string | null;

  createdAt: string;

  updatedAt: string;

  customer: ServiceRequestCustomer;
};

export type ServiceRequestPagination = {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasPreviousPage: boolean;

  hasNextPage: boolean;
};

export type ServiceRequestListParams = {
  page?: number;

  limit?: number;

  search?: string;

  status?: ServiceRequestStatus | 'all';
};

export type ServiceRequestListResponse = {
  success: true;

  message: string;

  data: {
    serviceRequests: ServiceRequestListItem[];

    pagination: ServiceRequestPagination;
  };
};

export type ServiceRequestWorkOrder = {
  id: string;

  workOrderNumber: string;

  status: WorkOrderStatus;

  scheduledAt: string;
};

export type ServiceRequestStatusHistory = {
  id: string;

  previousStatus: ServiceRequestStatus | null;

  newStatus: ServiceRequestStatus;

  notes: string | null;

  createdAt: string;

  changedBy: {
    id: string;

    name: string;

    role: UserRole;
  };
};

export type ServiceRequestDetail = {
  id: string;

  requestNumber: string;

  serviceType: string;

  title: string;

  description: string;

  serviceAddress: string;

  contactPhone: string;

  preferredSchedule: string | null;

  status: ServiceRequestStatus;

  workOrderId: string | null;

  createdAt: string;

  updatedAt: string;

  customer: ServiceRequestCustomerDetail;

  workOrder: ServiceRequestWorkOrder | null;

  statusHistories: ServiceRequestStatusHistory[];
};

export type ServiceRequestDetailResponse = {
  success: true;

  message: string;

  data: {
    serviceRequest: ServiceRequestDetail;
  };
};

export type UpdateServiceRequestStatusInput = {
  status: AdminServiceRequestStatus;

  notes?: string;
};

export type UpdateServiceRequestStatusResponse = {
  success: true;

  message: string;

  data: {
    serviceRequest: {
      id: string;

      requestNumber: string;

      status: ServiceRequestStatus;

      updatedAt: string;
    };
  };
};
