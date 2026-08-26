import { apiRequest } from './api';

export type HealthResponse = {
  success: true;
  message: string;
};

export function checkApiHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}
