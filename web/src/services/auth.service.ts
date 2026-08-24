import { apiRequest } from './api';

import type { CurrentUserResponse, LoginInput, LoginResponse, LogoutResponse } from '../types/auth';

export function loginAdmin(input: LoginInput): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',

    body: JSON.stringify({
      email: input.email.trim(),

      password: input.password,
    }),
  });
}

export function fetchCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>('/auth/me', {
    authenticated: true,
  });
}

export function logoutAdmin(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>('/auth/logout', {
    method: 'POST',

    authenticated: true,
  });
}
