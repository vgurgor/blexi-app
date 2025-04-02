import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { ITaxType } from '../../types/models';

// API'de tanımlanan Tax Type modeli
export interface TaxTypeDto {
  id: number;
  name: string;
  tax_code: string;
  percentage: number;
  priority: number;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// Tax Type oluşturma isteği için model
export interface CreateTaxTypeRequest {
  name: string;
  tax_code: string;
  percentage: number;
  priority: number;
  description?: string;
  status: 'active' | 'inactive';
}

// Tax Type güncelleme isteği için model
export interface UpdateTaxTypeRequest {
  name?: string;
  tax_code?: string;
  percentage?: number;
  priority?: number;
  description?: string;
  status?: 'active' | 'inactive';
}

// Tax Type durumu güncelleme isteği için model
export interface UpdateTaxTypeStatusRequest {
  status: 'active' | 'inactive';
}

// TaxTypeDto'yu ITaxType modeline dönüştüren yardımcı fonksiyon
const mapTaxTypeDtoToModel = (dto: TaxTypeDto): ITaxType => {
  return {
    id: dto.id.toString(),
    name: dto.name,
    taxCode: dto.tax_code,
    percentage: dto.percentage,
    priority: dto.priority,
    description: dto.description,
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Tax Types API servisi
 */
export const taxTypesApi = {
  /**
   * Tüm vergi türlerini listeler
   * @param status - İsteğe bağlı durum filtresi
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    status?: 'active' | 'inactive',
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ITaxType>> => {
    const params = new URLSearchParams();
    
    if (status) {
      params.append('status', status);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/tax-types?${params.toString()}`;
    const response = await api.get<TaxTypeDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapTaxTypeDtoToModel),
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
   * Yeni bir vergi türü oluşturur
   * @param data - Vergi türü oluşturma verileri
   */
  create: async (data: CreateTaxTypeRequest): Promise<ApiResponse<ITaxType>> => {
    const response = await api.post<TaxTypeDto>('/api/v1/tax-types', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapTaxTypeDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre vergi türü detaylarını getirir
   * @param id - Vergi türü ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<ITaxType>> => {
    const response = await api.get<TaxTypeDto>(`/api/v1/tax-types/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapTaxTypeDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir vergi türünü günceller
   * @param id - Güncellenecek vergi türü ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateTaxTypeRequest
  ): Promise<ApiResponse<void>> => {
    return await api.put<void>(`/api/v1/tax-types/${id}`, data);
  },
  
  /**
   * Vergi türü durumunu günceller
   * @param id - Güncellenecek vergi türü ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<void>> => {
    return await api.patch<void>(`/api/v1/tax-types/${id}/status`, { status });
  },
  
  /**
   * Vergi türü siler
   * @param id - Silinecek vergi türü ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/tax-types/${id}`);
  },
};