import { ApiResponse } from '@/types/api';
import { api } from './base';

export interface Apartment {
  id: string;
  name: string;
  address: string;
  gender_type: 'MALE' | 'FEMALE' | 'MIXED';
  status: 'active' | 'inactive';
}

interface GetAllApartmentsParams {
  status?: string;
}

const getAll = async (params?: GetAllApartmentsParams): Promise<ApiResponse<Apartment[]>> => {
  try {
    const response = await api.get('/apartments', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getById = async (id: string): Promise<ApiResponse<Apartment>> => {
  try {
    const response = await api.get(`/apartments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apartsApi = {
  getAll,
  getById
};