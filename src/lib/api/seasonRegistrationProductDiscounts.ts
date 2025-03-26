import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { ISeasonRegistrationProductDiscount } from '../../types/models';

// API'den gelen sezon kaydı ürün indirimi veri modeli
export interface SeasonRegistrationProductDiscountDto {
  id: number;
  tenant_id: number;
  season_registration_product_id: number;
  discount_rule_id: number;
  discount_type: 'percentage' | 'fixed';
  discount_rate?: number;
  discount_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  discount_rule?: {
    id: number;
    discount_category_id: number;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    status: 'active' | 'inactive';
  };
  season_registration_product?: {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
  };
}

// Sezon kaydı ürün indirimi oluşturma isteği modeli
export interface CreateSeasonRegistrationProductDiscountRequest {
  discount_rule_id: number;
  discount_type?: 'percentage' | 'fixed';
  discount_rate?: number;
  notes?: string;
}

// Sezon kaydı ürün indirimi güncelleme isteği modeli
export interface UpdateSeasonRegistrationProductDiscountRequest {
  discount_rule_id?: number;
  discount_type?: 'percentage' | 'fixed';
  discount_rate?: number;
  notes?: string;
}

// API'den gelen SeasonRegistrationProductDiscountDto'yu ISeasonRegistrationProductDiscount modeline dönüştüren yardımcı fonksiyon
const mapSeasonRegistrationProductDiscountDtoToModel = (dto: SeasonRegistrationProductDiscountDto): ISeasonRegistrationProductDiscount => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    seasonRegistrationProductId: dto.season_registration_product_id.toString(),
    discountRuleId: dto.discount_rule_id.toString(),
    discountType: dto.discount_type,
    discountRate: dto.discount_rate,
    discountAmount: dto.discount_amount,
    notes: dto.notes,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    discountRule: dto.discount_rule ? {
      id: dto.discount_rule.id.toString(),
      discountCategoryId: dto.discount_rule.discount_category_id.toString(),
      discountType: dto.discount_rule.discount_type,
      discountValue: dto.discount_rule.discount_value,
      status: dto.discount_rule.status,
      // IDiscountRule'un diğer özellikleri eklenebilir
    } : undefined,
    seasonRegistrationProduct: dto.season_registration_product ? {
      id: dto.season_registration_product.id.toString(),
      productId: dto.season_registration_product.product_id.toString(),
      quantity: dto.season_registration_product.quantity,
      unitPrice: dto.season_registration_product.unit_price,
      totalPrice: dto.season_registration_product.total_price,
      // ISeasonRegistrationProduct'ın diğer özellikleri eklenebilir
    } : undefined
  };
};

/**
 * Sezon Kaydı Ürün İndirimleri API servisi
 */
export const seasonRegistrationProductDiscountsApi = {
  /**
   * Belirli bir sezon kaydı ürününe ait tüm indirimleri listeler
   * @param productId - Sezon kaydı ürünü ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getByProductId: async (
    productId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ISeasonRegistrationProductDiscount>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/season-registration-products/${productId}/discounts?${params.toString()}`;
    const response = await api.get<SeasonRegistrationProductDiscountDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapSeasonRegistrationProductDiscountDtoToModel),
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
   * Belirli bir sezon kaydı ürününe indirim uygular
   * @param productId - Sezon kaydı ürünü ID'si
   * @param request - İndirim oluşturma isteği
   */
  create: async (
    productId: string | number,
    request: CreateSeasonRegistrationProductDiscountRequest
  ): Promise<ApiResponse<ISeasonRegistrationProductDiscount>> => {
    const response = await api.post<SeasonRegistrationProductDiscountDto>(
      `/api/v1/season-registration-products/${productId}/discounts`,
      request
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationProductDiscountDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre belirli bir sezon kaydı ürün indirimi detaylarını getirir
   * @param id - İndirim ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<ISeasonRegistrationProductDiscount>> => {
    const response = await api.get<SeasonRegistrationProductDiscountDto>(`/api/v1/discounts/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationProductDiscountDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Var olan bir sezon kaydı ürün indirimini günceller
   * @param productId - Sezon kaydı ürünü ID'si 
   * @param id - Güncellenecek indirim ID'si
   * @param request - İndirim güncelleme isteği
   */
  update: async (
    productId: string | number,
    id: string | number,
    request: UpdateSeasonRegistrationProductDiscountRequest
  ): Promise<ApiResponse<ISeasonRegistrationProductDiscount>> => {
    const response = await api.put<SeasonRegistrationProductDiscountDto>(
      `/api/v1/season-registration-products/${productId}/discounts/${id}`,
      request
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationProductDiscountDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Sezon kaydı ürün indirimini siler
   * @param productId - Sezon kaydı ürünü ID'si
   * @param id - Silinecek indirim ID'si
   */
  delete: async (
    productId: string | number,
    id: string | number
  ): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/season-registration-products/${productId}/discounts/${id}`);
  }
}; 