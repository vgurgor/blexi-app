import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IPaymentType, IPaymentTypeCategory } from '../../types/models';

// API'de tanımlanan Payment Type modeli
export interface PaymentTypeDto {
  id: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
    description?: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  name: string;
  bank_name?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Ödeme Tipi oluşturma isteği için model
export interface CreatePaymentTypeRequest {
  payment_type_category_id: number;
  name: string;
  bank_name?: string;
  description?: string;
  status: 'active' | 'inactive';
}

// Ödeme Tipi güncelleme isteği için model
export interface UpdatePaymentTypeRequest {
  payment_type_category_id?: number;
  name?: string;
  bank_name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// Ödeme Tipi durumu güncelleme isteği için model
export interface UpdatePaymentTypeStatusRequest {
  status: 'active' | 'inactive';
}

// PaymentTypeDto'yu IPaymentType modeline dönüştüren yardımcı fonksiyon
const mapPaymentTypeDtoToModel = (dto: PaymentTypeDto): IPaymentType => {
  return {
    id: dto.id.toString(),
    categoryId: dto.category_id.toString(),
    category: dto.category ? {
      id: dto.category.id.toString(),
      name: dto.category.name,
      description: dto.category.description,
      status: dto.category.status as 'active' | 'inactive',
      createdAt: dto.category.created_at,
      updatedAt: dto.category.updated_at,
    } : undefined,
    name: dto.name,
    bankName: dto.bank_name,
    description: dto.description,
    status: dto.status as 'active' | 'inactive',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Ödeme Tipleri API servisi
 */
export const paymentTypesApi = {
  /**
   * Tüm ödeme tiplerini listeler
   * @param categoryId - Filtreleme için kategori ID (isteğe bağlı)
   * @param status - Filtreleme için durum (isteğe bağlı)
   * @param search - Arama metni (isteğe bağlı)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    categoryId?: string | number,
    status?: 'active' | 'inactive',
    search?: string,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPaymentType>> => {
    const params = new URLSearchParams();
    
    if (categoryId) {
      params.append('category_id', categoryId.toString());
    }
    
    if (status) {
      params.append('status', status);
    }
    
    if (search) {
      params.append('search', search);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/payment-types?${params.toString()}`;
    const response = await api.get<PaymentTypeDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentTypeDtoToModel),
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
   * Yeni bir ödeme tipi oluşturur
   * @param data - Ödeme tipi oluşturma verileri
   */
  create: async (
    data: CreatePaymentTypeRequest
  ): Promise<ApiResponse<IPaymentType>> => {
    const response = await api.post<PaymentTypeDto>('/api/v1/payment-types', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentTypeDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre ödeme tipi detaylarını getirir
   * @param id - Ödeme tipi ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IPaymentType>> => {
    const response = await api.get<PaymentTypeDto>(`/api/v1/payment-types/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentTypeDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir ödeme tipini günceller
   * @param id - Güncellenecek ödeme tipi ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdatePaymentTypeRequest
  ): Promise<ApiResponse<IPaymentType>> => {
    const response = await api.put<PaymentTypeDto>(`/api/v1/payment-types/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentTypeDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ödeme tipi siler
   * @param id - Silinecek ödeme tipi ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/payment-types/${id}`);
  },
  
  /**
   * Ödeme tipinin durumunu günceller
   * @param id - Durumu güncellenecek ödeme tipi ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<IPaymentType>> => {
    const response = await api.put<PaymentTypeDto>(
      `/api/v1/payment-types/${id}/status`,
      { status }
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPaymentTypeDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belirli bir kategoriye ait ödeme tiplerini listeler
   * @param categoryId - Kategori ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByCategory: async (
    categoryId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPaymentType>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/payment-type-categories/${categoryId}/payment-types?${params.toString()}`;
    const response = await api.get<PaymentTypeDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPaymentTypeDtoToModel),
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