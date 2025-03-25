import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IBed } from '../../types/models';

// API'de tanımlanan Bed modeli
export interface BedDto {
  id: number;
  room_id: number;
  bed_number: string;
  bed_type: 'SINGLE' | 'DOUBLE' | 'BUNK';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  guest_id: number | null;
  inventory_items_count?: number;
  room?: {
    id: number;
    room_number: string;
    // Diğer oda alanları
  };
  features?: {
    id: number;
    name: string;
    code: string;
    // Diğer özellik alanları
  }[];
  created_at?: string;
  updated_at?: string;
}

// Yeni yatak oluşturma isteği için model
export interface CreateBedRequest {
  room_id: number;
  bed_number: string;
  bed_type: 'SINGLE' | 'DOUBLE' | 'BUNK';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

// Yatak güncelleme isteği için model
export interface UpdateBedRequest {
  bed_number?: string;
  bed_type?: 'SINGLE' | 'DOUBLE' | 'BUNK';
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved';
  guest_id?: number | null;
}

// API isteklerinde kullanılacak filtreler
export interface BedFilters {
  room_id?: number;
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved';
  page?: number;
  per_page?: number;
}

/**
 * API DTO'yu iç modele dönüştür
 */
function mapDtoToModel(dto: BedDto): IBed {
  return {
    id: dto.id.toString(),
    roomId: dto.room_id.toString(),
    name: dto.bed_number,
    bed_number: dto.bed_number,
    bed_type: dto.bed_type,
    status: dto.status,
    guest_id: dto.guest_id ? dto.guest_id.toString() : null,
    features: dto.features?.map(feature => feature.id.toString()) || [],
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
}

/**
 * İç modeli API DTO'ya dönüştür
 */
function mapModelToDto(model: Partial<IBed>): any {
  const dto: any = {};
  
  if (model.roomId) dto.room_id = parseInt(model.roomId, 10);
  if (model.bed_number) dto.bed_number = model.bed_number;
  if (model.name && !model.bed_number) dto.bed_number = model.name;
  if (model.bed_type) dto.bed_type = model.bed_type;
  if (model.status) dto.status = model.status;
  if (model.guest_id) dto.guest_id = model.guest_id ? parseInt(model.guest_id, 10) : null;
  
  return dto;
}

export const bedsApi = {
  /**
   * Tüm yatakları opsiyonel filtrelerle getir
   */
  getAll: async (filters?: BedFilters): Promise<ApiResponse<IBed[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    try {
      const response = await api.get(`/api/v1/beds?${params.toString()}`);
      
      if (response.success && Array.isArray(response.data)) {
        const modelData: IBed[] = response.data.map((dto: BedDto) => mapDtoToModel(dto));
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
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: 'Bir hata oluştu',
        data: [],
      };
    }
  },

  /**
   * ID'ye göre yatak getir
   */
  getById: async (id: string | number): Promise<ApiResponse<IBed>> => {
    try {
      const response = await api.get(`/api/v1/beds/${id}`);
      
      if (response.success && response.data) {
        return {
          success: response.success,
          status: 200,
          data: mapDtoToModel(response.data as BedDto),
        };
      }
      
      return {
        success: false,
        status: 404,
        error: 'Yatak bulunamadı',
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: 'Bir hata oluştu',
      };
    }
  },

  /**
   * Yeni bir yatak oluştur
   */
  create: async (data: Partial<IBed>): Promise<ApiResponse<IBed>> => {
    try {
      const dto = mapModelToDto(data);
      
      const response = await api.post('/api/v1/beds', dto);
      
      if (response.success && response.data) {
        return {
          success: response.success,
          status: 201,
          data: mapDtoToModel(response.data as BedDto),
        };
      }
      
      return {
        success: false,
        status: 400,
        error: 'Yatak oluşturulamadı',
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: 'Bir hata oluştu',
      };
    }
  },

  /**
   * Mevcut bir yatağı güncelle
   */
  update: async (id: string | number, data: Partial<IBed>): Promise<ApiResponse<IBed>> => {
    try {
      const dto = mapModelToDto(data);
      
      const response = await api.put(`/api/v1/beds/${id}`, dto);
      
      if (response.success && response.data) {
        return {
          success: response.success,
          status: 200,
          data: mapDtoToModel(response.data as BedDto),
        };
      }
      
      return {
        success: false,
        status: 400,
        error: 'Yatak güncellenemedi',
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: 'Bir hata oluştu',
      };
    }
  },

  /**
   * Bir yatağı sil
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/beds/${id}`);
  },

  // Özellik işlemleri
  
  /**
   * Yatağın özelliklerini getir
   */
  getFeatures: async (bedId: string | number): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get(`/api/v1/beds/${bedId}/features`);
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: response.success,
          status: 200,
          data: response.data,
        };
      }
      
      return {
        success: false,
        status: 404,
        error: 'Özellikler bulunamadı',
        data: [],
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: 'Bir hata oluştu',
        data: [],
      };
    }
  },

  /**
   * Yatağa özellik ekle
   */
  addFeature: async (bedId: string | number, featureId: string | number): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/beds/${bedId}/features/${featureId}`, {});
  },

  /**
   * Yataktan özellik kaldır
   */
  removeFeature: async (bedId: string | number, featureId: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/beds/${bedId}/features/${featureId}`);
  },

  // Envanter işlemleri
  
  /**
   * Yatağın envanterini getir
   */
  getInventory: async (bedId: string | number): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get(`/api/v1/beds/${bedId}/inventory`);
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: response.success,
          status: 200,
          data: response.data,
        };
      }
      
      return {
        success: false,
        status: 404,
        error: 'Envanter bulunamadı',
        data: [],
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: 'Bir hata oluştu',
        data: [],
      };
    }
  },
};