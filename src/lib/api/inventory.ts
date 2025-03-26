import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IInventoryItem } from '../../types/models';

// API'de tanımlanan Inventory modeli
export interface InventoryDto {
  id: number;
  tenant_id: number;
  apart_id: number | null;
  bed_id: number | null;
  assignable_type: string | null;
  assignable_id: number | null;
  item_type: 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration';
  status: 'in_use' | 'in_storage' | 'maintenance' | 'disposed';
  tracking_number: string;
  brand: string | null;
  model: string | null;
  purchase_date: string;
  warranty_end: string | null;
  created_at: string;
  updated_at: string;
}

// API isteklerinde kullanılacak filtreler
export interface InventoryFilters {
  item_type?: 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration';
  status?: 'in_use' | 'in_storage' | 'maintenance' | 'disposed';
  warranty_expired?: boolean;
  assigned?: boolean;
  apart_id?: number | string;
  room_id?: number | string;
  bed_id?: number | string;
  page?: number;
  per_page?: number;
}

// Yeni envanter oluşturma isteği için model
export interface CreateInventoryRequest {
  item_type: 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration';
  status: 'in_use' | 'in_storage' | 'maintenance' | 'disposed';
  tracking_number: string;
  brand?: string;
  model?: string;
  purchase_date: string;
  warranty_end?: string;
  assignable_type?: string;
  assignable_id?: number;
}

// Envanter güncelleme isteği için model
export interface UpdateInventoryRequest {
  item_type?: 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration';
  status?: 'in_use' | 'in_storage' | 'maintenance' | 'disposed';
  tracking_number?: string;
  brand?: string;
  model?: string;
  purchase_date?: string;
  warranty_end?: string;
  assignable_type?: string;
  assignable_id?: number;
}

/**
 * API DTO'yu iç modele dönüştür
 */
