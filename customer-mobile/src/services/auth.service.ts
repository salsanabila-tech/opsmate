import type { CurrentUserResponse, LoginResponse, LogoutResponse, RegisterCustomerInput, RegisterCustomerResponse } from '../types/auth';

import { apiRequest } from './api';

type LoginInput = {
  email: string;
  password: string;
};

export async function loginUser(input: LoginInput): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',

    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),

      password: input.password,
    }),
  });
}

export async function registerCustomer(input: RegisterCustomerInput): Promise<RegisterCustomerResponse> {
  return apiRequest<RegisterCustomerResponse>('/auth/register/customer', {
    method: 'POST',

    body: JSON.stringify({
      name: input.name.trim(),

      email: input.email.trim().toLowerCase(),

      phone: input.phone.trim(),

      password: input.password,

      address: input.address.trim(),
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
