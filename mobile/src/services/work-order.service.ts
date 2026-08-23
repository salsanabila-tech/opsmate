import { apiRequest } from './api';

import type { TechnicianWorkOrderListParams, TechnicianWorkOrderListResponse } from '../types/work-order';

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
