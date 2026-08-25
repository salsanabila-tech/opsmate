import type { EntityPagination } from './admin';

export type Technician = {
  id: string;

  name: string;

  email: string;

  phone: string | null;

  role: 'TECHNICIAN';

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
};

export type TechnicianDetail = Technician & {
  assignedWorkOrdersCount: number;
};

export type TechnicianStatusFilter = 'all' | 'active' | 'inactive';

export type TechnicianListParams = {
  page?: number;

  limit?: number;

  search?: string;

  status?: TechnicianStatusFilter;
};

export type TechnicianListResponse = {
  success: true;

  message: string;

  data: {
    technicians: Technician[];

    pagination: EntityPagination;
  };
};

export type TechnicianDetailResponse = {
  success: true;

  message: string;

  data: {
    technician: TechnicianDetail;
  };
};

export type CreateTechnicianInput = {
  name: string;

  email: string;

  phone?: string;

  password: string;
};

export type UpdateTechnicianInput = {
  name: string;

  email: string;

  phone: string | null;
};

export type TechnicianMutationResponse = {
  success: true;

  message: string;

  data: {
    technician: Technician;
  };
};

export type UpdateTechnicianStatusResponse = {
  success: true;

  message: string;

  data: {
    technician: Technician;

    revokedSessionsCount: number;
  };
};
