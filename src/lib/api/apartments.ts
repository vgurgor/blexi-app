import { api } from './base';

export interface Apartment {
  id: number;
  name: string;
  address: string;
  firm_id: number;
  gender_type: 'MALE' | 'FEMALE' | 'MIXED';
  opening_date: string;
  status: 'active' | 'inactive';
  rooms_count?: number;
  total_rooms?: number;
  occupied_rooms?: number;
  internet_speed?: string;
}

export interface ApartmentFilters {
  status?: string;
  gender_type?: string;
  firm_id?: string;
  page?: number;
  per_page?: number;
}

export const apartmentsApi = {
  getAll: async (filters?: ApartmentFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const response = await api.get(`/aparts?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/aparts/${id}`);
    return response.data;
  },

  create: async (data: Partial<Apartment>) => {
    const response = await api.post('/aparts', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Apartment>) => {
    const response = await api.put(`/aparts/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    return api.delete(`/aparts/${id}`);
  },

  // Features
  getFeatures: async (apartmentId: number) => {
    const response = await api.get(`/aparts/${apartmentId}/features`);
    return response.data;
  },

  addFeature: async (apartmentId: number, featureId: number) => {
    const response = await api.post(`/aparts/${apartmentId}/features`, {
      feature_id: featureId
    });
    return response.data;
  },

  removeFeature: async (apartmentId: number, featureId: number) => {
    return api.delete(`/aparts/${apartmentId}/features/${featureId}`);
  },

  // Inventory
  getInventory: async (apartmentId: number) => {
    const response = await api.get(`/aparts/${apartmentId}/inventory`);
    return response.data;
  },
};