function mapDtoToModel(dto: InventoryDto): IInventoryItem {
  return {
    id: dto.id.toString(),
    tenant_id: dto.tenant_id.toString(),
    assignable_type: dto.assignable_type || undefined,
    assignable_id: dto.assignable_id ? dto.assignable_id.toString() : undefined,
    item_type: dto.item_type,
    status: dto.status,
    tracking_number: dto.tracking_number,
    brand: dto.brand || '',
    model: dto.model || '',
    purchase_date: dto.purchase_date,
    warranty_end: dto.warranty_end || undefined,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

/**
 * İç modeli API DTO'ya dönüştür
 */
function mapModelToDto(model: Partial<IInventoryItem>): Partial<CreateInventoryRequest | UpdateInventoryRequest> {
  const dto: Partial<CreateInventoryRequest | UpdateInventoryRequest> = {};
  
  if (model.item_type !== undefined) dto.item_type = model.item_type;
  if (model.status !== undefined) dto.status = model.status;
  if (model.tracking_number !== undefined) dto.tracking_number = model.tracking_number;
  if (model.brand !== undefined) dto.brand = model.brand;
  if (model.model !== undefined) dto.model = model.model;
  if (model.purchase_date !== undefined) dto.purchase_date = model.purchase_date;
  if (model.warranty_end !== undefined) dto.warranty_end = model.warranty_end;
  if (model.assignable_type !== undefined) dto.assignable_type = model.assignable_type;
  if (model.assignable_id !== undefined) dto.assignable_id = Number(model.assignable_id);
  
  return dto;
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
    
    try {
      const response = await api.get(`/api/v1/inventory?${params.toString()}`);
      
      if (response && response.data) {
        const modelData: IInventoryItem[] = response.data.map(mapDtoToModel);
        
        return {
          success: true,
          status: 200,
          data: modelData,
          meta: response.meta
        };
      }
      
      return {
        success: false,
        status: 404,
        error: 'Veri bulunamadı',
        data: [],
      };
    } catch (error) {
      console.error('Envanter verilerini alma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Envanter verileri alınırken bir hata oluştu',
        data: [],
      };
    }
  },

  /**
   * ID'ye göre envanter öğesi getir
   */
  getById: async (id: string | number): Promise<ApiResponse<IInventoryItem>> => {
    try {
      const response = await api.get(`/api/v1/inventory/${id}`);
      
      if (response && response.data) {
        return {
          success: true,
          status: 200,
          data: mapDtoToModel(response.data),
        };
      }
      
      return {
        success: false,
        status: 404,
        error: 'Envanter öğesi bulunamadı',
      };
    } catch (error) {
      console.error('Envanter verilerini alma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Envanter verisi alınırken bir hata oluştu',
      };
    }
  },

  /**
   * Yeni bir envanter öğesi oluştur
   */
  create: async (data: Partial<IInventoryItem> | CreateInventoryRequest): Promise<ApiResponse<IInventoryItem>> => {
    try {
      const dto = 'tracking_number' in data ? data : mapModelToDto(data as Partial<IInventoryItem>);
      
      const response = await api.post('/api/v1/inventory', dto);
      
      if (response && response.data) {
        return {
          success: true,
          status: 201,
          data: mapDtoToModel(response.data),
        };
      }
      
      return {
        success: false,
        status: 400,
        error: 'Envanter öğesi oluşturulamadı',
      };
    } catch (error) {
      console.error('Envanter oluşturma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Envanter oluşturulurken bir hata oluştu',
      };
    }
  },

  /**
   * Mevcut bir envanter öğesini güncelle
   */
  update: async (id: string | number, data: Partial<IInventoryItem> | UpdateInventoryRequest): Promise<ApiResponse<IInventoryItem>> => {
    try {
      const dto = 'tracking_number' in data ? data : mapModelToDto(data as Partial<IInventoryItem>);
      
      const response = await api.put(`/api/v1/inventory/${id}`, dto);
      
      if (response && response.data) {
        return {
          success: true,
          status: 200,
          data: mapDtoToModel(response.data),
        };
      }
      
      return {
        success: false,
        status: 400,
        error: 'Envanter öğesi güncellenemedi',
      };
    } catch (error) {
      console.error('Envanter güncelleme hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Envanter güncellenirken bir hata oluştu',
      };
    }
  },

  /**
   * Bir envanter öğesini sil
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/inventory/${id}`);
  },

  /**
   * Envanter öğesini odaya ata
   */
  assignToRoom: async (inventoryId: string | number, roomId: string | number): Promise<ApiResponse<IInventoryItem>> => {
    try {
      // Dedicated assignment endpoint
      const response = await api.post(`/api/v1/inventory/${inventoryId}/assign-to-room/${roomId}`, {});
      
      if (response && response.data) {
        return {
          success: true,
          status: 200,
          data: mapDtoToModel(response.data),
        };
      }

      // Fallback to general update if dedicated endpoint fails
      if (response && response.error) {
        return {
          success: false,
          status: response.status || 400,
          error: response.error || 'Envanter odaya atanamadı',
        };
      }

      // Alternative approach using update
      const updateData = {
        status: 'in_use' as const,
        assignable_type: 'App\\Modules\\Room\\Models\\Room',
        assignable_id: Number(roomId),
      };

      return inventoryApi.update(inventoryId, updateData);
    } catch (error) {
      console.error('Envanter odaya atama hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Envanter odaya atanırken bir hata oluştu',
      };
    }
  },

  /**
   * Envanter öğesinin atamalarını kaldır (depoya geri al)
   */
  unassign: async (inventoryId: string | number): Promise<ApiResponse<IInventoryItem>> => {
    try {
      // Dedicated unassign endpoint
      const response = await api.post(`/api/v1/inventory/${inventoryId}/unassign`, {});
      
      if (response && response.data) {
        return {
          success: true,
          status: 200,
          data: mapDtoToModel(response.data),
        };
      }

      // Fallback to general update if dedicated endpoint fails
      if (response && response.error) {
        return {
          success: false,
          status: response.status || 400,
          error: response.error || 'Envanter ataması kaldırılamadı',
        };
      }

      // Alternative approach using update
      const updateData = {
        status: 'in_storage' as const,
        assignable_type: undefined,
        assignable_id: undefined,
      };

      return inventoryApi.update(inventoryId, updateData);
    } catch (error) {
      console.error('Envanter ataması kaldırma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Envanter ataması kaldırılırken bir hata oluştu',
      };
    }
  },

  /**
   * Envanter öğesini yatağa ata
   */
  assignToBed: async (inventoryId: string | number, bedId: string | number): Promise<ApiResponse<IInventoryItem>> => {
    try {
      // Dedicated assignment endpoint
      const response = await api.post(`/api/v1/inventory/${inventoryId}/assign-to-bed/${bedId}`, {});
      
      if (response && response.data) {
        return {
          success: true,
          status: 200,
          data: mapDtoToModel(response.data),
        };
      }

      // Fallback to general update if dedicated endpoint fails
      const updateData = {
        status: 'in_use' as const,
        assignable_type: 'App\\Modules\\Bed\\Models\\Bed',
        assignable_id: Number(bedId),
      };

      return inventoryApi.update(inventoryId, updateData);
    } catch (error) {
      console.error('Envanter yatağa atama hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Envanter yatağa atanırken bir hata oluştu',
      };
    }
  },
};