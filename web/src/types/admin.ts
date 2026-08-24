export type EntityPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type CustomerSummary = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type CustomerListSummaryResponse = {
  success: true;
  message: string;

  data: {
    customers: CustomerSummary[];

    pagination: EntityPagination;
  };
};

export type TechnicianSummary = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

export type TechnicianListSummaryResponse = {
  success: true;
  message: string;

  data: {
    technicians: TechnicianSummary[];

    pagination: EntityPagination;
  };
};
