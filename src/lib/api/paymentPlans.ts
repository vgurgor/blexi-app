import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IPaymentPlan } from '../../types/models';

// API'den gelen ödeme planı veri modeli
export interface PaymentPlanDto {
  id: number;
  season_registration_product_id: number;
  planned_payment_type_id: number;
  planned_payment_type?: {
    id: number;
    name: string;
    bank_name?: string;
    description?: string;
    status: string;
  };
  planned_amount: number;
  planned_date: string;
  is_deposit: boolean;
  deposit_refund_status?: 'not_refunded' | 'partially_refunded' | 'fully_refunded';
  status: 'planned' | 'paid' | 'partial_paid' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Ödeme planı oluşturma isteği için model
export interface CreatePaymentPlanRequest {
  season_registration_product_id: number;
  planned_payment_type_id: number;
  planned_amount: number;
  planned_date: string;
  is_deposit?: boolean;
  deposit_refund_status?: 'not_refunded' | 'partially_refunded' | 'fully_refunded';
  status: 'planned' | 'paid' | 'partial_paid' | 'overdue';
  notes?: string;
}

// Ödeme planı güncelleme isteği için model
export interface UpdatePaymentPlanRequest {
  planned_payment_type_id?: number;
  planned_amount?: number;
  planned_date?: string;
  is_deposit?: boolean;
  deposit_refund_status?: 'not_refunded' | 'partially_refunded' | 'fully_refunded';
  status?: 'planned' | 'paid' | 'partial_paid' | 'overdue';
  notes?: string;
}

// Ödeme planı durum güncelleme isteği için model
export interface UpdatePaymentPlanStatusRequest {
  status: 'planned' | 'paid' | 'partial_paid' | 'overdue';
}

// Depozito iadesi işleme isteği için model
export interface ProcessDepositRefundRequest {
  refund_amount: number;
}

/**
 * DTO'yu model tipine dönüştüren yardımcı fonksiyon
 */
const mapPaymentPlanDtoToModel = (dto: PaymentPlanDto): IPaymentPlan => {
  return {
    id: dto.id.toString(),
    seasonRegistrationProductId: dto.season_registration_product_id.toString(),
    plannedPaymentTypeId: dto.planned_payment_type_id.toString(),
    plannedPaymentType: dto.planned_payment_type ? {
      id: dto.planned_payment_type.id.toString(),
      name: dto.planned_payment_type.name,
      bankName: dto.planned_payment_type.bank_name,
      description: dto.planned_payment_type.description,
      status: dto.planned_payment_type.status,
    } : undefined,
    plannedAmount: dto.planned_amount,
    plannedDate: dto.planned_date,
    isDeposit: dto.is_deposit,
    depositRefundStatus: dto.deposit_refund_status,
    status: dto.status,
    notes: dto.notes,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Ödeme Planları API servisi
 */
export const paymentPlansApi = {
  /**
   * Ödeme planlarını listeler, filtreleme seçenekleriyle
   * @param options - Filtreleme ve sayfalama seçenekleri
   */
  getAll: async (options: {
    page?: number;
    perPage?: number;
    seasonRegistrationId?: string | number;
    status?: 'planned' | 'paid' | 'partial_paid' | 'overdue';
    startDate?: string;
    endDate?: string;
    isDeposit?: boolean;
  } = {}): Promise<PaginatedResponse<IPaymentPlan>> => {
    const params = new URLSearchParams();
    
    if (options.page) {
      params.append('page', options.page.toString());
    }
    
    if (options.perPage) {
      params.append('per_page', options.perPage.toString());
    }
    
    if (options.seasonRegistrationId) {
      params.append('season_registration_id', options.seasonRegistrationId.toString());
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
    
    if (options.isDeposit !== undefined) {
      params.append('is_deposit', options.isDeposit.toString());
    }
    
    const url = `/api/v1/payment-plans?${params.toString()}`;
    const response = await api.get<PaymentPlanDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentPlanDtoToModel),
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
   * Yeni bir ödeme planı oluşturur
   * @param data - Ödeme planı oluşturma verileri
   */
  create: async (
    data: CreatePaymentPlanRequest
  ): Promise<ApiResponse<IPaymentPlan>> => {
    const response = await api.post<PaymentPlanDto>('/api/v1/payment-plans', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentPlanDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre ödeme planı detaylarını getirir
   * @param id - Ödeme planı ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IPaymentPlan>> => {
    const response = await api.get<PaymentPlanDto>(`/api/v1/payment-plans/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentPlanDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ödeme planını günceller
   * @param id - Ödeme planı ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdatePaymentPlanRequest
  ): Promise<ApiResponse<IPaymentPlan>> => {
    const response = await api.put<PaymentPlanDto>(`/api/v1/payment-plans/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentPlanDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ödeme planını siler
   * @param id - Ödeme planı ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/payment-plans/${id}`);
  },
  
  /**
   * Ödeme planının durumunu günceller
   * @param id - Ödeme planı ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'planned' | 'paid' | 'partial_paid' | 'overdue'
  ): Promise<ApiResponse<IPaymentPlan>> => {
    const data: UpdatePaymentPlanStatusRequest = { status };
    const response = await api.patch<PaymentPlanDto>(`/api/v1/payment-plans/${id}/status`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentPlanDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Sezon kaydı ürünü için ödeme planlarını listeler
   * @param productId - Sezon kaydı ürün ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByProductId: async (
    productId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPaymentPlan>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/season-registration-products/${productId}/payment-plans?${params.toString()}`;
    const response = await api.get<PaymentPlanDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentPlanDtoToModel),
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
  
  /**
   * Vadesi geçmiş ödeme planlarını listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getOverdue: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPaymentPlan>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/payment-plans/overdue?${params.toString()}`;
    const response = await api.get<PaymentPlanDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentPlanDtoToModel),
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
  
  /**
   * Depozito ödeme planlarını listeler
   * @param options - Filtreleme ve sayfalama seçenekleri
   */
  getDeposits: async (options: {
    page?: number;
    perPage?: number;
    status?: 'planned' | 'paid' | 'partial_paid' | 'overdue';
  } = {}): Promise<PaginatedResponse<IPaymentPlan>> => {
    const params = new URLSearchParams();
    
    if (options.page) {
      params.append('page', options.page.toString());
    }
    
    if (options.perPage) {
      params.append('per_page', options.perPage.toString());
    }
    
    if (options.status) {
      params.append('status', options.status);
    }
    
    const url = `/api/v1/payment-plans/deposits?${params.toString()}`;
    const response = await api.get<PaymentPlanDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentPlanDtoToModel),
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
   * Depozito iadesini işler
   * @param id - Ödeme planı ID'si
   * @param refundAmount - İade edilecek miktar
   */
  processDepositRefund: async (
    id: string | number,
    refundAmount: number
  ): Promise<ApiResponse<IPaymentPlan>> => {
    const data: ProcessDepositRefundRequest = { refund_amount: refundAmount };
    const response = await api.post<PaymentPlanDto>(`/api/v1/payment-plans/${id}/refund`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentPlanDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belirli bir kayıt için ödeme planlarını getirir
   * @param registrationId - Sezon kaydı ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByRegistrationId: async (
    registrationId: string | number,
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<IPaymentPlan>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/season-registrations/${registrationId}/payment-plans?${params.toString()}`;
    const response = await api.get<PaymentPlanDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentPlanDtoToModel),
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
  
  /**
   * Belirli bir kayıt için ödeme özetini getirir
   * @param registrationId - Sezon kaydı ID'si 
   */
  getPaymentSummary: async (registrationId: string | number): Promise<ApiResponse<any>> => {
    const url = `/api/v1/season-registrations/${registrationId}/payment-summary`;
    return await api.get(url);
  }
}; 