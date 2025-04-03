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
  structured_address?: any | null;
  formatted_address?: string | null;
  created_at: string;
  updated_at: string;
}

// Adres veri modeli
export interface AddressDataRequest {
  country_id: number;
  province_id: number;
  district_id: number;
  neighborhood?: string;
  street?: string;
  building_no?: string;
  apartment_no?: string;
  postal_code?: string;
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
  address_data?: AddressDataRequest;
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
  address_data?: AddressDataRequest;
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
    structuredAddress: dto.structured_address,
    formattedAddress: dto.formatted_address,
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
    return await api.patch(`/api/v1/invoice-titles/${id}/set-default`, {});
  },
}; 