import { ApiResponse } from '@/types/api';
import { api } from './base';

export interface Apartment {
  id: number;
  firm_id: number;
  name: string;
  address: string;
  gender_type: 'MALE' | 'FEMALE' | 'MIXED';
  opening_date?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  rooms_count?: number;
  firm?: {
    id: number;
    name: string;
    // Diğer firma alanları gerekirse eklenebilir
  };
}

export type ApartDto = Apartment;

export interface ApartFeature {
  id: string;
  name: string;
  description?: string;
  type: string;
  code: string;
  status: 'active' | 'inactive';
}

export interface ApartFilters {
  firm_id?: number;
  gender_type?: 'MALE' | 'FEMALE' | 'MIXED';
  status?: 'active' | 'inactive';
  page?: number;
  per_page?: number;
}

export interface CreateApartRequest {
  firm_id: number;
  name: string;
  address: string;
  gender_type: 'MALE' | 'FEMALE' | 'MIXED';
  opening_date: string;
  status: 'active' | 'inactive';
}

export interface UpdateApartRequest {
  name: string;
  address: string;
  gender_type: 'MALE' | 'FEMALE' | 'MIXED';
  opening_date?: string;
  status: 'active' | 'inactive';
}

// Standardize API response
const standardizeResponse = <T>(response: any): ApiResponse<T> => {
  // If response is directly an array (data), wrap it
  if (Array.isArray(response)) {
    return {
      success: true,
      data: response as unknown as T,
      status: 200
    };
  }
  
  // If response is already in ApiResponse format
  if (response && typeof response === 'object' && 'success' in response) {
    return response;
  }
  
  // If response is just data object without success field
  if (response && typeof response === 'object') {
    return {
      success: true,
      data: response as T,
      status: 200
    };
  }
  
  // Default fallback
  return {
    success: false,
    error: 'Invalid response format',
    status: 500
  };
};

const getAll = async (filters?: ApartFilters): Promise<ApiResponse<Apartment[]>> => {
  try {
    let url = '/api/v1/aparts';
    
    if (filters) {
      const params = new URLSearchParams();
      
      if (filters.firm_id) params.append('firm_id', filters.firm_id.toString());
      if (filters.gender_type) params.append('gender_type', filters.gender_type);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const response = await api.get(url);
    return standardizeResponse<Apartment[]>(response);
  } catch (error) {
    throw error;
  }
};

const getById = async (id: string | number): Promise<ApiResponse<Apartment>> => {
  try {
    const response = await api.get(`/api/v1/aparts/${id}`);
    return standardizeResponse<Apartment>(response);
  } catch (error) {
    throw error;
  }
};

const create = async (data: CreateApartRequest): Promise<ApiResponse<Apartment>> => {
  try {
    const response = await api.post('/api/v1/aparts', data);
    return standardizeResponse<Apartment>(response);
  } catch (error) {
    throw error;
  }
};

const update = async (id: string | number, data: UpdateApartRequest): Promise<ApiResponse<any>> => {
  try {
    const response = await api.put(`/api/v1/aparts/${id}`, data);
    return standardizeResponse<any>(response);
  } catch (error) {
    throw error;
  }
};

const remove = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await api.delete(`/api/v1/aparts/${id}`);
    return standardizeResponse<any>(response);
  } catch (error) {
    throw error;
  }
};

const getFeatures = async (id: string): Promise<ApiResponse<ApartFeature[]>> => {
  try {
    const response = await api.get(`/api/v1/aparts/${id}/features`);
    return standardizeResponse<ApartFeature[]>(response);
  } catch (error) {
    throw error;
  }
};

const addFeature = async (apartId: string, featureId: string): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post(`/api/v1/aparts/${apartId}/features/${featureId}`, {});
    return standardizeResponse<any>(response);
  } catch (error) {
    throw error;
  }
};

const removeFeature = async (apartId: string, featureId: string): Promise<ApiResponse<any>> => {
  try {
    const response = await api.delete(`/api/v1/aparts/${apartId}/features/${featureId}`);
    return standardizeResponse<any>(response);
  } catch (error) {
    throw error;
  }
};

const getInventory = async (id: string | number): Promise<ApiResponse<any>> => {
  try {
    const response = await api.get(`/api/v1/aparts/${id}/inventory`);
    return standardizeResponse<any>(response);
  } catch (error) {
    throw error;
  }
};

export const apartsApi = {
  getAll,
  getById,
  create,
  update,
  remove,
  getFeatures,
  addFeature,
  removeFeature,
  getInventory
};