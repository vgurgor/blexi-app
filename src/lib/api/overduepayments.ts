import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IPaymentPlan } from '@/types/models';

/**
 * Vadesi geçmiş ödemeler için API servisi
 */
export const overduePaymentsApi = {
  /**
   * Vadesi geçmiş ödemelerin sayısını ve listeyi getirir
   * @param options Arama parametreleri
   */
  getOverduePayments: async (options: {
    page?: number;
    perPage?: number;
    startDate?: string;
    endDate?: string;
    guestId?: string | number;
  } = {}): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams();
    
    if (options.page) {
      params.append('page', options.page.toString());
    }
    
    if (options.perPage) {
      params.append('per_page', options.perPage.toString());
    }
    
    if (options.startDate) {
      params.append('start_date', options.startDate);
    }
    
    if (options.endDate) {
      params.append('end_date', options.endDate);
    }
    
    if (options.guestId) {
      params.append('guest_id', options.guestId.toString());
    }
    
    const url = `/api/v1/finance/overdue-payments?${params.toString()}`;
    const response = await api.get(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        page: options.page || 1,
        limit: options.perPage || 15,
        total: response.meta?.total || 0,
      };
    }
    
    return {
      ...response,
      data: [],
      page: options.page || 1,
      limit: options.perPage || 15,
      total: 0,
    };
  },
  
  /**
   * Vadesi geçmiş ödemelerin toplam sayısını getirir
   */
  getTotalOverduePayments: async (): Promise<ApiResponse<{count: number, amount: number}>> => {
    const url = '/api/v1/finance/overdue-payments/count';
    return await api.get(url);
  },
  
  /**
   * Yaklaşan kayıtların sayısını getirir (önümüzdeki 30 gün içinde başlayacak kayıtlar)
   */
  getUpcomingRegistrationsCount: async (): Promise<ApiResponse<{count: number}>> => {
    const url = '/api/v1/season-registrations/upcoming/count';
    return await api.get(url);
  }
};