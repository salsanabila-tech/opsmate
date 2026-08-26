export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER';

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

export type RegisterCustomerInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
};

export type RegisteredCustomer = {
  id: string;
  userId: string | null;

  name: string;
  phone: string;
  email: string | null;
  address: string;
  notes: string | null;

  createdAt: string;
  updatedAt: string;
};

export type RegisterCustomerResponse = {
  success: true;
  message: string;

  data: {
    user: AuthUser;
    customer: RegisteredCustomer;
  };
};
