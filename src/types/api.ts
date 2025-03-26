export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
  meta?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export type ApiErrorResponse = {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}