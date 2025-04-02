import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { ICurrency } from '../../types/models';

// API'de tanımlanan Currency modeli
export interface CurrencyDto {
  id: number;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_default: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// Currency oluşturma isteği için model
export interface CreateCurrencyRequest {
  code: string;
  name: string;
  symbol: string;
  decimal_places?: number;
  status?: 'active' | 'inactive';
}

// Currency güncelleme isteği için model
export interface UpdateCurrencyRequest {
  code?: string;
  name?: string;
  symbol?: string;
  decimal_places?: number;
  status?: 'active' | 'inactive';
}

// Currency durumu güncelleme isteği için model
export interface UpdateCurrencyStatusRequest {
  status: 'active' | 'inactive';
}

// CurrencyDto'yu ICurrency modeline dönüştüren yardımcı fonksiyon
const mapCurrencyDtoToModel = (dto: CurrencyDto): ICurrency => {
  return {
    id: dto.id.toString(),
    code: dto.code,
    name: dto.name,
    symbol: dto.symbol,
    decimalPlaces: dto.decimal_places,
    isDefault: dto.is_default,
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Currencies API servisi
 */
export const currenciesApi = {
  /**
   * Tüm para birimlerini listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ICurrency>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/currencies?${params.toString()}`;
    const response = await api.get<CurrencyDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapCurrencyDtoToModel),
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
   * Aktif tüm para birimlerini listeler
   */
  getActive: async (): Promise<ApiResponse<ICurrency[]>> => {
    const response = await api.get<CurrencyDto[]>('/api/v1/currencies/active');
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapCurrencyDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Varsayılan para birimini getirir
   */
  getDefault: async (): Promise<ApiResponse<ICurrency>> => {
    const response = await api.get<CurrencyDto>('/api/v1/currencies/default');
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCurrencyDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Yeni bir para birimi oluşturur
   * @param data - Para birimi oluşturma verileri
   */
  create: async (data: CreateCurrencyRequest): Promise<ApiResponse<ICurrency>> => {
    const response = await api.post<CurrencyDto>('/api/v1/currencies', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCurrencyDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre para birimi detaylarını getirir
   * @param id - Para birimi ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<ICurrency>> => {
    const response = await api.get<CurrencyDto>(`/api/v1/currencies/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCurrencyDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir para birimini günceller
   * @param id - Güncellenecek para birimi ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateCurrencyRequest
  ): Promise<ApiResponse<ICurrency>> => {
    const response = await api.put<CurrencyDto>(`/api/v1/currencies/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCurrencyDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Para birimi durumunu günceller
   * @param id - Güncellenecek para birimi ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<ICurrency>> => {
    const data: UpdateCurrencyStatusRequest = { status };
    const response = await api.patch<CurrencyDto>(`/api/v1/currencies/${id}/status`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCurrencyDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Para birimini varsayılan olarak ayarlar
   * @param id - Varsayılan olarak ayarlanacak para birimi ID'si
   */
  setAsDefault: async (id: string | number): Promise<ApiResponse<ICurrency>> => {
    const response = await api.post<CurrencyDto>(`/api/v1/currencies/${id}/default`, {});
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCurrencyDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Para birimi siler
   * @param id - Silinecek para birimi ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/currencies/${id}`);
  },
};