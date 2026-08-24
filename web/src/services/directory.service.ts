import { apiRequest } from './api';

import type { CustomerListSummaryResponse, TechnicianListSummaryResponse } from '../types/admin';

export function fetchCustomerOptions(): Promise<CustomerListSummaryResponse> {
  return apiRequest<CustomerListSummaryResponse>('/customers?page=1&limit=100', {
    authenticated: true,
  });
}

export function fetchActiveTechnicianOptions(): Promise<TechnicianListSummaryResponse> {
  return apiRequest<TechnicianListSummaryResponse>('/users/technicians?page=1&limit=100&status=active', {
    authenticated: true,
  });
}
