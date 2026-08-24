export type UserRole = 'ADMIN' | 'TECHNICIAN';

export type AuthUser = {
  id: string;

  name: string;

  email: string;

  phone?: string | null;

  role: UserRole;

  isActive: boolean;

  createdAt: string;

  updatedAt?: string;
};

export type LoginInput = {
  email: string;
  password: string;
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

export type RefreshResponse = {
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
