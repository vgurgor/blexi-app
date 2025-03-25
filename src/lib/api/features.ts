import { api } from './base';

export interface Feature {
  id: number;
  name: string;
  code: string;
  type: 'ROOM' | 'BED' | 'APART' | 'MIXED';
  status: 'active' | 'inactive';
  assignments_count?: number;
}

export interface FeatureFilters {
  type?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export const featuresApi = {
  getAll: async (filters?: FeatureFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const response = await api.get(`/features?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/features/${id}`);
    return response.data;
  },

  create: async (data: Partial<Feature>) => {
    const response = await api.post('/features', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Feature>) => {
    const response = await api.put(`/features/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    return api.delete(`/features/${id}`);
  },
};