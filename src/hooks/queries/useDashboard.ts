import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import {
  IDashboardStats,
  IFinancialSummary,
  IPaymentStatus,
  IRevenueTrend,
  IOccupancyRevenue
} from '@/types/models';

/**
 * Dashboard istatistiklerini getirmek için kullanılan hook
 */
export const useDashboardStats = (options = {}) => {
  return useQuery<IDashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      if (response.success && response.data) {
        return response.data;
      }
      return {} as IDashboardStats;
    },
    ...options,
  });
};

/**
 * Finansal özet verilerini getirmek için kullanılan hook
 */
export const useFinancialSummary = (options = {}) => {
  return useQuery<IFinancialSummary>({
    queryKey: ['financialSummary'],
    queryFn: async () => {
      const response = await dashboardApi.getFinancialSummary();
      if (response.success && response.data) {
        return response.data;
      }
      return {} as IFinancialSummary;
    },
    ...options,
  });
};

/**
 * Ödeme durumu verilerini getirmek için kullanılan hook
 */
export const usePaymentStatus = (options = {}) => {
  return useQuery<IPaymentStatus>({
    queryKey: ['paymentStatus'],
    queryFn: async () => {
      const response = await dashboardApi.getPaymentStatus();
      if (response.success && response.data) {
        return response.data;
      }
      return {} as IPaymentStatus;
    },
    ...options,
  });
};

/**
 * Gelir trendi verilerini getirmek için kullanılan hook
 */
export const useRevenueTrends = (options = {}) => {
  return useQuery<IRevenueTrend>({
    queryKey: ['revenueTrends'],
    queryFn: async () => {
      const response = await dashboardApi.getRevenueTrends();
      if (response.success && response.data) {
        return response.data;
      }
      return {} as IRevenueTrend;
    },
    ...options,
  });
};

/**
 * Doluluk ve gelir ilişkisi verilerini getirmek için kullanılan hook
 */
export const useOccupancyRevenue = (options = {}) => {
  return useQuery<IOccupancyRevenue>({
    queryKey: ['occupancyRevenue'],
    queryFn: async () => {
      const response = await dashboardApi.getOccupancyRevenue();
      if (response.success && response.data) {
        return response.data;
      }
      return {} as IOccupancyRevenue;
    },
    ...options,
  });
};