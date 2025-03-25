import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IFeature } from '../../types/models';

// API'de tanımlanan Feature modeli
export interface FeatureDto {
  id: number;
  name: string;
  code: string;
  type: 'ROOM' | 'BED' | 'APART' | 'MIXED';
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// API isteklerinde kullanılacak filtreler
export interface FeatureFilters {
  type?: 'ROOM' | 'BED' | 'APART' | 'MIXED';
  status?: 'active' | 'inactive';
  page?: number;
  per_page?: number;
}

// Yeni özellik oluşturma isteği için model
export interface CreateFeatureRequest {
  name: string;
  code: string;
  type: 'ROOM' | 'BED' | 'APART' | 'MIXED';
  status: 'active' | 'inactive';
}

// Özellik güncelleme isteği için model
export interface UpdateFeatureRequest {
  name: string;
  code: string;
  type: 'ROOM' | 'BED' | 'APART' | 'MIXED';
  status: 'active' | 'inactive';
}

/**
 * API DTO'yu iç modele dönüştür
 */
function mapDtoToModel(dto: FeatureDto): IFeature {
  return {
    id: dto.id.toString(),
    name: dto.name,
    code: dto.code,
    type: dto.type,
    status: dto.status,
    category: mapTypeToCategory(dto.type),
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
}

/**
 * Feature type'ını IFeature category'sine dönüştür
 */
function mapTypeToCategory(type: 'ROOM' | 'BED' | 'APART' | 'MIXED'): 'apartment' | 'room' | 'bed' {
  switch (type) {
    case 'ROOM':
      return 'room';
    case 'BED':
      return 'bed';
    case 'APART':
      return 'apartment';
    case 'MIXED':
    default:
      return 'apartment'; // Varsayılan olarak apartment döndür
  }
}

/**
 * İç modeli API DTO'ya dönüştür
 */
function mapModelToDto(model: Partial<IFeature>): Partial<CreateFeatureRequest | UpdateFeatureRequest> {
  return {
    name: model.name,
    code: model.code,
    type: model.type as 'ROOM' | 'BED' | 'APART' | 'MIXED',
    status: model.status as 'active' | 'inactive',
  };
}

export const featuresApi = {
  /**
   * Tüm özellikleri opsiyonel filtrelerle getir
   */
  getAll: async (filters?: FeatureFilters): Promise<ApiResponse<IFeature[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    // API yanıt yapısı
    interface FeaturesResponse {
      map(mapDtoToModel: (dto: FeatureDto) => IFeature): IFeature[];
      success: boolean;
      data: FeatureDto[];
      meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
      links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
      };
      status?: number;
    }
    
    const response = await api.get<FeaturesResponse>(`/api/v1/features?${params.toString()}`);
    
    if (response.success && response.data) {
      const modelData: IFeature[] = response.data.map(mapDtoToModel);
      return {
        success: response.success,
        status: 200,
        data: modelData,
      };
    }
    
    return {
      success: false,
      status: 404,
      error: 'Veri bulunamadı',
      data: [],
    };
  },

  /**
   * ID'ye göre özellik getir
   */
  getById: async (id: string | number): Promise<ApiResponse<IFeature>> => {
    // API yanıt yapısı
    interface FeatureResponse {
      success: boolean;
      data: FeatureDto;
      status?: number;
    }
    
    const response = await api.get<FeatureResponse>(`/api/v1/features/${id}`);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data.data),
      };
    }
    
    return {
      success: false,
      status: 404,
      error: 'Özellik bulunamadı',
    };
  },

  /**
   * Yeni bir özellik oluştur
   */
  create: async (data: Partial<IFeature>): Promise<ApiResponse<IFeature>> => {
    const dto = mapModelToDto(data) as CreateFeatureRequest;
    
    // API yanıt yapısı
    interface FeatureResponse {
      success: boolean;
      data: FeatureDto;
      status?: number;
    }
    
    const response = await api.post<FeatureResponse>('/api/v1/features', dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 201,
        data: mapDtoToModel(response.data.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: 'Özellik oluşturulamadı',
    };
  },

  /**
   * Mevcut bir özelliği güncelle
   */
  update: async (id: string | number, data: Partial<IFeature>): Promise<ApiResponse<IFeature>> => {
    const dto = mapModelToDto(data) as UpdateFeatureRequest;
    
    // API yanıt yapısı
    interface FeatureResponse {
      success: boolean;
      data: FeatureDto;
      status?: number;
    }
    
    const response = await api.put<FeatureResponse>(`/api/v1/features/${id}`, dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: 'Özellik güncellenemedi',
    };
  },

  /**
   * Bir özelliği sil
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/features/${id}`);
  },
};