import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IDocumentType } from '../../types/models';

// API'de tanımlanan Document Type modeli
export interface DocumentTypeDto {
  id: number;
  name: string;
  description?: string;
  template_path?: string;
  required_fields?: string[];
  is_system: boolean;
  validity_period?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Document Type oluşturma isteği için model
export interface CreateDocumentTypeRequest {
  name: string;
  description?: string;
  template_path?: string;
  required_fields?: string[];
  is_system?: boolean;
  validity_period?: number;
  status?: 'active' | 'inactive';
}

// Document Type güncelleme isteği için model
export interface UpdateDocumentTypeRequest {
  name?: string;
  description?: string;
  template_path?: string;
  required_fields?: string[];
  is_system?: boolean;
  validity_period?: number;
  status?: 'active' | 'inactive';
}

/**
 * DTO'yu model tipine dönüştüren yardımcı fonksiyon
 */
const mapDocumentTypeDtoToModel = (dto: DocumentTypeDto): IDocumentType => {
  return {
    id: dto.id.toString(),
    name: dto.name,
    description: dto.description,
    templatePath: dto.template_path,
    requiredFields: dto.required_fields,
    isSystem: dto.is_system,
    validityPeriod: dto.validity_period,
    status: dto.status,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Belge Türleri API servisi
 */
export const documentTypesApi = {
  /**
   * Tüm belge türlerini listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IDocumentType>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/document-types?${params.toString()}`;
    const response = await api.get<DocumentTypeDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapDocumentTypeDtoToModel),
        page,
        limit: perPage,
        total: response.meta?.total || 0,
      };
    }
    
    return {
      ...response,
      data: [],
      page,
      limit: perPage,
      total: 0,
    };
  },
  
  /**
   * Yeni bir belge türü oluşturur
   * @param data - Belge türü oluşturma verileri
   */
  create: async (
    data: CreateDocumentTypeRequest
  ): Promise<ApiResponse<IDocumentType>> => {
    const response = await api.post<DocumentTypeDto>('/api/v1/document-types', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDocumentTypeDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre belge türü detaylarını getirir
   * @param id - Belge türü ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IDocumentType>> => {
    const response = await api.get<DocumentTypeDto>(`/api/v1/document-types/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDocumentTypeDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belge türünü günceller
   * @param id - Belge türü ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateDocumentTypeRequest
  ): Promise<ApiResponse<IDocumentType>> => {
    const response = await api.put<DocumentTypeDto>(`/api/v1/document-types/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDocumentTypeDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belge türünü siler
   * @param id - Belge türü ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/document-types/${id}`);
  },
}; 