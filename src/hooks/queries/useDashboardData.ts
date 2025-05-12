import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { useDashboardStats } from './useDashboard';

/**
 * Tüm dashboard verilerini tek seferde getiren hook
 */
export const useDashboardData = () => {
  const statsQuery = useDashboardStats();

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError
  };
};