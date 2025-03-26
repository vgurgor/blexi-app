import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IDocument, IDocumentType } from '../../types/models';

// API'den gelen Document veri modeli
export interface DocumentDto {
  id: number;
  tenant_id: number;
  owner_id: number;
  document_type: {
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
  };
  type: 'UPLOADED' | 'SYSTEM_GENERATED';
  document_name: string;
  file_path: string;
  upload_date: string;
  valid_until?: string;
  metadata?: Record<string, any>;
  status: 'active' | 'verified' | 'expired' | 'invalid';
  version?: string;
  created_at: string;
  updated_at: string;
}

// Belge doğrulama isteği için model
export interface VerifyDocumentRequest {
  verification_date?: string;
  verified_by?: string;
  verification_notes?: string;
}

/**
 * DTO'yu model tipine dönüştüren yardımcı fonksiyon
 */
const mapDocumentDtoToModel = (dto: DocumentDto): IDocument => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    ownerId: dto.owner_id.toString(),
    documentType: {
      id: dto.document_type.id.toString(),
      name: dto.document_type.name,
      description: dto.document_type.description,
      templatePath: dto.document_type.template_path,
      requiredFields: dto.document_type.required_fields,
      isSystem: dto.document_type.is_system,
      validityPeriod: dto.document_type.validity_period,
      status: dto.document_type.status,
      createdAt: dto.document_type.created_at,
      updatedAt: dto.document_type.updated_at,
    },
    type: dto.type,
    documentName: dto.document_name,
    filePath: dto.file_path,
    uploadDate: dto.upload_date,
    validUntil: dto.valid_until,
    metadata: dto.metadata,
    status: dto.status,
    version: dto.version,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Belgeler API servisi
 */
export const documentsApi = {
  /**
   * Kişiye ait tüm belgeleri listeler
   * @param personId - Kişi ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByPersonId: async (
    personId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IDocument>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/people/${personId}/documents?${params.toString()}`;
    const response = await api.get<DocumentDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapDocumentDtoToModel),
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
   * ID'ye göre belge detaylarını getirir
   * @param id - Belge ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IDocument>> => {
    const response = await api.get<DocumentDto>(`/api/v1/documents/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDocumentDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belgeyi siler (soft delete)
   * @param id - Belge ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/documents/${id}`);
  },
  
  /**
   * Belgeyi doğrular (verify)
   * @param id - Belge ID'si
   * @param data - Doğrulama bilgileri
   */
  verify: async (
    id: string | number,
    data?: VerifyDocumentRequest
  ): Promise<ApiResponse<IDocument>> => {
    const response = await api.post<DocumentDto>(`/api/v1/documents/${id}/verify`, data || {});
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDocumentDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belgeyi indirir
   * @param id - Belge ID'si
   */
  download: async (id: string | number): Promise<Blob> => {
    return await api.getBlob(`/api/v1/documents/${id}/download`);
  },
}; 