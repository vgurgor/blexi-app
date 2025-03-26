import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IApartment } from '../../types/models';

// API'de tanımlanan Apart modeli
export interface ApartDto {
  id: number;
  firm_id: number;
  name: string;
  address: string;
  gender_type: 'MALE' | 'FEMALE' | 'MIXED';
  opening_date: string;
  status: 'active' | 'inactive';
  rooms_count?: number;
  created_at?: string;
  updated_at?: string;
  // İlişkili firma bilgileri
  firm?: {
    id: number;
    name: string;
    // Diğer firma alanları
  };
}

// API isteklerinde kullanılacak filtreler
export interface ApartFilters {
  status?: 'active' | 'inactive';
  gender_type?: 'MALE' | 'FEMALE' | 'MIXED';
  firm_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// API'de tanımlanan özellik (feature) modeli
export interface ApartFeature {
  id: number;
  name: string;
  category: string;
  feature_type: 'ROOM' | 'BED' | 'APART' | 'MIXED';
  status: 'active' | 'inactive';
}

// API'de tanımlanan envanter (inventory) modeli
export interface ApartInventoryItem {
  id: number;
  name: string;
  quantity: number;
  condition: string;
  created_at: string;
  updated_at: string;
}

// Yeni apart oluşturma isteği için model (API dokümanına göre)
export interface CreateApartRequest {
  firm_id: number;
  name: string;
  address: string;
  gender_type: 'MALE' | 'FEMALE' | 'MIXED';
  opening_date: string;
  status: 'active' | 'inactive';
}

// Apart güncelleme isteği için model (API dokümanına göre)
export interface UpdateApartRequest {
  name: string;
  address: string;
  gender_type: 'MALE' | 'FEMALE' | 'MIXED';
  opening_date?: string;
  status: 'active' | 'inactive';
}

/**
 * API DTO'yu iç modele dönüştür
 */
function mapDtoToModel(dto: ApartDto): IApartment {
  return {
    id: dto.id.toString(),
    name: dto.name,
    address: dto.address,
    city: '', // Eğer adresten çıkarmamız gerekiyorsa
    zipCode: '', // Eğer adresten çıkarmamız gerekiyorsa
    country: 'Turkey', // Varsayılan
    companyId: dto.firm_id.toString(),
    genderType: dto.gender_type,
    openingDate: dto.opening_date,
    status: dto.status,
    roomsCount: dto.rooms_count,
    features: [],
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
}

/**
 * İç modeli API DTO'ya dönüştür
 */
function mapModelToDto(model: Partial<IApartment>): Partial<CreateApartRequest | UpdateApartRequest> {
  return {
    name: model.name,
    address: model.address,
    firm_id: model.companyId ? parseInt(model.companyId, 10) : undefined,
    gender_type: model.genderType as 'MALE' | 'FEMALE' | 'MIXED',
    opening_date: model.openingDate,
    status: model.status as 'active' | 'inactive',
  };
}

// API endpoint'leri için apart ismi kullanılıyor, apartments değil
export const apartsApi = {
  /**
   * Tüm apart'ları opsiyonel filtrelerle getir
   */
  getAll: async (filters?: ApartFilters): Promise<ApiResponse<ApartDto[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    // API yanıt yapısı
    interface ApartsResponse {
      success: boolean;
      data: ApartDto[];
      meta?: any;
      message?: string;
      status?: number;
    }
    
    const response = await api.get<ApartsResponse>(`/api/v1/aparts?${params.toString()}`);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: response.status || 200,
        data: response.data,
        meta: response.meta
      };
    }
    
    return {
      success: false,
      status: response.status || 404,
      error: response.error || 'Veri bulunamadı',
      data: [],
    };
  },

  /**
   * ID'ye göre apart getir
   */
  getById: async (id: string): Promise<ApiResponse<ApartDto>> => {
    // API yanıt yapısı
    interface ApartResponse {
      success: boolean;
      data: ApartDto;
      message?: string;
      status?: number;
    }
    
    const response = await api.get<ApartResponse>(`/api/v1/aparts/${id}`);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: response.status || 200,
        data: response.data,
      };
    }
    
    return {
      success: false,
      status: response.status || 404,
      error: response.error || 'Apart bulunamadı',
    };
  },

  /**
   * Yeni bir apart oluştur
   */
  create: async (data: Partial<IApartment>): Promise<ApiResponse<ApartDto>> => {
    const dto = mapModelToDto(data) as CreateApartRequest;
    
    // API yanıt yapısı
    interface ApartResponse {
      success: boolean;
      data: ApartDto;
      message?: string;
      status?: number;
    }
    
    const response = await api.post<ApartResponse>('/api/v1/aparts', dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: response.status || 201,
        data: response.data,
      };
    }
    
    return {
      success: false,
      status: response.status || 400,
      error: response.error || 'Apart oluşturulamadı',
    };
  },

  /**
   * Mevcut bir apart'ı güncelle
   */
  update: async (id: string, data: Partial<IApartment>): Promise<ApiResponse<ApartDto>> => {
    const dto = mapModelToDto(data) as UpdateApartRequest;
    
    // API yanıt yapısı
    interface ApartResponse {
      success: boolean;
      data: ApartDto;
      message?: string;
      status?: number;
    }
    
    const response = await api.put<ApartResponse>(`/api/v1/aparts/${id}`, dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: response.status || 200,
        data: response.data,
      };
    }
    
    return {
      success: false,
      status: response.status || 400,
      error: response.error || 'Apart güncellenemedi',
    };
  },

  /**
   * Bir apart'ı sil
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/aparts/${id}`);
  },

  /**
   * Apart özelliklerini getir
   */
  getFeatures: async (apartId: string): Promise<ApiResponse<ApartFeature[]>> => {
    return api.get<ApartFeature[]>(`/api/v1/aparts/${apartId}/features`);
  },

  /**
   * Apart'a özellik ekle
   */
  addFeature: async (apartId: string, featureId: string): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/aparts/${apartId}/features/${featureId}`, {});
  },

  /**
   * Apart'tan özellik kaldır
   */
  removeFeature: async (apartId: string, featureId: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/aparts/${apartId}/features/${featureId}`);
  },

  /**
   * Apart envanterini getir
   */
  getInventory: async (apartId: string): Promise<ApiResponse<ApartInventoryItem[]>> => {
    return api.get<ApartInventoryItem[]>(`/api/v1/aparts/${apartId}/inventory`);
  },
};

// Geriye dönük uyumluluk için apartmentsApi'yi yayınlayalım
// apartsApi doğru isimlendirme (API dokümanına uygun)
export const apartmentsApi = apartsApi;