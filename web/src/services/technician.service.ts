import { apiRequest } from './api';

import type { CreateTechnicianInput, TechnicianDetailResponse, TechnicianListParams, TechnicianListResponse, TechnicianMutationResponse, UpdateTechnicianInput, UpdateTechnicianStatusResponse } from '../types/technician';

function buildQuery(params: TechnicianListParams): string {
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

export function fetchTechnicians(params: TechnicianListParams = {}): Promise<TechnicianListResponse> {
  return apiRequest<TechnicianListResponse>(`/users/technicians${buildQuery(params)}`, {
    authenticated: true,
  });
}

export function fetchTechnicianDetail(technicianId: string): Promise<TechnicianDetailResponse> {
  return apiRequest<TechnicianDetailResponse>(`/users/technicians/${technicianId}`, {
    authenticated: true,
  });
}

export function createTechnician(input: CreateTechnicianInput): Promise<TechnicianMutationResponse> {
  const phone = input.phone?.trim();

  return apiRequest<TechnicianMutationResponse>('/users/technicians', {
    method: 'POST',

    authenticated: true,

    body: JSON.stringify({
      name: input.name.trim(),

      email: input.email.trim(),

      ...(phone
        ? {
            phone,
          }
        : {}),

      password: input.password,
    }),
  });
}

export function updateTechnician(technicianId: string, input: UpdateTechnicianInput): Promise<TechnicianMutationResponse> {
  return apiRequest<TechnicianMutationResponse>(`/users/technicians/${technicianId}`, {
    method: 'PATCH',

    authenticated: true,

    body: JSON.stringify({
      name: input.name.trim(),

      email: input.email.trim(),

      phone: input.phone?.trim() || null,
    }),
  });
}

export function updateTechnicianStatus(technicianId: string, isActive: boolean): Promise<UpdateTechnicianStatusResponse> {
  return apiRequest<UpdateTechnicianStatusResponse>(`/users/technicians/${technicianId}/status`, {
    method: 'PATCH',

    authenticated: true,

    body: JSON.stringify({
      isActive,
    }),
  });
}
