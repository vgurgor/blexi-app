import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IPaymentTypeCategory } from '../../types/models';

// API'de tanımlanan Payment Type Category modeli
export interface PaymentTypeCategoryDto {
  id: number;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Ödeme Tipi Kategorisi oluşturma isteği için model
export interface CreatePaymentTypeCategoryRequest {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

// Ödeme Tipi Kategorisi güncelleme isteği için model
export interface UpdatePaymentTypeCategoryRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// Ödeme Tipi Kategorisi durumu güncelleme isteği için model
export interface UpdatePaymentTypeCategoryStatusRequest {
  status: 'active' | 'inactive';
}

// PaymentTypeCategoryDto'yu IPaymentTypeCategory modeline dönüştüren yardımcı fonksiyon
const mapPaymentTypeCategoryDtoToModel = (dto: PaymentTypeCategoryDto): IPaymentTypeCategory => {
  return {
    id: dto.id.toString(),
    name: dto.name,
    description: dto.description,
    status: dto.status as 'active' | 'inactive',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Ödeme Tipi Kategorileri API servisi
 */
export const paymentTypeCategoriesApi = {
  /**
   * Tüm ödeme tipi kategorilerini listeler
   * @param status - Filtreleme için durum (isteğe bağlı)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    status?: 'active' | 'inactive',
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPaymentTypeCategory>> => {
    const params = new URLSearchParams();
    
    if (status) {
      params.append('status', status);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/payment-type-categories?${params.toString()}`;
    const response = await api.get<PaymentTypeCategoryDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentTypeCategoryDtoToModel),
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
   * Yeni bir ödeme tipi kategorisi oluşturur
   * @param data - Ödeme tipi kategorisi oluşturma verileri
   */
  create: async (
    data: CreatePaymentTypeCategoryRequest
  ): Promise<ApiResponse<IPaymentTypeCategory>> => {
    const response = await api.post<PaymentTypeCategoryDto>('/api/v1/payment-type-categories', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentTypeCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre ödeme tipi kategorisi detaylarını getirir
   * @param id - Ödeme tipi kategorisi ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IPaymentTypeCategory>> => {
    const response = await api.get<PaymentTypeCategoryDto>(`/api/v1/payment-type-categories/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentTypeCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir ödeme tipi kategorisini günceller
   * @param id - Güncellenecek ödeme tipi kategorisi ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdatePaymentTypeCategoryRequest
  ): Promise<ApiResponse<IPaymentTypeCategory>> => {
    const response = await api.put<PaymentTypeCategoryDto>(
      `/api/v1/payment-type-categories/${id}`,
      data
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentTypeCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ödeme tipi kategorisi siler
   * @param id - Silinecek ödeme tipi kategorisi ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/payment-type-categories/${id}`);
  },
  
  /**
   * Ödeme tipi kategorisinin durumunu günceller
   * @param id - Durumu güncellenecek ödeme tipi kategorisi ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<IPaymentTypeCategory>> => {
    const response = await api.put<PaymentTypeCategoryDto>(
      `/api/v1/payment-type-categories/${id}/status`,
      { status }
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentTypeCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
}; 