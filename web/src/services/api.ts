import { env } from '../config/env';

import type { RefreshResponse } from '../types/auth';

import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './token-storage';

export class ApiError extends Error {
  status: number;

  code?: string;

  errors?: unknown;

  constructor(status: number, message: string, code?: string, errors?: unknown) {
    super(message);

    this.name = 'ApiError';

    this.status = status;

    this.code = code;

    this.errors = errors;
  }
}

type ApiErrorPayload = {
  success?: false;

  message?: string;

  code?: string;

  errors?: unknown;
};

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;

  retryOnUnauthorized?: boolean;
};

let refreshPromise: Promise<string> | null = null;

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = payload as ApiErrorPayload | null;

    throw new ApiError(
      response.status,

      error?.message ?? 'Terjadi kesalahan pada server',

      error?.code,

      error?.errors,
    );
  }

  return payload as T;
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();

    throw new ApiError(401, 'Sesi telah berakhir', 'REFRESH_TOKEN_MISSING');
  }

  const response = await fetch(`${env.apiUrl}/auth/refresh`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      refreshToken,
    }),
  });

  const result = await parseResponse<RefreshResponse>(response);

  saveTokens({
    accessToken: result.data.accessToken,

    refreshToken: result.data.refreshToken,
  });

  return result.data.accessToken;
}

async function getFreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    authenticated = false,

    retryOnUnauthorized = true,

    headers: customHeaders,

    ...fetchOptions
  } = options;

  const headers = new Headers(customHeaders);

  const isFormData = fetchOptions.body instanceof FormData;

  if (fetchOptions.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (authenticated) {
    const accessToken = getAccessToken();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    try {
      const accessToken = await getFreshAccessToken();

      headers.set('Authorization', `Bearer ${accessToken}`);

      const retryResponse = await fetch(`${env.apiUrl}${path}`, {
        ...fetchOptions,
        headers,
      });

      return parseResponse<T>(retryResponse);
    } catch (error) {
      clearTokens();

      throw error;
    }
  }

  return parseResponse<T>(response);
}
