export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data?: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

export type HealthResponse = {
  success: true;
  message: string;
  timestamp: string;
};
