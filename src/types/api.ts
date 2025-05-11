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

/**
 * İstatistik verileri için tür tanımı
 */
export interface RegistrationStats {
  totalRegistrations: number;
  activeRegistrations: number;
  completedRegistrations: number;
  cancelledRegistrations: number;
  totalRevenue: number;
  collectedRevenue: number;
  pendingRevenue: number;
  occupancyRate: number;
  registrationsByMonth: {
    [key: string]: number;
  };
  registrationsByStatus: {
    [key: string]: number;
  };
  registrationsByApartment: {
    [key: string]: number;
  };
  revenueByMonth: {
    [key: string]: number;
  };
}