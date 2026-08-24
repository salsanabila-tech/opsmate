import { apiRequest } from './api';

import type { AdminWorkOrderListParams, AdminWorkOrderListResponse } from '../types/admin';

function buildWorkOrderQuery(params: AdminWorkOrderListParams): string {
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

export async function fetchAdminWorkOrders(params: AdminWorkOrderListParams = {}): Promise<AdminWorkOrderListResponse> {
  const query = buildWorkOrderQuery(params);

  return apiRequest<AdminWorkOrderListResponse>(`/work-orders${query}`, {
    authenticated: true,
  });
}
