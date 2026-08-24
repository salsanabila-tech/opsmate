import { env } from '../config/env';

export function resolveFileUrl(fileUrl: string): string {
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }

  const backendUrl = env.apiUrl.replace(/\/api\/?$/, '');

  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;

  return `${backendUrl}${path}`;
}
