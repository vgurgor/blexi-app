import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IRoom } from '../../types/models';

// API'de tanımlanan Room modeli
export interface RoomDto {
  id: number;
  apart_id: number;
  room_number: string;
  floor: number;
  capacity: number;
  room_type: 'STANDARD' | 'SUITE' | 'DELUXE';
  status: 'active' | 'inactive' | 'maintenance';
  beds_count?: number;
  beds?: {
    id: number;
    room_id: number;
    name: string;
    bed_number?: string;
    bed_type?: 'SINGLE' | 'DOUBLE' | 'QUEEN' | 'KING';
    status?: 'available' | 'occupied' | 'out_of_order';
    // Diğer yatakla ilgili alanlar
  }[];
  features?: {
    id: number;
    name: string;
    code: string;
    // Diğer özellik alanları
  }[];
  created_at?: string;
  updated_at?: string;
}

// API isteklerinde kullanılacak filtreler
export interface RoomFilters {
  apart_id?: number;
  floor?: number;
  room_type?: 'STANDARD' | 'SUITE' | 'DELUXE';
  status?: 'active' | 'inactive' | 'maintenance';
  page?: number;
  per_page?: number;
}

// Yeni oda oluşturma isteği için model
export interface CreateRoomRequest {
  apart_id: number;
  room_number: string;
  floor: number;
  capacity: number;
  room_type?: 'STANDARD' | 'SUITE' | 'DELUXE';
  status: 'active' | 'inactive' | 'maintenance';
}

// Oda güncelleme isteği için model
export interface UpdateRoomRequest {
  room_number?: string;
  floor?: number;
  capacity?: number;
  room_type?: 'STANDARD' | 'SUITE' | 'DELUXE';
  status?: 'active' | 'inactive' | 'maintenance';
}

/**
 * API DTO'yu iç modele dönüştür
 */
function mapDtoToModel(dto: RoomDto): IRoom {
  return {
    id: dto.id.toString(),
    apart_id: dto.apart_id.toString(),
    room_number: dto.room_number,
    floor: dto.floor,
    capacity: dto.capacity,
    room_type: dto.room_type,
    status: dto.status,
    beds_count: dto.beds_count,
    beds: dto.beds?.map(bed => ({
      id: bed.id.toString(),
      name: bed.name,
      roomId: bed.room_id.toString(),
      bed_number: bed.bed_number || '',
      bed_type: (bed.bed_type || 'SINGLE') as 'SINGLE' | 'DOUBLE' | 'BUNK',
      status: (bed.status || 'available') as 'available' | 'occupied' | 'maintenance' | 'reserved',
      guest_id: null,
      features: [],
      createdAt: '',
      updatedAt: ''
    })),
    features: dto.features?.map(feature => feature.id.toString()) || [],
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
}

/**
 * İç modeli API DTO'ya dönüştür
 */
function mapModelToDto(model: Partial<IRoom>): Partial<CreateRoomRequest | UpdateRoomRequest> {
  const dto: any = {};
  
  if (model.apart_id) dto.apart_id = parseInt(model.apart_id, 10);
  if (model.room_number) dto.room_number = model.room_number;
  if (model.floor !== undefined) dto.floor = model.floor;
  if (model.capacity !== undefined) dto.capacity = model.capacity;
  if (model.room_type) dto.room_type = model.room_type;
  if (model.status) dto.status = model.status;
  
  return dto as Partial<CreateRoomRequest | UpdateRoomRequest>;
}

export const roomsApi = {
  /**
   * Tüm odaları opsiyonel filtrelerle getir
   */
  getAll: async (filters?: RoomFilters): Promise<ApiResponse<IRoom[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    // API yanıt yapısı
    interface RoomsResponse {
      success: boolean;
      data: RoomDto[];
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
    
    const response = await api.get<RoomsResponse>(`/api/v1/rooms?${params.toString()}`);
    
    if (response.success && Array.isArray(response.data)) {
      const modelData: IRoom[] = response.data.map(mapDtoToModel);
      return {
        success: response.success,
        status: 200,
        data: modelData,
        meta: response.meta,
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
   * ID'ye göre oda getir
   */
  getById: async (id: string | number): Promise<ApiResponse<IRoom>> => {
    // API yanıt yapısı
    interface RoomResponse {
      success: boolean;
      data: RoomDto;
      status?: number;
    }
    
    const response = await api.get<RoomResponse>(`/api/v1/rooms/${id}`);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data as unknown as RoomDto),
      };
    }
    
    return {
      success: false,
      status: 404,
      error: 'Oda bulunamadı',
    };
  },

  /**
   * Yeni bir oda oluştur
   */
  create: async (data: Partial<IRoom>): Promise<ApiResponse<IRoom>> => {
    const dto = mapModelToDto(data) as CreateRoomRequest;
    
    // API yanıt yapısı
    interface RoomResponse {
      success: boolean;
      data: RoomDto;
      status?: number;
    }
    
    const response = await api.post<RoomResponse>('/api/v1/rooms', dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 201,
        data: mapDtoToModel(response.data as unknown as RoomDto),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: 'Oda oluşturulamadı',
    };
  },

  /**
   * Mevcut bir odayı güncelle
   */
  update: async (id: string | number, data: Partial<IRoom>): Promise<ApiResponse<IRoom>> => {
    const dto = mapModelToDto(data) as UpdateRoomRequest;
    
    // API yanıt yapısı
    interface RoomResponse {
      success: boolean;
      data: RoomDto;
      status?: number;
    }
    
    const response = await api.put<RoomResponse>(`/api/v1/rooms/${id}`, dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data as unknown as RoomDto),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: 'Oda güncellenemedi',
    };
  },

  /**
   * Bir odayı sil
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/rooms/${id}`);
  },

  // Özellik işlemleri
  
  /**
   * Odanın özelliklerini getir
   */
  getFeatures: async (roomId: string | number): Promise<ApiResponse<any[]>> => {
    // API yanıt yapısı
    interface FeaturesResponse {
      success: boolean;
      data: any[];
      status?: number;
    }
    
    const response = await api.get<FeaturesResponse>(`/api/v1/rooms/${roomId}/features`);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: response.data.data,
      };
    }
    
    return {
      success: false,
      status: 404,
      error: 'Özellikler bulunamadı',
      data: [],
    };
  },

  /**
   * Odaya özellik ekle
   */
  addFeature: async (roomId: string | number, featureId: string | number): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/rooms/${roomId}/features/${featureId}`, {});
  },

  /**
   * Odadan özellik kaldır
   */
  removeFeature: async (roomId: string | number, featureId: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/rooms/${roomId}/features/${featureId}`);
  },

  // Envanter işlemleri
  
  /**
   * Odanın envanterini getir
   */
  getInventory: async (roomId: string | number): Promise<ApiResponse<any[]>> => {
    // API yanıt yapısı
    interface InventoryResponse {
      success: boolean;
      data: any[];
      status?: number;
    }
    
    const response = await api.get<InventoryResponse>(`/api/v1/rooms/${roomId}/inventory`);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: response.data.data,
      };
    }
    
    return {
      success: false,
      status: 404,
      error: 'Envanter bulunamadı',
      data: [],
    };
  },
};