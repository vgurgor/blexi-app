import { api } from './base';

export interface Firm {
  id: number;
  name: string;
  tax_number: string;
  tax_office: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: 'active' | 'inactive';
  aparts_count: number;
  aparts: {
    id: number;
    firm_id: number;
    name: string;
    address: string;
    gender_type: string;
    opening_date: string;
    status: string;
    created_at: string;
    updated_at: string;
  }[];
}

export interface FirmFilters {
  status?: string;
  page?: number;
  per_page?: number;
}

export const firmsApi = {
  getAll: async (filters?: FirmFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const response = await api.get(`/firms?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/firms/${id}`);
    return response.data;
  },

  create: async (data: Partial<Firm>) => {
    const response = await api.post('/firms', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Firm>) => {
    const response = await api.put(`/firms/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    return api.delete(`/firms/${id}`);
  },
};