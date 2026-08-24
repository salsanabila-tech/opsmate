import { env } from '../config/env';

export function resolveFileUrl(fileUrl: string): string {
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }

  const apiBaseUrl = env.apiUrl.replace(/\/api\/?$/, '');

  const normalizedPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;

  return `${apiBaseUrl}${normalizedPath}`;
}
