import { env } from '../config/env';

type ApiRequestOptions = RequestInit & {
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;

  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);

    this.name = 'ApiError';

    this.status = status;

    this.code = code;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { timeoutMs = 15_000, ...requestOptions } = options;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(`${env.apiUrl}${path}`, {
      ...requestOptions,

      signal: controller.signal,

      headers: {
        Accept: 'application/json',

        ...(requestOptions.body
          ? {
              'Content-Type': 'application/json',
            }
          : {}),

        ...requestOptions.headers,
      },
    });

    const contentType = response.headers.get('content-type');

    const responseBody = contentType?.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      throw new ApiError(responseBody?.message ?? `Request gagal dengan status ${response.status}`, response.status, responseBody?.code);
    }

    return responseBody as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Koneksi ke server timeout.');
    }

    throw new Error('Tidak dapat terhubung ke server OpsMate.');
  } finally {
    clearTimeout(timeout);
  }
}
