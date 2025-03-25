import { api } from './base';

export interface InventoryItem {
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
}

export interface InventoryFilters {
  status?: string;
  item_type?: string;
  assignable_type?: string;
  assignable_id?: string;
  page?: number;
  per_page?: number;
}

export const inventoryApi = {
  getAll: async (filters?: InventoryFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const response = await api.get(`/inventory?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  create: async (data: Partial<InventoryItem>) => {
    const response = await api.post('/inventory', data);
    return response.data;
  },

  update: async (id: number, data: Partial<InventoryItem>) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    return api.delete(`/inventory/${id}`);
  },

  // Assignment operations
  assignToApart: async (inventoryId: number, apartId: number) => {
    const response = await api.post(`/inventory/${inventoryId}/assign-to-apart/${apartId}`, {});
    return response.data;
  },

  assignToRoom: async (inventoryId: number, roomId: number) => {
    const response = await api.post(`/inventory/${inventoryId}/assign-to-room/${roomId}`, {});
    return response.data;
  },

  assignToBed: async (inventoryId: number, bedId: number) => {
    const response = await api.post(`/inventory/${inventoryId}/assign-to-bed/${bedId}`, {});
    return response.data;
  },

  unassign: async (inventoryId: number) => {
    const response = await api.post(`/inventory/${inventoryId}/unassign`, {});
    return response.data;
  },
};