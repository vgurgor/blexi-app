import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IDiscountCategory } from '../../types/models';

// API'de tanımlanan Discount Category modeli
export interface DiscountCategoryDto {
  id: number;
  tenant_id: number;
  code: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// İndirim Kategorisi oluşturma isteği için model
export interface CreateDiscountCategoryRequest {
  code: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// İndirim Kategorisi güncelleme isteği için model
export interface UpdateDiscountCategoryRequest {
  code?: string;
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// İndirim Kategorisi durumu güncelleme isteği için model
export interface UpdateDiscountCategoryStatusRequest {
  status: 'active' | 'inactive';
}

// DiscountCategoryDto'yu IDiscountCategory modeline dönüştüren yardımcı fonksiyon
const mapDiscountCategoryDtoToModel = (dto: DiscountCategoryDto): IDiscountCategory => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    code: dto.code,
    name: dto.name,
    description: dto.description,
    status: dto.status as 'active' | 'inactive',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * İndirim Kategorileri API servisi
 */
export const discountCategoriesApi = {
  /**
   * Tüm indirim kategorilerini listeler
   * @param status - Filtreleme için durum (isteğe bağlı)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    status?: 'active' | 'inactive',
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IDiscountCategory>> => {
    const params = new URLSearchParams();
    
    if (status) {
      params.append('status', status);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/discount-categories?${params.toString()}`;
    const response = await api.get<DiscountCategoryDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapDiscountCategoryDtoToModel),
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
   * Yeni bir indirim kategorisi oluşturur
   * @param data - İndirim kategorisi oluşturma verileri
   */
  create: async (
    data: CreateDiscountCategoryRequest
  ): Promise<ApiResponse<IDiscountCategory>> => {
    const response = await api.post<DiscountCategoryDto>('/api/v1/discount-categories', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDiscountCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre indirim kategorisi detaylarını getirir
   * @param id - İndirim kategorisi ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IDiscountCategory>> => {
    const response = await api.get<DiscountCategoryDto>(`/api/v1/discount-categories/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDiscountCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir indirim kategorisini günceller
   * @param id - Güncellenecek indirim kategorisi ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateDiscountCategoryRequest
  ): Promise<ApiResponse<IDiscountCategory>> => {
    const response = await api.put<DiscountCategoryDto>(
      `/api/v1/discount-categories/${id}`,
      data
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDiscountCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * İndirim kategorisi siler
   * @param id - Silinecek indirim kategorisi ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/discount-categories/${id}`);
  },
  
  /**
   * İndirim kategorisinin durumunu günceller
   * @param id - Durumu güncellenecek indirim kategorisi ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<IDiscountCategory>> => {
    const response = await api.put<DiscountCategoryDto>(
      `/api/v1/discount-categories/${id}/status`,
      { status }
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDiscountCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
}; 