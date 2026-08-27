import { apiRequest } from './api';

import type { CancelServiceRequestResponse, CreateServiceRequestInput, CreateServiceRequestResponse, GetMyServiceRequestResponse, ListMyServiceRequestsResponse, ServiceRequestStatus } from '../types/service-request';

type ListMyServiceRequestsInput = {
  page?: number;

  limit?: number;

  status?: ServiceRequestStatus | 'all';
};

export async function createServiceRequest(input: CreateServiceRequestInput): Promise<CreateServiceRequestResponse> {
  return apiRequest<CreateServiceRequestResponse>('/service-requests', {
    method: 'POST',

    authenticated: true,

    body: JSON.stringify({
      serviceType: input.serviceType.trim(),

      title: input.title.trim(),

      description: input.description.trim(),

      serviceAddress: input.serviceAddress.trim(),

      contactPhone: input.contactPhone.trim(),

      preferredSchedule: input.preferredSchedule ?? null,
    }),
  });
}

export async function listMyServiceRequests(input: ListMyServiceRequestsInput = {}): Promise<ListMyServiceRequestsResponse> {
  const page = input.page ?? 1;

  const limit = input.limit ?? 20;

  const status = input.status ?? 'all';

  const query = new URLSearchParams({
    page: String(page),

    limit: String(limit),

    status,
  });

  return apiRequest<ListMyServiceRequestsResponse>(`/service-requests/my?${query.toString()}`, {
    authenticated: true,
  });
}

export async function getMyServiceRequest(serviceRequestId: string): Promise<GetMyServiceRequestResponse> {
  return apiRequest<GetMyServiceRequestResponse>(`/service-requests/my/${encodeURIComponent(serviceRequestId)}`, {
    authenticated: true,
  });
}

export async function cancelMyServiceRequest(serviceRequestId: string): Promise<CancelServiceRequestResponse> {
  return apiRequest<CancelServiceRequestResponse>(`/service-requests/my/${encodeURIComponent(serviceRequestId)}/cancel`, {
    method: 'PATCH',

    authenticated: true,

    body: JSON.stringify({}),
  });
}
