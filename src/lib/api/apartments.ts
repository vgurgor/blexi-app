import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IApartment } from '../../types/models';

export interface ApartmentDto {
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
  status?: 'active' | 'inactive';
  gender_type?: 'MALE' | 'FEMALE' | 'MIXED';
  firm_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ApartmentFeature {
  id: number;
  name: string;
  category: string;
}

export interface ApartmentInventoryItem {
  id: number;
  name: string;
  quantity: number;
  condition: string;
  created_at: string;
  updated_at: string;
}

/**
 * Convert API DTO to internal model
 */
function mapDtoToModel(dto: ApartmentDto): IApartment {
  return {
    id: dto.id.toString(),
    name: dto.name,
    address: dto.address,
    city: '', // We'll need to extract this from address if available
    zipCode: '', // We'll need to extract this from address if available
    country: 'Turkey', // Default for now
    companyId: dto.firm_id.toString(),
    features: [],
    createdAt: '', // We'll need this from the API
    updatedAt: '', // We'll need this from the API
  };
}

/**
 * Convert internal model to API DTO
 */
function mapModelToDto(model: Partial<IApartment>): Partial<ApartmentDto> {
  return {
    name: model.name,
    address: model.address,
    firm_id: model.companyId ? parseInt(model.companyId, 10) : undefined,
    // Add other fields as needed
  };
}

export const apartmentsApi = {
  /**
   * Get all apartments with optional filtering
   */
  getAll: async (filters?: ApartmentFilters): Promise<ApiResponse<IApartment[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<PaginatedResponse<ApartmentDto>>(`/aparts?${params.toString()}`);
    
    if (response.success && response.data) {
      const modelData: IApartment[] = response.data.data?.map(mapDtoToModel) || [];
      return {
        ...response,
        data: modelData,
      };
    }
    
    return response;
  },

  /**
   * Get apartment by ID
   */
  getById: async (id: string): Promise<ApiResponse<IApartment>> => {
    const response = await api.get<ApartmentDto>(`/aparts/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDtoToModel(response.data),
      };
    }
    
    return response;
  },

  /**
   * Create a new apartment
   */
  create: async (data: Partial<IApartment>): Promise<ApiResponse<IApartment>> => {
    const dto = mapModelToDto(data);
    const response = await api.post<ApartmentDto>('/aparts', dto);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDtoToModel(response.data),
      };
    }
    
    return response;
  },

  /**
   * Update an existing apartment
   */
  update: async (id: string, data: Partial<IApartment>): Promise<ApiResponse<IApartment>> => {
    const dto = mapModelToDto(data);
    const response = await api.put<ApartmentDto>(`/aparts/${id}`, dto);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDtoToModel(response.data),
      };
    }
    
    return response;
  },

  /**
   * Delete an apartment
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/aparts/${id}`);
  },

  /**
   * Get apartment features
   */
  getFeatures: async (apartmentId: string): Promise<ApiResponse<ApartmentFeature[]>> => {
    return api.get<ApartmentFeature[]>(`/aparts/${apartmentId}/features`);
  },

  /**
   * Add a feature to an apartment
   */
  addFeature: async (apartmentId: string, featureId: string): Promise<ApiResponse<void>> => {
    return api.post(`/aparts/${apartmentId}/features`, {
      feature_id: featureId
    });
  },

  /**
   * Remove a feature from an apartment
   */
  removeFeature: async (apartmentId: string, featureId: string): Promise<ApiResponse<void>> => {
    return api.delete(`/aparts/${apartmentId}/features/${featureId}`);
  },

  /**
   * Get apartment inventory
   */
  getInventory: async (apartmentId: string): Promise<ApiResponse<ApartmentInventoryItem[]>> => {
    return api.get<ApartmentInventoryItem[]>(`/aparts/${apartmentId}/inventory`);
  },
};