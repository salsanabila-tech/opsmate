import { apiRequest } from './api';

import type { DashboardSummary, WorkOrderListParams, WorkOrderListResponse } from '../types/work.order';

import type { CustomerListSummaryResponse, TechnicianListSummaryResponse } from '../types/admin';

function buildQuery(params: WorkOrderListParams): string {
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

export function fetchWorkOrders(params: WorkOrderListParams = {}): Promise<WorkOrderListResponse> {
  return apiRequest<WorkOrderListResponse>(`/work-orders${buildQuery(params)}`, {
    authenticated: true,
  });
}

export function fetchWorkOrderSnapshot(): Promise<WorkOrderListResponse> {
  return fetchWorkOrders({
    page: 1,
    limit: 5,
  });
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [workOrders, completedWorkOrders, customers, technicians] = await Promise.all([
    fetchWorkOrders({
      page: 1,
      limit: 1,
    }),

    fetchWorkOrders({
      page: 1,
      limit: 1,
      status: 'COMPLETED',
    }),

    apiRequest<CustomerListSummaryResponse>('/customers?page=1&limit=1', {
      authenticated: true,
    }),

    apiRequest<TechnicianListSummaryResponse>('/users/technicians?page=1&limit=1&status=all', {
      authenticated: true,
    }),
  ]);

  return {
    totalWorkOrders: workOrders.meta.total,

    completedWorkOrders: completedWorkOrders.meta.total,

    totalCustomers: customers.data.pagination.total,

    totalTechnicians: technicians.data.pagination.total,
  };
}
