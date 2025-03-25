import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { ICompany } from '../../types/models';

// API'de tanımlanan Firm modeli
export interface FirmDto {
  id: number;
  tenant_id: number;
  name: string;
  tax_number: string;
  tax_office: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  aparts_count?: number;
  aparts?: {
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

// API isteklerinde kullanılacak filtreler
export interface FirmFilters {
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  per_page?: number;
}

// Yeni firma oluşturma isteği için model (API dokümanına göre)
export interface CreateFirmRequest {
  name: string;
  tax_number: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_office?: string;
  status: 'active' | 'inactive';
}

// Firma güncelleme isteği için model (API dokümanına göre)
export interface UpdateFirmRequest {
  name: string;
  tax_number: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_office?: string;
  status: 'active' | 'inactive';
}

/**
 * API DTO'yu iç modele dönüştür
 */
function mapDtoToModel(dto: FirmDto): ICompany {
  return {
    id: dto.id.toString(),
    name: dto.name,
    address: dto.address || '',
    city: '', // Adresten çıkarmalıyız
    zipCode: '', // Adresten çıkarmalıyız
    country: 'Turkey', // Varsayılan
    contactPerson: '', // API'de yok
    email: dto.email || '',
    phone: dto.phone || '',
    taxNumber: dto.tax_number,
    taxOffice: dto.tax_office || '',
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
}

/**
 * İç modeli API DTO'ya dönüştür
 */
function mapModelToDto(model: Partial<ICompany>): Partial<CreateFirmRequest | UpdateFirmRequest> {
  return {
    name: model.name,
    tax_number: model.taxNumber,
    address: model.address,
    phone: model.phone,
    email: model.email,
    tax_office: model.taxOffice,
    status: model.status as 'active' | 'inactive',
  };
}

export const firmsApi = {
  /**
   * Tüm firmaları opsiyonel filtrelerle getir
   */
  getAll: async (filters?: FirmFilters): Promise<ApiResponse<ICompany[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    // API yanıt yapısı
    interface FirmsResponse {
      success: boolean;
      data: FirmDto[];
      meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
      links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
      };
      status?: number;
    }
    
    const response = await api.get<FirmsResponse>(`/api/v1/firms?${params.toString()}`);
    
    if (response.success && response.data) {
      const modelData: ICompany[] = response.data.map(mapDtoToModel);
      return {
        success: response.success,
        status: 200,
        data: modelData,
      };
    }
    
    return {
      success: false,
      status: 404,
      error: 'Veri bulunamadı',
      data: [],
    };
  },

  /**
   * ID'ye göre firma getir
   */
  getById: async (id: string | number): Promise<ApiResponse<ICompany>> => {
    // API yanıt yapısı
    interface FirmResponse {
      success: boolean;
      data: FirmDto;
      status?: number;
    }
    
    const response = await api.get<FirmResponse>(`/api/v1/firms/${id}`);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 404,
      error: 'Firma bulunamadı',
    };
  },

  /**
   * Yeni bir firma oluştur
   */
  create: async (data: Partial<ICompany>): Promise<ApiResponse<ICompany>> => {
    const dto = mapModelToDto(data) as CreateFirmRequest;
    
    // API yanıt yapısı
    interface FirmResponse {
      success: boolean;
      data: FirmDto;
      status?: number;
    }
    
    const response = await api.post<FirmResponse>('/api/v1/firms', dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 201,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: 'Firma oluşturulamadı',
    };
  },

  /**
   * Mevcut bir firmayı güncelle
   */
  update: async (id: string | number, data: Partial<ICompany>): Promise<ApiResponse<ICompany>> => {
    const dto = mapModelToDto(data) as UpdateFirmRequest;
    
    // API yanıt yapısı
    interface FirmResponse {
      success: boolean;
      data: FirmDto;
      status?: number;
    }
    
    const response = await api.put<FirmResponse>(`/api/v1/firms/${id}`, dto);
    
    if (response.success && response.data) {
      return {
        success: response.success,
        status: 200,
        data: mapDtoToModel(response.data),
      };
    }
    
    return {
      success: false,
      status: 400,
      error: 'Firma güncellenemedi',
    };
  },

  /**
   * Bir firmayı sil
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/firms/${id}`);
  },
};