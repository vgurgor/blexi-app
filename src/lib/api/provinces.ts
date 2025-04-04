import { api } from './base';
import { ApiResponse } from '../../types/api';
import { IProvince } from '../../types/models';

// API'de tanımlanan Province modeli
export interface ProvinceDto {
  id: number;
  country_id: number;
  country?: {
    id: number;
    code: string;
    name: string;
  };
  code: string;
  name: string;
  plate_code?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// ProvinceDto'yu IProvince modeline dönüştüren yardımcı fonksiyon
const mapProvinceDtoToModel = (dto: ProvinceDto): IProvince => {
  return {
    id: dto.id.toString(),
    countryId: dto.country_id.toString(),
    country: dto.country ? {
      id: dto.country.id.toString(),
      code: dto.country.code,
      name: dto.country.name
    } : undefined,
    code: dto.code,
    name: dto.name,
    plateCode: dto.plate_code,
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Provinces API servisi
 */
export const provincesApi = {
  /**
   * Belirli bir ilin bilgilerini getirir
   * @param id - İl ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IProvince>> => {
    const response = await api.get<ProvinceDto>(`/api/v1/addresses/provinces/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapProvinceDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belirli bir ile ait ilçeleri getirir
   * @param id - İl ID'si
   */
  getDistricts: async (id: string | number): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/api/v1/addresses/provinces/${id}/districts`);
    
    return response;
  },
}; 