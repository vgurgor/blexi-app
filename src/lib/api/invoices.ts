import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IInvoice, IInvoiceDetail, IInvoiceTaxDetail } from '../../types/models';

// API'den gelen fatura veri modeli
export interface InvoiceDto {
  id: number;
  invoice_number: string;
  invoice_date: string;
  season_registration_id: number;
  invoice_title_id: number;
  total_amount: number;
  tax_amount: number;
  net_amount: number;
  currency: string;
  status: 'draft' | 'issued' | 'canceled';
  integration_status: 'pending' | 'sent' | 'error';
  integration_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  details?: InvoiceDetailDto[];
}

// API'den gelen fatura detay veri modeli
export interface InvoiceDetailDto {
  id: number;
  invoice_id: number;
  season_registration_product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  tax_details?: InvoiceTaxDetailDto[];
}

// API'den gelen fatura vergi detay veri modeli
export interface InvoiceTaxDetailDto {
  id: number;
  invoice_detail_id: number;
  tax_type_id: number;
  tax_rate: number;
  tax_amount: number;
  created_at: string;
  updated_at: string;
}

// Fatura oluşturma isteği için model
export interface CreateInvoiceRequest {
  season_registration_id: number;
  invoice_title_id: number;
  invoice_number?: string;
  invoice_date?: string;
  currency?: string;
  notes?: string;
  details?: {
    season_registration_product_id: number;
    description?: string;
    quantity?: number;
    unit_price?: number;
  }[];
}

// Fatura güncelleme isteği için model
export interface UpdateInvoiceRequest {
  invoice_title_id?: number;
  invoice_date?: string;
  currency?: string;
  notes?: string;
}

// Aylık fatura oluşturma isteği için model
export interface GenerateMonthlyInvoicesRequest {
  month: string; // YYYY-MM formatında
}

/**
 * DTO'yu model tipine dönüştüren yardımcı fonksiyonlar
 */
const mapInvoiceTaxDetailDtoToModel = (dto: InvoiceTaxDetailDto): IInvoiceTaxDetail => {
  return {
    id: dto.id.toString(),
    invoiceDetailId: dto.invoice_detail_id.toString(),
    taxTypeId: dto.tax_type_id.toString(),
    taxRate: dto.tax_rate,
    taxAmount: dto.tax_amount,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

export const mapInvoiceDetailDtoToModel = (dto: InvoiceDetailDto): IInvoiceDetail => {
  return {
    id: dto.id.toString(),
    invoiceId: dto.invoice_id.toString(),
    seasonRegistrationProductId: dto.season_registration_product_id.toString(),
    description: dto.description,
    quantity: dto.quantity,
    unitPrice: dto.unit_price,
    totalPrice: dto.total_price,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    taxDetails: dto.tax_details?.map(mapInvoiceTaxDetailDtoToModel),
  };
};

const mapInvoiceDtoToModel = (dto: InvoiceDto): IInvoice => {
  return {
    id: dto.id.toString(),
    invoiceNumber: dto.invoice_number,
    invoiceDate: dto.invoice_date,
    seasonRegistrationId: dto.season_registration_id.toString(),
    invoiceTitleId: dto.invoice_title_id.toString(),
    totalAmount: dto.total_amount,
    taxAmount: dto.tax_amount,
    netAmount: dto.net_amount,
    currency: dto.currency,
    status: dto.status,
    integrationStatus: dto.integration_status,
    integrationId: dto.integration_id,
    notes: dto.notes,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    details: dto.details?.map(mapInvoiceDetailDtoToModel),
  };
};

/**
 * Faturalar API servisi
 */
export const invoicesApi = {
  /**
   * Faturaları listeler, filtreleme seçenekleriyle
   * @param options - Filtreleme ve sayfalama seçenekleri
   */
  getAll: async (options: {
    page?: number;
    perPage?: number;
    status?: 'draft' | 'issued' | 'canceled';
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PaginatedResponse<IInvoice>> => {
    const params = new URLSearchParams();
    
    if (options.page) {
      params.append('page', options.page.toString());
    }
    
    if (options.perPage) {
      params.append('per_page', options.perPage.toString());
    }
    
    if (options.status) {
      params.append('status', options.status);
    }
    
    if (options.startDate) {
      params.append('start_date', options.startDate);
    }
    
    if (options.endDate) {
      params.append('end_date', options.endDate);
    }
    
    const url = `/api/v1/invoices?${params.toString()}`;
    const response = await api.get<InvoiceDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapInvoiceDtoToModel),
        page: options.page || 1,
        limit: options.perPage || 15,
        total: response.meta?.total || 0,
      };
    }
    
    return {
      ...response,
      data: [],
      page: options.page || 1,
      limit: options.perPage || 15,
      total: 0,
    };
  },
  
  /**
   * Yeni bir fatura oluşturur
   * @param data - Fatura oluşturma verileri
   */
  create: async (
    data: CreateInvoiceRequest
  ): Promise<ApiResponse<IInvoice>> => {
    const response = await api.post<InvoiceDto>('/api/v1/invoices', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre fatura detaylarını getirir
   * @param id - Fatura ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IInvoice>> => {
    const response = await api.get<InvoiceDto>(`/api/v1/invoices/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Faturayı günceller
   * @param id - Fatura ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateInvoiceRequest
  ): Promise<ApiResponse<IInvoice>> => {
    const response = await api.put<InvoiceDto>(`/api/v1/invoices/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Faturayı siler (sadece taslak durumunda olan faturalar silinebilir)
   * @param id - Fatura ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/invoices/${id}`);
  },
  
  /**
   * Faturayı iptal eder
   * @param id - Fatura ID'si
   */
  cancel: async (id: string | number): Promise<ApiResponse<IInvoice>> => {
    const response = await api.post<InvoiceDto>(`/api/v1/invoices/${id}/cancel`, {});
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Faturalanmamış ödemeler için aylık fatura oluşturur
   * @param month - YYYY-MM formatında ay
   */
  generateMonthlyInvoices: async (
    month: string
  ): Promise<ApiResponse<IInvoice[]>> => {
    const data: GenerateMonthlyInvoicesRequest = {
      month,
    };
    
    const response = await api.post<InvoiceDto[]>('/api/v1/invoices/generate-monthly', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapInvoiceDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Belirli bir sezon kaydına ait faturaları listeler
   * @param registrationId - Sezon kaydı ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByRegistrationId: async (
    registrationId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IInvoice>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/season-registrations/${registrationId}/invoices?${params.toString()}`;
    const response = await api.get<InvoiceDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapInvoiceDtoToModel),
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
}; 