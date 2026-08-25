import { apiRequest } from './api';

import type { CustomerDetailResponse, CustomerInput, CustomerListParams, CustomerListResponse, CustomerMutationResponse } from '../types/customer';

function buildQuery(params: CustomerListParams): string {
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

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
}

export function fetchCustomers(params: CustomerListParams = {}): Promise<CustomerListResponse> {
  return apiRequest<CustomerListResponse>(`/customers${buildQuery(params)}`, {
    authenticated: true,
  });
}

export function fetchCustomerDetail(customerId: string): Promise<CustomerDetailResponse> {
  return apiRequest<CustomerDetailResponse>(`/customers/${customerId}`, {
    authenticated: true,
  });
}

export function createCustomer(input: CustomerInput): Promise<CustomerMutationResponse> {
  return apiRequest<CustomerMutationResponse>('/customers', {
    method: 'POST',

    authenticated: true,

    body: JSON.stringify({
      name: input.name.trim(),

      phone: input.phone.trim(),

      email: input.email?.trim() || null,

      address: input.address.trim(),

      notes: input.notes?.trim() || null,
    }),
  });
}

export function updateCustomer(customerId: string, input: CustomerInput): Promise<CustomerMutationResponse> {
  return apiRequest<CustomerMutationResponse>(`/customers/${customerId}`, {
    method: 'PATCH',

    authenticated: true,

    body: JSON.stringify({
      name: input.name.trim(),

      phone: input.phone.trim(),

      email: input.email?.trim() || null,

      address: input.address.trim(),

      notes: input.notes?.trim() || null,
    }),
  });
}
