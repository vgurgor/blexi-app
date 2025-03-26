import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { ISeasonRegistrationProduct } from '../../types/models';

// API'den gelen sezon kaydı ürünü veri modeli
export interface SeasonRegistrationProductDto {
  id: number;
  tenant_id: number;
  season_registration_id: number;
  product_id: number;
  price_id?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  registration?: {
    id: number;
    guest_id: number;
    apart_id: number;
    season_code: string;
    check_in_date: string;
    check_out_date: string;
    status: 'active' | 'cancelled' | 'completed';
  };
  product?: {
    id: number;
    category_id: number;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    category?: {
      id: number;
      name: string;
    }
  };
  price?: {
    id: number;
    apart_id: number;
    season_code: string;
    product_id: number;
    price: number;
    currency: string;
  };
}

// Sezon kaydı ürünü oluşturma isteği modeli
export interface CreateSeasonRegistrationProductRequest {
  season_registration_id: number;
  product_id: number;
  price_id?: number;
  quantity: number;
  unit_price?: number;
  notes?: string;
}

// Sezon kaydı ürünü güncelleme isteği modeli
export interface UpdateSeasonRegistrationProductRequest {
  season_registration_id?: number;
  product_id?: number;
  price_id?: number;
  quantity?: number;
  unit_price?: number;
  notes?: string;
}

// API'den gelen SeasonRegistrationProductDto'yu ISeasonRegistrationProduct modeline dönüştüren yardımcı fonksiyon
const mapSeasonRegistrationProductDtoToModel = (dto: SeasonRegistrationProductDto): ISeasonRegistrationProduct => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    seasonRegistrationId: dto.season_registration_id.toString(),
    productId: dto.product_id.toString(),
    priceId: dto.price_id?.toString(),
    quantity: dto.quantity,
    unitPrice: dto.unit_price,
    totalPrice: dto.total_price,
    notes: dto.notes,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    registration: dto.registration ? {
      id: dto.registration.id.toString(),
      guestId: dto.registration.guest_id.toString(),
      apartId: dto.registration.apart_id.toString(),
      seasonCode: dto.registration.season_code,
      checkInDate: dto.registration.check_in_date,
      checkOutDate: dto.registration.check_out_date,
      status: dto.registration.status,
      // Bu alanlar yeterli değilse ISeasonRegistration'ın diğer özelliklerini de ekleyebiliriz
    } : undefined,
    product: dto.product ? {
      id: dto.product.id.toString(),
      name: dto.product.name,
      description: dto.product.description,
      categoryId: dto.product.category_id.toString(),
      category: dto.product.category ? {
        id: dto.product.category.id.toString(),
        name: dto.product.category.name
      } : undefined
    } : undefined,
    price: dto.price ? {
      id: dto.price.id.toString(),
      apartId: dto.price.apart_id.toString(),
      seasonCode: dto.price.season_code,
      productId: dto.price.product_id.toString(),
      price: dto.price.price,
      currency: dto.price.currency
    } : undefined
  };
};

/**
 * Sezon Kayıtları Ürünleri API servisi
 */
export const seasonRegistrationProductsApi = {
  /**
   * Tüm sezon kaydı ürünlerini listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ISeasonRegistrationProduct>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/season-registration-products?${params.toString()}`;
    const response = await api.get<SeasonRegistrationProductDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapSeasonRegistrationProductDtoToModel),
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
   * Yeni bir sezon kaydı ürünü oluşturur
   * @param request - Sezon kaydı ürünü oluşturma isteği
   */
  create: async (request: CreateSeasonRegistrationProductRequest): Promise<ApiResponse<ISeasonRegistrationProduct>> => {
    const response = await api.post<SeasonRegistrationProductDto>('/api/v1/season-registration-products', request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationProductDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre sezon kaydı ürünü detaylarını getirir
   * @param id - Sezon kaydı ürünü ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<ISeasonRegistrationProduct>> => {
    const response = await api.get<SeasonRegistrationProductDto>(`/api/v1/season-registration-products/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationProductDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Var olan bir sezon kaydı ürününü günceller
   * @param id - Güncellenecek sezon kaydı ürününün ID'si
   * @param request - Sezon kaydı ürünü güncelleme isteği
   */
  update: async (
    id: string | number,
    request: UpdateSeasonRegistrationProductRequest
  ): Promise<ApiResponse<ISeasonRegistrationProduct>> => {
    const response = await api.put<SeasonRegistrationProductDto>(`/api/v1/season-registration-products/${id}`, request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationProductDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Sezon kaydı ürününü siler
   * @param id - Silinecek sezon kaydı ürününün ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/season-registration-products/${id}`);
  },
  
  /**
   * Belirli bir sezon kaydına ait ürünleri listeler
   * @param registrationId - Sezon kaydı ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getByRegistrationId: async (
    registrationId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ISeasonRegistrationProduct>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/season-registrations/${registrationId}/products?${params.toString()}`;
    const response = await api.get<SeasonRegistrationProductDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapSeasonRegistrationProductDtoToModel),
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
   * Belirli bir ürüne ait sezon kayıtlarını listeler
   * @param productId - Ürün ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getByProductId: async (
    productId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ISeasonRegistrationProduct>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/products/${productId}/registrations?${params.toString()}`;
    const response = await api.get<SeasonRegistrationProductDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapSeasonRegistrationProductDtoToModel),
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
  }
}; 