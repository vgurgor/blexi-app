import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IPayment } from '../../types/models';

// API'den gelen ödeme veri modeli
export interface PaymentDto {
  id: number;
  payment_plan_id: number;
  payment_type_id: number;
  payment_type?: {
    id: number;
    name: string;
    bank_name?: string;
    description?: string;
  };
  amount: number;
  payment_date: string;
  approval_code?: string;
  status: 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Ödeme oluşturma isteği için model
export interface CreatePaymentRequest {
  payment_plan_id: number;
  payment_type_id: number;
  amount: number;
  payment_date: string;
  approval_code?: string;
  notes?: string;
}

// Ödeme güncelleme isteği için model
export interface UpdatePaymentRequest {
  payment_type_id?: number;
  amount?: number;
  payment_date?: string;
  approval_code?: string;
  notes?: string;
}

// Finans - Ödeme durumu güncelleme isteği için model
export interface FinanceUpdatePaymentRequest {
  status: 'completed' | 'cancelled' | 'refunded';
  payment_date?: string;
}

/**
 * DTO'yu model tipine dönüştüren yardımcı fonksiyon
 */
const mapPaymentDtoToModel = (dto: PaymentDto): IPayment => {
  return {
    id: dto.id.toString(),
    paymentPlanId: dto.payment_plan_id.toString(),
    paymentTypeId: dto.payment_type_id.toString(),
    paymentType: dto.payment_type ? {
      id: dto.payment_type.id.toString(),
      name: dto.payment_type.name,
      bankName: dto.payment_type.bank_name,
      description: dto.payment_type.description,
    } : undefined,
    amount: dto.amount,
    paymentDate: dto.payment_date,
    approvalCode: dto.approval_code,
    status: dto.status,
    notes: dto.notes,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Ödemeler API servisi
 */
export const paymentsApi = {
  /**
   * Ödemeleri listeler, filtreleme seçenekleriyle
   * @param options - Filtreleme ve sayfalama seçenekleri
   */
  getAll: async (options: {
    page?: number;
    perPage?: number;
    paymentPlanId?: string | number;
    paymentTypeId?: string | number;
    status?: 'completed' | 'cancelled' | 'refunded';
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PaginatedResponse<IPayment>> => {
    const params = new URLSearchParams();
    
    if (options.page) {
      params.append('page', options.page.toString());
    }
    
    if (options.perPage) {
      params.append('per_page', options.perPage.toString());
    }
    
    if (options.paymentPlanId) {
      params.append('payment_plan_id', options.paymentPlanId.toString());
    }
    
    if (options.paymentTypeId) {
      params.append('payment_type_id', options.paymentTypeId.toString());
    }
    
    if (options.status) {
      params.append('status', options.status);
    }
    
    if (options.startDate) {
      params.append('start_date', options.startDate);
    }
    
    if (options.endDate) {
      params.append('end_date', options.endDate);
    }
    
    const url = `/api/v1/payments?${params.toString()}`;
    const response = await api.get<PaymentDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentDtoToModel),
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
   * Yeni bir ödeme oluşturur
   * @param data - Ödeme oluşturma verileri
   */
  create: async (
    data: CreatePaymentRequest
  ): Promise<ApiResponse<IPayment>> => {
    const response = await api.post<PaymentDto>('/api/v1/payments', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre ödeme detaylarını getirir
   * @param id - Ödeme ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IPayment>> => {
    const response = await api.get<PaymentDto>(`/api/v1/payments/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ödemeyi günceller
   * @param id - Ödeme ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdatePaymentRequest
  ): Promise<ApiResponse<IPayment>> => {
    const response = await api.put<PaymentDto>(`/api/v1/payments/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ödemeyi siler
   * @param id - Ödeme ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/payments/${id}`);
  },
  
  /**
   * Ödemeyi iptal eder
   * @param id - Ödeme ID'si
   */
  cancel: async (id: string | number): Promise<ApiResponse<IPayment>> => {
    const response = await api.post<PaymentDto>(`/api/v1/payments/${id}/cancel`, {});
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ödemeyi iade eder
   * @param id - Ödeme ID'si
   */
  refund: async (id: string | number): Promise<ApiResponse<IPayment>> => {
    const response = await api.post<PaymentDto>(`/api/v1/payments/${id}/refund`, {});
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ödeme planına göre ödemeleri listeler
   * @param planId - Ödeme planı ID'si
   */
  getByPlanId: async (planId: string | number): Promise<ApiResponse<IPayment[]>> => {
    const response = await api.get<PaymentDto[]>(`/api/v1/payment-plans/${planId}/payments`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Ödeme türüne göre ödemeleri listeler
   * @param typeId - Ödeme türü ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByTypeId: async (
    typeId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPayment>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/payment-types/${typeId}/payments?${params.toString()}`;
    const response = await api.get<PaymentDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentDtoToModel),
        page,
        limit: perPage,
        total: response.meta?.total || 0,
      };
    }
    
    return {
      ...response,
      data: [],
      page,
      limit: perPage,
      total: 0,
    };
  },
}; 