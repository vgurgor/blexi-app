import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
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

// İlçe oluşturma isteği için model
export interface CreateDistrictRequest {
  province_id: number;
  code: string;
  name: string;
  status?: 'active' | 'inactive';
}

// İlçe güncelleme isteği için model
export interface UpdateDistrictRequest {
  province_id?: number;
  code?: string;
  name?: string;
  status?: 'active' | 'inactive';
}

// İlçe durumu güncelleme isteği için model
export interface UpdateDistrictStatusRequest {
  status: 'active' | 'inactive';
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
   * Tüm ilçeleri listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IDistrict>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/districts?${params.toString()}`;
    const response = await api.get<DistrictDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapDistrictDtoToModel),
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
   * Aktif tüm ilçeleri listeler
   */
  getActive: async (): Promise<ApiResponse<IDistrict[]>> => {
    const response = await api.get<DistrictDto[]>('/api/v1/districts/active');
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapDistrictDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Belirli bir ile ait ilçeleri listeler
   * @param provinceId - İl ID'si
   */
  getByProvince: async (provinceId: string | number): Promise<ApiResponse<IDistrict[]>> => {
    const response = await api.get<DistrictDto[]>(`/api/v1/districts/province/${provinceId}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapDistrictDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Yeni bir ilçe oluşturur
   * @param data - İlçe oluşturma verileri
   */
  create: async (data: CreateDistrictRequest): Promise<ApiResponse<IDistrict>> => {
    const response = await api.post<DistrictDto>('/api/v1/districts', data);
    
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
  
  /**
   * ID'ye göre ilçe detaylarını getirir
   * @param id - İlçe ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IDistrict>> => {
    const response = await api.get<DistrictDto>(`/api/v1/districts/${id}`);
    
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
  
  /**
   * Kodu'ya göre ilçe detaylarını getirir
   * @param code - İlçe kodu
   */
  getByCode: async (code: string): Promise<ApiResponse<IDistrict>> => {
    const response = await api.get<DistrictDto>(`/api/v1/districts/code/${code}`);
    
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
  
  /**
   * Mevcut bir ilçeyi günceller
   * @param id - Güncellenecek ilçe ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateDistrictRequest
  ): Promise<ApiResponse<IDistrict>> => {
    const response = await api.put<DistrictDto>(`/api/v1/districts/${id}`, data);
    
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
  
  /**
   * İlçe durumunu günceller
   * @param id - Güncellenecek ilçe ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<IDistrict>> => {
    const data: UpdateDistrictStatusRequest = { status };
    const response = await api.patch<DistrictDto>(`/api/v1/districts/${id}/status`, data);
    
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
  
  /**
   * İlçe siler
   * @param id - Silinecek ilçe ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/districts/${id}`);
  },
}; 