import { api } from './base';

export interface Room {
  id: number;
  room_number: string;
  floor: number;
  capacity: number;
  room_type: 'STANDARD' | 'SUITE' | 'DELUXE';
  status: 'active' | 'inactive' | 'maintenance';
  apart_id: number;
  beds_count: number;
}

export interface RoomFilters {
  status?: string;
  room_type?: string;
  apart_id?: string;
  floor?: string;
  page?: number;
  per_page?: number;
}

export const roomsApi = {
  getAll: async (filters?: RoomFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const response = await api.get(`/rooms?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  create: async (data: Partial<Room>) => {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Room>) => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    return api.delete(`/rooms/${id}`);
  },

  // Features
  getFeatures: async (roomId: number) => {
    const response = await api.get(`/rooms/${roomId}/features`);
    return response.data;
  },

  addFeature: async (roomId: number, featureId: number) => {
    const response = await api.post(`/rooms/${roomId}/features`, {
      feature_id: featureId
    });
    return response.data;
  },

  removeFeature: async (roomId: number, featureId: number) => {
    return api.delete(`/rooms/${roomId}/features/${featureId}`);
  },

  // Inventory
  getInventory: async (roomId: number) => {
    const response = await api.get(`/rooms/${roomId}/inventory`);
    return response.data;
  },
};