export type UserRole =
  | 'ADMIN'
  | 'TECHNICIAN'
  | 'CUSTOMER';

export type AuthUser = {
  id: string;
  customerId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type LoginResponse = {
  success: true;
  message: string;

  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
};

export type RefreshTokenResponse = {
  success: true;
  message: string;

  data: {
    accessToken: string;
    refreshToken: string;
  };
};

export type CurrentUserResponse = {
  success: true;
  message: string;

  data: {
    user: AuthUser;
  };
};

export type LogoutResponse = {
  success: true;
  message: string;
};