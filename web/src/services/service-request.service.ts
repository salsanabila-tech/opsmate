import { apiRequest } from './api';

import type {
  ServiceRequestDetailResponse,
  ServiceRequestListParams,
  ServiceRequestListResponse,
  UpdateServiceRequestStatusInput,
  UpdateServiceRequestStatusResponse,
  ConvertServiceRequestInput,
  ConvertServiceRequestResponse,
} from '../types/service-request';

function buildQuery(params: ServiceRequestListParams): string {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set('page', String(params.page));
  }

  if (params.limit !== undefined) {
    query.set('limit', String(params.limit));
  }

  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }

  if (params.status && params.status !== 'all') {
    query.set('status', params.status);
  }

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
}

export function fetchServiceRequests(params: ServiceRequestListParams = {}): Promise<ServiceRequestListResponse> {
  return apiRequest<ServiceRequestListResponse>(`/service-requests${buildQuery(params)}`, {
    authenticated: true,
  });
}

export function fetchServiceRequestDetail(serviceRequestId: string): Promise<ServiceRequestDetailResponse> {
  return apiRequest<ServiceRequestDetailResponse>(`/service-requests/${encodeURIComponent(serviceRequestId)}`, {
    authenticated: true,
  });
}

export function updateServiceRequestStatus(serviceRequestId: string, input: UpdateServiceRequestStatusInput): Promise<UpdateServiceRequestStatusResponse> {
  return apiRequest<UpdateServiceRequestStatusResponse>(`/service-requests/${encodeURIComponent(serviceRequestId)}/status`, {
    method: 'PATCH',

    authenticated: true,

    body: JSON.stringify({
      status: input.status,

      ...(input.notes?.trim()
        ? {
            notes: input.notes.trim(),
          }
        : {}),
    }),
  });
}

export function convertServiceRequestToWorkOrder(serviceRequestId: string, input: ConvertServiceRequestInput): Promise<ConvertServiceRequestResponse> {
  return apiRequest<ConvertServiceRequestResponse>(`/service-requests/${encodeURIComponent(serviceRequestId)}/convert`, {
    method: 'POST',

    authenticated: true,

    body: JSON.stringify({
      technicianId: input.technicianId,

      scheduledAt: input.scheduledAt,
    }),
  });
}
