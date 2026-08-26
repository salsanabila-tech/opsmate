import { env } from '../config/env';

import type { RefreshTokenResponse } from '../types/auth';

import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './token-storage';

type ValidationIssue = {
  field: string;
  message: string;
};

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;

  code?: string;

  errors?: ValidationIssue[];

  constructor(message: string, status: number, code?: string, errors?: ValidationIssue[]) {
    super(message);

    this.name = 'ApiError';

    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Koneksi ke server timeout.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function performTokenRefresh(timeoutMs: number): Promise<string | null> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await fetchWithTimeout(
    `${env.apiUrl}/auth/refresh`,
    {
      method: 'POST',

      headers: {
        Accept: 'application/json',

        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        refreshToken,
      }),
    },
    timeoutMs,
  );

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

async function refreshAccessToken(timeoutMs: number): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh(timeoutMs).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { authenticated = false, timeoutMs = 15_000, headers, ...fetchOptions } = options;

  const sendRequest = async (accessToken?: string | null): Promise<Response> => {
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

    return fetchWithTimeout(
      `${env.apiUrl}${path}`,
      {
        ...fetchOptions,
        headers: requestHeaders,
      },
      timeoutMs,
    );
  };

  try {
    let accessToken = authenticated ? await getAccessToken() : null;

    let response = await sendRequest(accessToken);

    if (authenticated && response.status === 401) {
      accessToken = await refreshAccessToken(timeoutMs);

      if (accessToken) {
        response = await sendRequest(accessToken);
      }
    }

    const contentType = response.headers.get('content-type');

    const responseBody = contentType?.includes('application/json') ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      throw new ApiError(
        responseBody?.message ?? `Request gagal dengan status ${response.status}`,

        response.status,

        responseBody?.code,

        responseBody?.errors,
      );
    }

    return responseBody as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.message === 'Koneksi ke server timeout.') {
      throw error;
    }

    throw new Error('Tidak dapat terhubung ke server OpsMate.');
  }
}
