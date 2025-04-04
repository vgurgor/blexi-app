import { api } from './base';
import { ApiResponse } from '../../types/api';
import { IDistrict } from '../../types/models';

// API'de tanımlanan District modeli
export interface DistrictDto {
  id: number;
  province_id: number;
  province?: {
    id: number;
    code: string;
    name: string;
    country_id: number;
  };
  code: string;
  name: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// DistrictDto'yu IDistrict modeline dönüştüren yardımcı fonksiyon
const mapDistrictDtoToModel = (dto: DistrictDto): IDistrict => {
  return {
    id: dto.id.toString(),
    provinceId: dto.province_id.toString(),
    province: dto.province ? {
      id: dto.province.id.toString(),
      code: dto.province.code,
      name: dto.province.name,
      countryId: dto.province.country_id.toString()
    } : undefined,
    code: dto.code,
    name: dto.name,
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Districts API servisi
 */
export const districtsApi = {
  /**
   * Belirli bir ilçenin bilgilerini getirir
   * @param id - İlçe ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IDistrict>> => {
    const response = await api.get<DistrictDto>(`/api/v1/addresses/districts/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDistrictDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
}; 