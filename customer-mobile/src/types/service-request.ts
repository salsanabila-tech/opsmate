export type ServiceRequestStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'CONVERTED';

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

export type CreateServiceRequestResponse = {
  success: true;

  message: string;

  data: {
    serviceRequest: ServiceRequest;
  };
};
