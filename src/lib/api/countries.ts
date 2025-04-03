import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { ICountry } from '../../types/models';

// API'de tanımlanan Country modeli
export interface CountryDto {
  id: number;
  code: string;
  name: string;
  phone_code?: string;
  flag?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// Ülke oluşturma isteği için model
export interface CreateCountryRequest {
  code: string;
  name: string;
  phone_code?: string;
  flag?: string;
  status?: 'active' | 'inactive';
}

// Ülke güncelleme isteği için model
export interface UpdateCountryRequest {
  code?: string;
  name?: string;
  phone_code?: string;
  flag?: string;
  status?: 'active' | 'inactive';
}

// Ülke durumu güncelleme isteği için model
export interface UpdateCountryStatusRequest {
  status: 'active' | 'inactive';
}

// CountryDto'yu ICountry modeline dönüştüren yardımcı fonksiyon
const mapCountryDtoToModel = (dto: CountryDto): ICountry => {
  return {
    id: dto.id.toString(),
    code: dto.code,
    name: dto.name,
    phoneCode: dto.phone_code,
    flag: dto.flag,
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Countries API servisi
 */
export const countriesApi = {
  /**
   * Tüm ülkeleri listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ICountry>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/countries?${params.toString()}`;
    const response = await api.get<CountryDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapCountryDtoToModel),
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
   * Aktif tüm ülkeleri listeler
   */
  getActive: async (): Promise<ApiResponse<ICountry[]>> => {
    const response = await api.get<CountryDto[]>('/api/v1/countries/active');
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapCountryDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Yeni bir ülke oluşturur
   * @param data - Ülke oluşturma verileri
   */
  create: async (data: CreateCountryRequest): Promise<ApiResponse<ICountry>> => {
    const response = await api.post<CountryDto>('/api/v1/countries', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCountryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre ülke detaylarını getirir
   * @param id - Ülke ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<ICountry>> => {
    const response = await api.get<CountryDto>(`/api/v1/countries/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCountryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Kodu'ya göre ülke detaylarını getirir
   * @param code - Ülke kodu
   */
  getByCode: async (code: string): Promise<ApiResponse<ICountry>> => {
    const response = await api.get<CountryDto>(`/api/v1/countries/code/${code}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCountryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir ülkeyi günceller
   * @param id - Güncellenecek ülke ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateCountryRequest
  ): Promise<ApiResponse<ICountry>> => {
    const response = await api.put<CountryDto>(`/api/v1/countries/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCountryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ülke durumunu günceller
   * @param id - Güncellenecek ülke ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<ICountry>> => {
    const data: UpdateCountryStatusRequest = { status };
    const response = await api.patch<CountryDto>(`/api/v1/countries/${id}/status`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapCountryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Ülke siler
   * @param id - Silinecek ülke ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/countries/${id}`);
  },
}; 