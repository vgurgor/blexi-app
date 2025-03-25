import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IInventoryItem } from '../../types/models';

// API'de tanımlanan Inventory modeli
export interface InventoryDto {
  id: number;
  tenant_id: number;
  assignable_type: string | null;
  assignable_id: number | null;
  item_type: 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration';
  status: 'in_use' | 'in_storage' | 'maintenance' | 'disposed';
  tracking_number: string;
  brand: string;
  model: string;
  purchase_date: string;
  warranty_end: string | null;
  created_at?: string;
  updated_at?: string;
}

// API isteklerinde kullanılacak filtreler
export interface InventoryFilters {
  bed_id?: number;
  room_id?: number;
  apart_id?: number;
  item_type?: 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration';
  status?: 'in_use' | 'in_storage' | 'maintenance' | 'disposed';
  warranty_expired?: boolean;
  tracking_number?: string;
  page?: number;
  per_page?: number;
}

// Yeni envanter öğesi oluşturma isteği için model
export interface CreateInventoryRequest {
  item_type: 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration';
  status: 'in_use' | 'in_storage' | 'maintenance' | 'disposed';
  tracking_number: string;
  brand: string;
  model: string;
  purchase_date: string;
  warranty_end: string;
}

// Envanter öğesi güncelleme isteği için model
export interface UpdateInventoryRequest {
  item_type?: 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration';
  status?: 'in_use' | 'in_storage' | 'maintenance' | 'disposed';
  tracking_number?: string;
  brand?: string;
  model?: string;
  purchase_date?: string;
  warranty_end?: string;
}

/**
 * API DTO'yu iç modele dönüştür
 */
