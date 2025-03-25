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

  // Room Features
  getRoomFeatures: async (roomId: number) => {
    const response = await api.get(`/rooms/${roomId}/features`);
    return response.data;
  },

  addRoomFeature: async (roomId: number, featureId: number) => {
    const response = await api.post(`/rooms/${roomId}/features`, {
      feature_id: featureId
    });
    return response.data;
  },

  removeRoomFeature: async (roomId: number, featureId: number) => {
    return api.delete(`/rooms/${roomId}/features/${featureId}`);
  },

  // Bed Features
  getBedFeatures: async (bedId: number) => {
    const response = await api.get(`/beds/${bedId}/features`);
    return response.data;
  },

  addBedFeature: async (bedId: number, featureId: number) => {
    const response = await api.post(`/beds/${bedId}/features`, {
      feature_id: featureId
    });
    return response.data;
  },

  removeBedFeature: async (bedId: number, featureId: number) => {
    return api.delete(`/beds/${bedId}/features/${featureId}`);
  },

  // Apart Features
  getApartFeatures: async (apartId: number) => {
    const response = await api.get(`/aparts/${apartId}/features`);
    return response.data;
  },

  addApartFeature: async (apartId: number, featureId: number) => {
    const response = await api.post(`/aparts/${apartId}/features`, {
      feature_id: featureId
    });
    return response.data;
  },

  removeApartFeature: async (apartId: number, featureId: number) => {
    return api.delete(`/aparts/${apartId}/features/${featureId}`);
  },
};