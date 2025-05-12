import { api } from './base';
import { ApiResponse } from '@/types/api';
import {
  IDashboardStats,
  IFinancialSummary,
  IPaymentStatus,
  IRevenueTrend,
  IOccupancyRevenue
} from '@/types/models';

/**
 * Dashboard API servisi
 */
export const dashboardApi = {
  /**
   * Dashboard finansal özet verilerini getirir
   */
  getFinancialSummary: async (): Promise<ApiResponse<IFinancialSummary>> => {
    const response = await api.get<IFinancialSummary>('/api/v1/dashboard/financial-summary');
    
    if (response.success && response.data) {
      return response;
    }
    
    return {
      ...response,
      data: {
        income: 0,
        expense: 0,
        balance: 0,
        monthly: []
      },
    };
  },
  
  /**
   * Ödeme durumu verilerini getirir
   */
  getPaymentStatus: async (): Promise<ApiResponse<IPaymentStatus>> => {
    const response = await api.get<IPaymentStatus>('/api/v1/dashboard/payment-status');
    
    if (response.success && response.data) {
      return response;
    }
    
    return {
      ...response,
      data: {
        summary: {
          upcoming: 0,
          overdue: 0,
          completed: 0,
          total: 0
        },
        payment_plans: {
          active: 0,
          completed: 0,
          cancelled: 0
        },
        recent_payments: []
      },
    };
  },
  
  /**
   * Gelir trendi verilerini getirir
   */
  getRevenueTrends: async (): Promise<ApiResponse<IRevenueTrend>> => {
    const response = await api.get<IRevenueTrend>('/api/v1/dashboard/revenue-trends');
    
    if (response.success && response.data) {
      return response;
    }
    
    return {
      ...response,
      data: {
        monthly_revenue: [],
        year_comparison: {
          current_year: {
            year: new Date().getFullYear(),
            revenue: 0
          },
          previous_year: {
            year: new Date().getFullYear() - 1,
            revenue: 0
          },
          growth_rate: 0
        },
        by_product_category: [],
        by_payment_type: []
      },
    };
  },
  
  /**
   * Doluluk ve gelir ilişkisi verilerini getirir
   */
  getOccupancyRevenue: async (): Promise<ApiResponse<IOccupancyRevenue>> => {
    const response = await api.get<IOccupancyRevenue>('/api/v1/dashboard/occupancy-revenue');
    
    if (response.success && response.data) {
      return response;
    }
    
    return {
      ...response,
      data: {
        occupancy_by_apart: [],
        occupancy_trend: [],
        revenue_by_apart: [],
        room_type_distribution: []
      },
    };
  },
  
  /**
   * Dashboard istatistiklerini getirir
   */
  getStats: async (): Promise<ApiResponse<IDashboardStats>> => {
    const response = await api.get<IDashboardStats>('/api/dashboard/stats');
    
    if (response.success && response.data) {
      return response;
    }
    
    return {
      ...response,
      data: {
        modules: {
          apartments: { total: 0, active: 0, maintenance: 0 },
          rooms: { total: 0, occupied: 0, available: 0 },
          students: { total: 0, active: 0, new: 0 },
          finance: { monthlyRevenue: 0, collected: 0, pending: 0 },
          notifications: { total: 0, general: 0, urgent: 0 },
          inventory: { total: 0, active: 0, repair: 0 },
          reports: { total: 0, financial: 0, operational: 0 },
          settings: { total: 0, general: 0, custom: 0 },
          support: { total: 0, pending: 0, inProgress: 0 }
        },
        stats: {
          occupancyRate: { percentage: 0, total: 0, occupied: 0, change: 0 },
          monthlyRevenue: { amount: 0, pending: 0, change: 0 },
          newRegistrations: { count: 0, period: '', change: 0 },
          availableRooms: { count: 0, reserved: 0, change: 0 }
        }
      },
    };
  }
}; 