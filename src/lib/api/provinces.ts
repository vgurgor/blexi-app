import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
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

// İl oluşturma isteği için model
export interface CreateProvinceRequest {
  country_id: number;
  code: string;
  name: string;
  plate_code?: string;
  status?: 'active' | 'inactive';
}

// İl güncelleme isteği için model
export interface UpdateProvinceRequest {
  country_id?: number;
  code?: string;
  name?: string;
  plate_code?: string;
  status?: 'active' | 'inactive';
}

// İl durumu güncelleme isteği için model
export interface UpdateProvinceStatusRequest {
  status: 'active' | 'inactive';
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
   * Tüm illeri listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IProvince>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/provinces?${params.toString()}`;
    const response = await api.get<ProvinceDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapProvinceDtoToModel),
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
   * Aktif tüm illeri listeler
   */
  getActive: async (): Promise<ApiResponse<IProvince[]>> => {
    const response = await api.get<ProvinceDto[]>('/api/v1/provinces/active');
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapProvinceDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Belirli bir ülkeye ait illeri listeler
   * @param countryId - Ülke ID'si
   */
  getByCountry: async (countryId: string | number): Promise<ApiResponse<IProvince[]>> => {
    const response = await api.get<ProvinceDto[]>(`/api/v1/provinces/country/${countryId}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapProvinceDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Yeni bir il oluşturur
   * @param data - İl oluşturma verileri
   */
  create: async (data: CreateProvinceRequest): Promise<ApiResponse<IProvince>> => {
    const response = await api.post<ProvinceDto>('/api/v1/provinces', data);
    
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
   * ID'ye göre il detaylarını getirir
   * @param id - İl ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IProvince>> => {
    const response = await api.get<ProvinceDto>(`/api/v1/provinces/${id}`);
    
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
   * Kodu'ya göre il detaylarını getirir
   * @param code - İl kodu
   */
  getByCode: async (code: string): Promise<ApiResponse<IProvince>> => {
    const response = await api.get<ProvinceDto>(`/api/v1/provinces/code/${code}`);
    
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
   * Mevcut bir ili günceller
   * @param id - Güncellenecek il ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateProvinceRequest
  ): Promise<ApiResponse<IProvince>> => {
    const response = await api.put<ProvinceDto>(`/api/v1/provinces/${id}`, data);
    
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
   * İl durumunu günceller
   * @param id - Güncellenecek il ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<IProvince>> => {
    const data: UpdateProvinceStatusRequest = { status };
    const response = await api.patch<ProvinceDto>(`/api/v1/provinces/${id}/status`, data);
    
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
   * İl siler
   * @param id - Silinecek il ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/provinces/${id}`);
  },
}; 