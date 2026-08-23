import { env } from '../config/env';

import type { HealthResponse } from '../types/api';

import type { RefreshTokenResponse } from '../types/auth';

import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './token-storage';

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
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

let refreshPromise: Promise<string | null> | null = null;

async function performTokenRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${env.apiUrl}/auth/refresh`, {
    method: 'POST',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      refreshToken,
    }),
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403 || response.status === 422) {
      await clearTokens();
    }

    return null;
  }

  const result = responseBody as RefreshTokenResponse;

  await saveTokens({
    accessToken: result.data.accessToken,

    refreshToken: result.data.refreshToken,
  });

  return result.data.accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { authenticated = false, headers, ...fetchOptions } = options;

  const sendRequest = async (accessToken?: string | null) => {
    const requestHeaders = new Headers(headers);

    requestHeaders.set('Accept', 'application/json');

    const hasBody = fetchOptions.body !== undefined && fetchOptions.body !== null;

    const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

    if (hasBody && !isFormData && !requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }

    return fetch(`${env.apiUrl}${path}`, {
      ...fetchOptions,
      headers: requestHeaders,
    });
  };

  let accessToken = authenticated ? await getAccessToken() : null;

  let response = await sendRequest(accessToken);

  if (authenticated && response.status === 401) {
    accessToken = await refreshAccessToken();

    if (accessToken) {
      response = await sendRequest(accessToken);
    }
  }

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
