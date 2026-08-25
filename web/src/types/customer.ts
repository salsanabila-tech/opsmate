import type { EntityPagination } from './admin';

export type Customer = {
  id: string;

  name: string;

  phone: string;

  email: string | null;

  address: string;

  notes: string | null;

  createdAt: string;

  updatedAt: string;
};

export type CustomerListParams = {
  page?: number;

  limit?: number;

  search?: string;
};

export type CustomerListResponse = {
  success: true;

  message: string;

  data: {
    customers: Customer[];

    pagination: EntityPagination;
  };
};

export type CustomerDetailResponse = {
  success: true;

  message: string;

  data: {
    customer: Customer;
  };
};

export type CustomerInput = {
  name: string;

  phone: string;

  email?: string | null;

  address: string;

  notes?: string | null;
};

export type CustomerMutationResponse = {
  success: true;

  message: string;

  data: {
    customer: Customer;
  };
};
