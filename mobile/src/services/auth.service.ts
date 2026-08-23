import { apiRequest } from './api';

import type { CurrentUserResponse, LoginResponse, LogoutResponse } from '../types/auth';

type LoginInput = {
  email: string;
  password: string;
};

export async function loginUser(input: LoginInput): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',

    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>('/auth/me', {
    authenticated: true,
  });
}

export async function logoutUser(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>('/auth/logout', {
    method: 'POST',
    authenticated: true,
  });
}
