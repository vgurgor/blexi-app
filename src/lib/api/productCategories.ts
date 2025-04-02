import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IProductCategory } from '../../types/models';

// API'de tanımlanan Product Category modeli
export interface ProductCategoryDto {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Product Category oluşturma isteği için model
export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// Product Category güncelleme isteği için model
export interface UpdateProductCategoryRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// Product Category durumu güncelleme isteği için model
export interface UpdateProductCategoryStatusRequest {
  status: 'active' | 'inactive';
}

// ProductCategoryDto'yu IProductCategory modeline dönüştüren yardımcı fonksiyon
const mapProductCategoryDtoToModel = (dto: ProductCategoryDto): IProductCategory => {
  return {
    id: dto.id.toString(),
    name: dto.name,
    description: dto.description,
    status: dto.status,
    productsCount: dto.products_count,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Product Categories API servisi
 */
export const productCategoriesApi = {
  /**
   * Tüm ürün kategorilerini listeler
   * @param status - İsteğe bağlı durum filtresi
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    status?: 'active' | 'inactive',
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IProductCategory>> => {
    const params = new URLSearchParams();
    
    if (status) {
      params.append('status', status);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/product-categories?${params.toString()}`;
    const response = await api.get<ProductCategoryDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapProductCategoryDtoToModel),
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
   * Yeni bir ürün kategorisi oluşturur
   * @param data - Ürün kategorisi oluşturma verileri
   */
  create: async (data: CreateProductCategoryRequest): Promise<ApiResponse<IProductCategory>> => {
    const response = await api.post<ProductCategoryDto>('/api/v1/product-categories', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapProductCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre ürün kategorisi detaylarını getirir
   * @param id - Ürün kategorisi ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IProductCategory>> => {
    const response = await api.get<ProductCategoryDto>(`/api/v1/product-categories/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapProductCategoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir ürün kategorisini günceller
   * @param id - Güncellenecek ürün kategorisi ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateProductCategoryRequest
  ): Promise<ApiResponse<void>> => {
    return await api.put<void>(`/api/v1/product-categories/${id}`, data);
  },
  
  /**
   * Ürün kategorisi durumunu günceller
   * @param id - Güncellenecek ürün kategorisi ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<void>> => {
    return await api.patch<void>(`/api/v1/product-categories/${id}/status`, { status });
  },
  
  /**
   * Ürün kategorisi siler
   * @param id - Silinecek ürün kategorisi ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/product-categories/${id}`);
  },
};