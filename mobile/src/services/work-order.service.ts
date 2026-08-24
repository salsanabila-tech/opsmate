import { apiRequest } from './api';

import type { TechnicianWorkOrderDetailResponse, TechnicianWorkOrderListParams, TechnicianWorkOrderListResponse, UpdateTechnicianWorkOrderStatusInput, UpdateTechnicianWorkOrderStatusResponse } from '../types/work-order';

function buildQueryString(params: TechnicianWorkOrderListParams): string {
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

  if (params.status) {
    query.set('status', params.status);
  }

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
}

export async function fetchTechnicianWorkOrders(params: TechnicianWorkOrderListParams = {}): Promise<TechnicianWorkOrderListResponse> {
  const queryString = buildQueryString(params);

  return apiRequest<TechnicianWorkOrderListResponse>(`/work-orders/my${queryString}`, {
    authenticated: true,
  });
}

export async function fetchTechnicianWorkOrderDetail(workOrderId: string): Promise<TechnicianWorkOrderDetailResponse> {
  return apiRequest<TechnicianWorkOrderDetailResponse>(`/work-orders/my/${workOrderId}`, {
    authenticated: true,
  });
}

export async function updateTechnicianWorkOrderStatus(workOrderId: string, input: UpdateTechnicianWorkOrderStatusInput): Promise<UpdateTechnicianWorkOrderStatusResponse> {
  const notes = input.notes?.trim();

  return apiRequest<UpdateTechnicianWorkOrderStatusResponse>(`/work-orders/my/${workOrderId}/status`, {
    method: 'PATCH',

    authenticated: true,

    body: JSON.stringify({
      status: input.status,

      ...(notes
        ? {
            notes,
          }
        : {}),
    }),
  });
}
