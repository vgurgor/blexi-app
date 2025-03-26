import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IPrice } from '../../types/models';

// API'de tanımlanan Price modeli
export interface PriceDto {
  id: number;
  apart_id: number;
  apart?: {
    id: number;
    name: string;
  };
  season_code: string;
  season?: {
    code: string;
    name: string;
  };
  product_id: number;
  product?: {
    id: number;
    name: string;
    category_id: number;
    category?: {
      id: number;
      name: string;
    };
  };
  price: number;
  currency: string;
  start_date: string;
  end_date: string;
  taxes?: Array<{
    id: number;
    tax_type_id: number;
    name: string;
    percentage: number;
  }>;
  created_at?: string;
  updated_at?: string;
}

// Price oluşturma isteği için model
export interface CreatePriceRequest {
  apart_id: number;
  season_code: string;
  product_id: number;
  price: number;
  currency: string;
  start_date: string;
  end_date: string;
}

// Price güncelleme isteği için model
export interface UpdatePriceRequest {
  apart_id?: number;
  season_code?: string;
  product_id?: number;
  price?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
}

// Price için vergi ekleme isteği için model
export interface AddTaxToPriceRequest {
  tax_type_id: number;
}

// PriceDto'yu IPrice modeline dönüştüren yardımcı fonksiyon
const mapPriceDtoToModel = (dto: PriceDto): IPrice => {
  return {
    id: dto.id.toString(),
    apartId: dto.apart_id.toString(),
    apart: dto.apart ? {
      id: dto.apart.id.toString(),
      name: dto.apart.name,
    } : undefined,
    seasonCode: dto.season_code,
    season: dto.season ? {
      code: dto.season.code,
      name: dto.season.name,
    } : undefined,
    productId: dto.product_id.toString(),
    product: dto.product ? {
      id: dto.product.id.toString(),
      name: dto.product.name,
      categoryId: dto.product.category_id.toString(),
      category: dto.product.category ? {
        id: dto.product.category.id.toString(),
        name: dto.product.category.name,
      } : undefined,
    } : undefined,
    price: dto.price,
    currency: dto.currency,
    startDate: dto.start_date,
    endDate: dto.end_date,
    taxes: dto.taxes ? dto.taxes.map(tax => ({
      id: tax.id.toString(),
      taxTypeId: tax.tax_type_id.toString(),
      name: tax.name,
      percentage: tax.percentage,
    })) : undefined,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Prices API servisi
 */
export const pricesApi = {
  /**
   * Tüm fiyatları listeler
   * @param apartId - İsteğe bağlı apartman ID'si filtresi
   * @param seasonCode - İsteğe bağlı sezon kodu filtresi
   * @param productId - İsteğe bağlı ürün ID'si filtresi
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    apartId?: string | number,
    seasonCode?: string,
    productId?: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPrice>> => {
    const params = new URLSearchParams();
    
    if (apartId) {
      params.append('apart_id', apartId.toString());
    }
    
    if (seasonCode) {
      params.append('season_code', seasonCode);
    }
    
    if (productId) {
      params.append('product_id', productId.toString());
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/prices?${params.toString()}`;
    const response = await api.get<PriceDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPriceDtoToModel),
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
   * Yeni bir fiyat oluşturur
   * @param data - Fiyat oluşturma verileri
   */
  create: async (data: CreatePriceRequest): Promise<ApiResponse<IPrice>> => {
    const response = await api.post<PriceDto>('/api/v1/prices', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPriceDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre fiyat detaylarını getirir
   * @param id - Fiyat ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IPrice>> => {
    const response = await api.get<PriceDto>(`/api/v1/prices/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPriceDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir fiyatı günceller
   * @param id - Güncellenecek fiyat ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdatePriceRequest
  ): Promise<ApiResponse<void>> => {
    return await api.put<void>(`/api/v1/prices/${id}`, data);
  },
  
  /**
   * Fiyat siler
   * @param id - Silinecek fiyat ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/prices/${id}`);
  },
  
  /**
   * Belirli bir sezona ait fiyatları listeler
   * @param seasonCode - Sezon kodu
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getBySeasonCode: async (
    seasonCode: string,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPrice>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/seasons/${seasonCode}/prices?${params.toString()}`;
    const response = await api.get<PriceDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPriceDtoToModel),
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
   * Belirli bir apartmana ait fiyatları listeler
   * @param apartId - Apartman ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByApartId: async (
    apartId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPrice>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/aparts/${apartId}/prices?${params.toString()}`;
    const response = await api.get<PriceDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPriceDtoToModel),
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
   * Belirli bir ürüne ait fiyatları listeler
   * @param productId - Ürün ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByProductId: async (
    productId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPrice>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/products/${productId}/prices?${params.toString()}`;
    const response = await api.get<PriceDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPriceDtoToModel),
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
   * Belirli bir fiyata ait vergileri listeler
   * @param priceId - Fiyat ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getTaxes: async (
    priceId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/prices/${priceId}/taxes?${params.toString()}`;
    return await api.get<any>(url);
  },
  
  /**
   * Fiyata vergi ekler
   * @param priceId - Fiyat ID'si
   * @param taxTypeId - Vergi türü ID'si
   */
  addTax: async (
    priceId: string | number,
    taxTypeId: number
  ): Promise<ApiResponse<void>> => {
    const data: AddTaxToPriceRequest = { tax_type_id: taxTypeId };
    return await api.post<void>(`/api/v1/prices/${priceId}/taxes`, data);
  },
  
  /**
   * Fiyattan vergi kaldırır
   * @param priceId - Fiyat ID'si
   * @param taxTypeId - Vergi türü ID'si
   */
  removeTax: async (
    priceId: string | number,
    taxTypeId: string | number
  ): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/prices/${priceId}/taxes/${taxTypeId}`);
  },
}; 