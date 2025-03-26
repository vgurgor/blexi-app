import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IProduct, IProductCategory } from '../../types/models';

// API'de tanımlanan Product modeli
export interface ProductDto {
  id: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
    description?: string;
    status: string;
  };
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// Product oluşturma isteği için model
export interface CreateProductRequest {
  name: string;
  category_id: number;
  description?: string;
  status?: 'active' | 'inactive';
}

// Product güncelleme isteği için model
export interface UpdateProductRequest {
  name?: string;
  category_id?: number;
  description?: string;
  status?: 'active' | 'inactive';
}

// Product durumu güncelleme isteği için model
export interface UpdateProductStatusRequest {
  status: 'active' | 'inactive';
}

// ProductDto'yu IProduct modeline dönüştüren yardımcı fonksiyon
const mapProductDtoToModel = (dto: ProductDto): IProduct => {
  return {
    id: dto.id.toString(),
    categoryId: dto.category_id.toString(),
    category: dto.category ? {
      id: dto.category.id.toString(),
      name: dto.category.name,
      description: dto.category.description,
      status: dto.category.status as 'active' | 'inactive',
      createdAt: '',
      updatedAt: ''
    } : undefined,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Products API servisi
 */
export const productsApi = {
  /**
   * Tüm ürünleri listeler
   * @param status - İsteğe bağlı durum filtresi
   * @param categoryId - İsteğe bağlı kategori ID filtresi
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    status?: 'active' | 'inactive',
    categoryId?: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IProduct>> => {
    const params = new URLSearchParams();
    
    if (status) {
      params.append('status', status);
    }
    
    if (categoryId) {
      params.append('category_id', categoryId.toString());
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/products?${params.toString()}`;
    const response = await api.get<ProductDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapProductDtoToModel),
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
   * Yeni bir ürün oluşturur
   * @param data - Ürün oluşturma verileri
   */
  create: async (data: CreateProductRequest): Promise<ApiResponse<IProduct>> => {
    const response = await api.post<ProductDto>('/api/v1/products', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapProductDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre ürün detaylarını getirir
   * @param id - Ürün ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IProduct>> => {
    const response = await api.get<ProductDto>(`/api/v1/products/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapProductDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir ürünü günceller
   * @param id - Güncellenecek ürün ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateProductRequest
  ): Promise<ApiResponse<void>> => {
    return await api.put<void>(`/api/v1/products/${id}`, data);
  },
  
  /**
   * Ürün durumunu günceller
   * @param id - Güncellenecek ürün ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<void>> => {
    return await api.put<void>(`/api/v1/products/${id}/status`, { status });
  },
  
  /**
   * Ürün siler
   * @param id - Silinecek ürün ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/products/${id}`);
  },
  
  /**
   * Belirli bir kategoriye ait ürünleri listeler
   * @param categoryId - Kategori ID'si
   * @param status - İsteğe bağlı durum filtresi
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByCategoryId: async (
    categoryId: string | number,
    status?: 'active' | 'inactive',
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IProduct>> => {
    const params = new URLSearchParams();
    
    if (status) {
      params.append('status', status);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/product-categories/${categoryId}/products?${params.toString()}`;
    const response = await api.get<ProductDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapProductDtoToModel),
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