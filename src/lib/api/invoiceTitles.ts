import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IInvoiceTitle } from '../../types/models';

// API'den gelen fatura başlığı veri modeli
export interface InvoiceTitleDto {
  id: number;
  tenant_id: number;
  season_registration_id: number;
  title_type: 'corporate' | 'individual';
  company_name?: string;
  tax_office?: string;
  tax_number?: string;
  identity_number?: string;
  first_name?: string;
  last_name?: string;
  address: string;
  phone: string;
  email?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Fatura başlığı oluşturma isteği için model
export interface CreateInvoiceTitleRequest {
  season_registration_id: number;
  title_type: 'corporate' | 'individual';
  company_name?: string;
  tax_office?: string;
  tax_number?: string;
  identity_number?: string;
  first_name?: string;
  last_name?: string;
  address: string;
  phone: string;
  email?: string;
  is_default?: boolean;
}

// Fatura başlığı güncelleme isteği için model
export interface UpdateInvoiceTitleRequest {
  title_type?: 'corporate' | 'individual';
  company_name?: string;
  tax_office?: string;
  tax_number?: string;
  identity_number?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_default?: boolean;
}

/**
 * DTO'yu model tipine dönüştüren yardımcı fonksiyon
 */
const mapInvoiceTitleDtoToModel = (dto: InvoiceTitleDto): IInvoiceTitle => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    seasonRegistrationId: dto.season_registration_id.toString(),
    titleType: dto.title_type,
    companyName: dto.company_name,
    taxOffice: dto.tax_office,
    taxNumber: dto.tax_number,
    identityNumber: dto.identity_number,
    firstName: dto.first_name,
    lastName: dto.last_name,
    address: dto.address,
    phone: dto.phone,
    email: dto.email,
    isDefault: dto.is_default,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Fatura Başlıkları API servisi
 */
export const invoiceTitlesApi = {
  /**
   * Belirli bir sezon kaydına ait tüm fatura başlıklarını listeler
   * @param registrationId - Sezon kaydı ID'si
   */
  getByRegistrationId: async (
    registrationId: string | number
  ): Promise<ApiResponse<IInvoiceTitle[]>> => {
    const url = `/api/v1/season-registrations/${registrationId}/invoice-titles`;
    const response = await api.get<InvoiceTitleDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapInvoiceTitleDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Yeni bir fatura başlığı oluşturur
   * @param data - Fatura başlığı oluşturma verileri
   */
  create: async (
    data: CreateInvoiceTitleRequest
  ): Promise<ApiResponse<IInvoiceTitle>> => {
    const response = await api.post<InvoiceTitleDto>('/api/v1/invoice-titles', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceTitleDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre fatura başlığı detaylarını getirir
   * @param id - Fatura başlığı ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IInvoiceTitle>> => {
    const response = await api.get<InvoiceTitleDto>(`/api/v1/invoice-titles/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceTitleDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Fatura başlığını günceller
   * @param id - Fatura başlığı ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateInvoiceTitleRequest
  ): Promise<ApiResponse<void>> => {
    return await api.put(`/api/v1/invoice-titles/${id}`, data);
  },
  
  /**
   * Fatura başlığını siler
   * @param id - Fatura başlığı ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/invoice-titles/${id}`);
  },
  
  /**
   * Fatura başlığını varsayılan olarak ayarlar
   * @param id - Fatura başlığı ID'si
   */
  setAsDefault: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.post(`/api/v1/invoice-titles/${id}/set-as-default`);
  },
}; 