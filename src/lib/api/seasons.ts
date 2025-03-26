import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { ISeason } from '../../types/models';

// API'de tanımlanan Season modeli
export interface SeasonDto {
  id: number;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// Season oluşturma isteği için model
export interface CreateSeasonRequest {
  name: string;
  code: string;
  status?: 'active' | 'inactive';
}

// Season güncelleme isteği için model
export interface UpdateSeasonRequest {
  name?: string;
  code?: string;
  status?: 'active' | 'inactive';
}

// Season durumu güncelleme isteği için model
export interface UpdateSeasonStatusRequest {
  status: 'active' | 'inactive';
}

// SeasonDto'yu ISeason modeline dönüştüren yardımcı fonksiyon
const mapSeasonDtoToModel = (dto: SeasonDto): ISeason => {
  return {
    id: dto.id.toString(),
    name: dto.name,
    code: dto.code,
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Seasons API servisi
 */
export const seasonsApi = {
  /**
   * Tüm sezonları listeler
   * @param status - İsteğe bağlı durum filtresi
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    status?: 'active' | 'inactive',
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ISeason>> => {
    const params = new URLSearchParams();
    
    if (status) {
      params.append('status', status);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/seasons?${params.toString()}`;
    const response = await api.get<SeasonDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapSeasonDtoToModel),
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
   * Yeni bir sezon oluşturur
   * @param data - Sezon oluşturma verileri
   */
  create: async (data: CreateSeasonRequest): Promise<ApiResponse<ISeason>> => {
    const response = await api.post<SeasonDto>('/api/v1/seasons', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre sezon detaylarını getirir
   * @param id - Sezon ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<ISeason>> => {
    const response = await api.get<SeasonDto>(`/api/v1/seasons/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir sezonu günceller
   * @param id - Güncellenecek sezon ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateSeasonRequest
  ): Promise<ApiResponse<void>> => {
    return await api.put<void>(`/api/v1/seasons/${id}`, data);
  },
  
  /**
   * Sezon durumunu günceller
   * @param id - Güncellenecek sezon ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<void>> => {
    return await api.put<void>(`/api/v1/seasons/${id}/status`, { status });
  },
  
  /**
   * Sezon siler
   * @param id - Silinecek sezon ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/seasons/${id}`);
  },
}; 