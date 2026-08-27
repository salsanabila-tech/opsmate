import type { UserRole } from './auth';

export type ServiceRequestStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'CONVERTED';

export type WorkOrderStatus = 'PENDING' | 'ASSIGNED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type CreateServiceRequestInput = {
  serviceType: string;
  title: string;
  description: string;
  serviceAddress: string;
  contactPhone: string;
  preferredSchedule?: string | null;
};

export type ServiceRequest = {
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
};

export type ServiceRequestPagination = {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasPreviousPage: boolean;

  hasNextPage: boolean;
};

export type ServiceRequestTechnician = {
  id: string;

  name: string;
};

export type ServiceRequestWorkOrder = {
  id: string;

  workOrderNumber: string;

  status: WorkOrderStatus;

  scheduledAt: string;

  technician: ServiceRequestTechnician | null;
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

export type ServiceRequestDetail = ServiceRequest & {
  workOrder: ServiceRequestWorkOrder | null;

  statusHistories: ServiceRequestStatusHistory[];
};

export type CreateServiceRequestResponse = {
  success: true;

  message: string;

  data: {
    serviceRequest: ServiceRequest;
  };
};

export type ListMyServiceRequestsResponse = {
  success: true;

  message: string;

  data: {
    serviceRequests: ServiceRequestListItem[];

    pagination: ServiceRequestPagination;
  };
};

export type GetMyServiceRequestResponse = {
  success: true;

  message: string;

  data: {
    serviceRequest: ServiceRequestDetail;
  };
};

export type CancelServiceRequestResponse = {
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
