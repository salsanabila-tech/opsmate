import { env } from '../config/env';
import type { HealthResponse } from '../types/api';

type ApiRequestOptions = RequestInit & {
  accessToken?: string;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  public constructor(status: number, message: string, code?: string) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, headers, ...fetchOptions } = options;

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...fetchOptions,

    headers: {
      Accept: 'application/json',

      ...(fetchOptions.body
        ? {
            'Content-Type': 'application/json',
          }
        : {}),

      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),

      ...headers,
    },
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,

      responseBody?.message ?? 'Terjadi kesalahan saat menghubungi server',

      responseBody?.code,
    );
  }

  return responseBody as T;
}

export async function checkApiHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}
