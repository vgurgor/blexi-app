import { api } from './base';

export interface Bed {
  id: number;
  name: string;
  bed_number: string;
  bed_type: 'SINGLE' | 'DOUBLE' | 'BUNK';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  room_id: number;
  guest_id: number | null;
}

export const bedsApi = {
  getAll: async (roomId?: number) => {
    const params = new URLSearchParams();
    if (roomId) params.append('room_id', roomId.toString());
    
    const response = await api.get(`/beds?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/beds/${id}`);
    return response.data;
  },

  create: async (data: Partial<Bed>) => {
    const response = await api.post('/beds', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Bed>) => {
    const response = await api.put(`/beds/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    return api.delete(`/beds/${id}`);
  },

  // Features
  getFeatures: async (bedId: number) => {
    const response = await api.get(`/beds/${bedId}/features`);
    return response.data;
  },

  addFeature: async (bedId: number, featureId: number) => {
    const response = await api.post(`/beds/${bedId}/features`, {
      feature_id: featureId
    });
    return response.data;
  },

  removeFeature: async (bedId: number, featureId: number) => {
    return api.delete(`/beds/${bedId}/features/${featureId}`);
  },

  // Inventory
  getInventory: async (bedId: number) => {
    const response = await api.get(`/beds/${bedId}/inventory`);
    return response.data;
  },
};