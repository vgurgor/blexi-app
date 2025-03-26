import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IDiscountRule, IDiscountCategory, IProduct, IProductCategory } from '../../types/models';

// API'de tanımlanan Discount Rule modeli
export interface DiscountRuleDto {
  id: number;
  tenant_id: number;
  discount_category_id: number;
  discount_category?: {
    id: number;
    code: string;
    name: string;
    description?: string;
    status: string;
  };
  product_id?: number;
  product?: {
    id: number;
    name: string;
    category_id: number;
    description?: string;
    status: string;
  };
  product_category_id?: number;
  product_category?: {
    id: number;
    name: string;
    description?: string;
    status: string;
  };
  start_date: string;
  end_date: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_price?: number;
  max_price?: number;
  min_nights?: number;
  max_nights?: number;
  priority: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// İndirim Kuralı oluşturma isteği için model
export interface CreateDiscountRuleRequest {
  discount_category_id: number;
  product_id?: number;
  product_category_id?: number;
  start_date: string;
  end_date: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_price?: number;
  max_price?: number;
  min_nights?: number;
  max_nights?: number;
  priority?: number;
  status?: 'active' | 'inactive';
}

// İndirim Kuralı güncelleme isteği için model
export interface UpdateDiscountRuleRequest {
  discount_category_id?: number;
  product_id?: number;
  product_category_id?: number;
  start_date?: string;
  end_date?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  min_price?: number;
  max_price?: number;
  min_nights?: number;
  max_nights?: number;
  priority?: number;
  status?: 'active' | 'inactive';
}

// İndirim Kuralı durumu güncelleme isteği için model
export interface UpdateDiscountRuleStatusRequest {
  status: 'active' | 'inactive';
}

// DiscountRuleDto'yu IDiscountRule modeline dönüştüren yardımcı fonksiyon
const mapDiscountRuleDtoToModel = (dto: DiscountRuleDto): IDiscountRule => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    discountCategoryId: dto.discount_category_id.toString(),
    discountCategory: dto.discount_category ? {
      id: dto.discount_category.id.toString(),
      tenantId: '', // API bu değeri dönmüyor
      code: dto.discount_category.code,
      name: dto.discount_category.name,
      description: dto.discount_category.description,
      status: dto.discount_category.status as 'active' | 'inactive',
      createdAt: '', // API bu değeri dönmüyor
      updatedAt: '', // API bu değeri dönmüyor
    } : undefined,
    productId: dto.product_id?.toString(),
    product: dto.product ? {
      id: dto.product.id.toString(),
      categoryId: dto.product.category_id.toString(),
      name: dto.product.name,
      description: dto.product.description,
      status: dto.product.status as 'active' | 'inactive',
      createdAt: '', // API bu değeri dönmüyor
      updatedAt: '', // API bu değeri dönmüyor
    } : undefined,
    productCategoryId: dto.product_category_id?.toString(),
    productCategory: dto.product_category ? {
      id: dto.product_category.id.toString(),
      name: dto.product_category.name,
      description: dto.product_category.description,
      status: dto.product_category.status as 'active' | 'inactive',
      createdAt: '', // API bu değeri dönmüyor
      updatedAt: '', // API bu değeri dönmüyor
    } : undefined,
    startDate: dto.start_date,
    endDate: dto.end_date,
    discountType: dto.discount_type,
    discountValue: dto.discount_value,
    minPrice: dto.min_price,
    maxPrice: dto.max_price,
    minNights: dto.min_nights,
    maxNights: dto.max_nights,
    priority: dto.priority,
    status: dto.status as 'active' | 'inactive',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * İndirim Kuralları API servisi
 */
export const discountRulesApi = {
  /**
   * Tüm indirim kurallarını listeler
   * @param categoryId - Filtreleme için kategori ID (isteğe bağlı)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    categoryId?: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IDiscountRule>> => {
    const params = new URLSearchParams();
    
    if (categoryId) {
      params.append('category_id', categoryId.toString());
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/discount-rules?${params.toString()}`;
    const response = await api.get<DiscountRuleDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapDiscountRuleDtoToModel),
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
   * Yeni bir indirim kuralı oluşturur
   * @param data - İndirim kuralı oluşturma verileri
   */
  create: async (
    data: CreateDiscountRuleRequest
  ): Promise<ApiResponse<IDiscountRule>> => {
    const response = await api.post<DiscountRuleDto>('/api/v1/discount-rules', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDiscountRuleDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre indirim kuralı detaylarını getirir
   * @param id - İndirim kuralı ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IDiscountRule>> => {
    const response = await api.get<DiscountRuleDto>(`/api/v1/discount-rules/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDiscountRuleDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir indirim kuralını günceller
   * @param id - Güncellenecek indirim kuralı ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateDiscountRuleRequest
  ): Promise<ApiResponse<IDiscountRule>> => {
    const response = await api.put<DiscountRuleDto>(`/api/v1/discount-rules/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDiscountRuleDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * İndirim kuralı siler
   * @param id - Silinecek indirim kuralı ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/discount-rules/${id}`);
  },
  
  /**
   * İndirim kuralının durumunu günceller
   * @param id - Durumu güncellenecek indirim kuralı ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<IDiscountRule>> => {
    const response = await api.put<DiscountRuleDto>(
      `/api/v1/discount-rules/${id}/status`,
      { status }
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDiscountRuleDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belirli bir kategoriye ait indirim kurallarını listeler
   * @param categoryId - Kategori ID'si
   */
  getByCategory: async (
    categoryId: string | number
  ): Promise<ApiResponse<IDiscountRule[]>> => {
    const response = await api.get<DiscountRuleDto[]>(
      `/api/v1/discount-categories/${categoryId}/discount-rules`
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapDiscountRuleDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
}; 