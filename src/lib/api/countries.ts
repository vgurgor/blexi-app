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
   */
  getAll: async (): Promise<ApiResponse<ICountry[]>> => {
    const response = await api.get<CountryDto[]>('/api/v1/addresses/countries');
    
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
   * ID'ye göre ülke detaylarını getirir
   * @param id - Ülke ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<ICountry>> => {
    const response = await api.get<CountryDto>(`/api/v1/addresses/countries/${id}`);
    
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
   * Belirli bir ülkenin illerini getirir
   * @param id - Ülke ID'si
   */
  getProvinces: async (id: string | number): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/api/v1/addresses/countries/${id}/provinces`);
    
    return response;
  },
}; 