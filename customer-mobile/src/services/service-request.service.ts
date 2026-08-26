import { apiRequest } from './api';

import type { CreateServiceRequestInput, CreateServiceRequestResponse } from '../types/service-request';

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