function mapDtoToModel(dto: InventoryDto): IInventoryItem {
  // Atama durumuna göre location ve locationId belirle
  let location: 'apartment' | 'room' | 'bed' | undefined;
  let locationId: string | undefined;
  
  if (dto.assignable_type && dto.assignable_id) {
    if (dto.assignable_type.includes('Apart')) {
      location = 'apartment';
      locationId = dto.assignable_id.toString();
    } else if (dto.assignable_type.includes('Room')) {
      location = 'room';
      locationId = dto.assignable_id.toString();
    } else if (dto.assignable_type.includes('Bed')) {
      location = 'bed';
      locationId = dto.assignable_id.toString();
    }
  }
  
  return {
    id: dto.id.toString(),
    tenant_id: dto.tenant_id.toString(),
    assignable_type: dto.assignable_type || undefined,
    assignable_id: dto.assignable_id ? dto.assignable_id.toString() : undefined,
    item_type: dto.item_type,
    status: dto.status,
    tracking_number: dto.tracking_number,
    brand: dto.brand,
    model: dto.model,
    purchase_date: dto.purchase_date,
    warranty_end: dto.warranty_end || undefined,
    location,
    locationId,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
}

/**
 * İç modeli API DTO'ya dönüştür
 */
function mapModelToDto(model: Partial<IInventoryItem>): Partial<CreateInventoryRequest | UpdateInventoryRequest> {
  return {
    item_type: model.item_type,
    status: model.status,
    tracking_number: model.tracking_number,
    brand: model.brand,
    model: model.model,
    purchase_date: model.purchase_date,
    warranty_end: model.warranty_end,
  };
}

export const inventoryApi = {
  /**
   * Tüm envanter öğelerini opsiyonel filtrelerle getir
   */
  getAll: async (filters?: InventoryFilters): Promise<ApiResponse<IInventoryItem[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    // API yanıt yapısı
    interface InventoryResponse {
      success: boolean;
      data: InventoryDto[];
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
    
    const response = await api.get<InventoryResponse>(`/api/v1/inventory?${params.toString()}`);
    
    if (response.success && response.data) {
      const modelData: IInventoryItem[] = response.data.map(mapDtoToModel);
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
   * ID'ye göre envanter öğesi getir
   */
  getById: async (id: string | number): Promise<ApiResponse<IInventoryItem>> => {
    // API yanıt yapısı
    interface ItemResponse {
      success: boolean;
      data: InventoryDto;
      status?: number;
    }
    
    const response = await api.get<ItemResponse>(`/api/v1/inventory/${id}`);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 404,
      error: 'Envanter öğesi bulunamadı',
    };
  },

  /**
   * Yeni bir envanter öğesi oluştur
   */
  create: async (data: Partial<IInventoryItem>): Promise<ApiResponse<IInventoryItem>> => {
    const dto = mapModelToDto(data) as CreateInventoryRequest;
    
    // API yanıt yapısı
    interface ItemResponse {
      success: boolean;
      data: InventoryDto;
      status?: number;
    }
    
    const response = await api.post<ItemResponse>('/api/v1/inventory', dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 201,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: 'Envanter öğesi oluşturulamadı',
    };
  },

  /**
   * Mevcut bir envanter öğesini güncelle
   */
  update: async (id: string | number, data: Partial<IInventoryItem>): Promise<ApiResponse<IInventoryItem>> => {
    const dto = mapModelToDto(data) as UpdateInventoryRequest;
    
    // API yanıt yapısı
    interface ItemResponse {
      success: boolean;
      data: InventoryDto;
      status?: number;
    }
    
    const response = await api.put<ItemResponse>(`/api/v1/inventory/${id}`, dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: 'Envanter öğesi güncellenemedi',
    };
  },

  /**
   * Bir envanter öğesini sil
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/inventory/${id}`);
  },

  // Atama işlemleri
  
  /**
   * Envanter öğesini bir apart'a ata
   */
  assignToApart: async (inventoryId: string | number, apartId: string | number): Promise<ApiResponse<IInventoryItem>> => {
    // API yanıt yapısı
    interface ItemResponse {
      success: boolean;
      data: InventoryDto;
      message?: string;
      status?: number;
    }
    
    const response = await api.post<ItemResponse>(`/api/v1/inventory/${inventoryId}/assign-to-apart/${apartId}`, {});
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: response.message || 'Atama işlemi başarısız',
    };
  },

  /**
   * Envanter öğesini bir odaya ata
   */
  assignToRoom: async (inventoryId: string | number, roomId: string | number): Promise<ApiResponse<IInventoryItem>> => {
    // API yanıt yapısı
    interface ItemResponse {
      success: boolean;
      data: InventoryDto;
      message?: string;
      status?: number;
    }
    
    const response = await api.post<ItemResponse>(`/api/v1/inventory/${inventoryId}/assign-to-room/${roomId}`, {});
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: response.message || 'Atama işlemi başarısız',
    };
  },

  /**
   * Envanter öğesini bir yatağa ata
   */
  assignToBed: async (inventoryId: string | number, bedId: string | number): Promise<ApiResponse<IInventoryItem>> => {
    // API yanıt yapısı
    interface ItemResponse {
      success: boolean;
      data: InventoryDto;
      message?: string;
      status?: number;
    }
    
    const response = await api.post<ItemResponse>(`/api/v1/inventory/${inventoryId}/assign-to-bed/${bedId}`, {});
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: response.message || 'Atama işlemi başarısız',
    };
  },

  /**
   * Envanter öğesinin atamasını kaldır
   */
  unassign: async (inventoryId: string | number): Promise<ApiResponse<IInventoryItem>> => {
    // API yanıt yapısı
    interface ItemResponse {
      success: boolean;
      data: InventoryDto;
      message?: string;
      status?: number;
    }
    
    const response = await api.post<ItemResponse>(`/api/v1/inventory/${inventoryId}/unassign`, {});
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: response.message || 'Atama kaldırma işlemi başarısız',
    };
  },
  
  /**
   * Envanter durum seçeneklerini getir
   */
  getStatusOptions: async (): Promise<ApiResponse<string[]>> => {
    return api.get<string[]>('/api/v1/inventory/status-options');
  },
  
  /**
   * Envanter tür seçeneklerini getir
   */
  getTypeOptions: async (): Promise<ApiResponse<string[]>> => {
    return api.get<string[]>('/api/v1/inventory/type-options');
  },
};