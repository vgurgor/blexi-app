import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IInvoiceDetail, IInvoiceTaxDetail } from '../../types/models';
import { InvoiceDetailDto, InvoiceTaxDetailDto, mapInvoiceDetailDtoToModel } from './invoices';

// Fatura detayı oluşturma isteği için model
export interface CreateInvoiceDetailRequest {
  season_registration_product_id: number;
  description?: string;
  quantity?: number;
  unit_price?: number;
  tax_details?: {
    tax_type_id: number;
    tax_rate: number;
    tax_amount: number;
  }[];
}

// Fatura detayı güncelleme isteği için model
export interface UpdateInvoiceDetailRequest {
  description?: string;
  quantity?: number;
  unit_price?: number;
  tax_details?: {
    tax_type_id: number;
    tax_rate: number;
    tax_amount: number;
  }[];
}

/**
 * Fatura Detayları API servisi
 */
export const invoiceDetailsApi = {
  /**
   * Belirli bir faturanın tüm detaylarını listeler
   * @param invoiceId - Fatura ID'si
   * @param options - Sayfalama seçenekleri
   */
  getAllByInvoiceId: async (
    invoiceId: string | number,
    options: {
      page?: number;
      perPage?: number;
    } = {}
  ): Promise<PaginatedResponse<IInvoiceDetail>> => {
    const params = new URLSearchParams();
    
    if (options.page) {
      params.append('page', options.page.toString());
    }
    
    if (options.perPage) {
      params.append('per_page', options.perPage.toString());
    }
    
    const url = `/api/v1/invoices/${invoiceId}/details?${params.toString()}`;
    const response = await api.get<InvoiceDetailDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapInvoiceDetailDtoToModel),
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
   * Bir faturaya yeni detay ekler
   * @param invoiceId - Fatura ID'si
   * @param data - Fatura detay oluşturma verileri
   */
  create: async (
    invoiceId: string | number,
    data: CreateInvoiceDetailRequest
  ): Promise<ApiResponse<IInvoiceDetail>> => {
    const response = await api.post<InvoiceDetailDto>(
      `/api/v1/invoices/${invoiceId}/details`,
      data
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceDetailDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Bir fatura detayını günceller
   * @param invoiceId - Fatura ID'si
   * @param detailId - Fatura detay ID'si
   * @param data - Fatura detay güncelleme verileri
   */
  update: async (
    invoiceId: string | number,
    detailId: string | number,
    data: UpdateInvoiceDetailRequest
  ): Promise<ApiResponse<IInvoiceDetail>> => {
    const response = await api.put<InvoiceDetailDto>(
      `/api/v1/invoices/${invoiceId}/details/${detailId}`,
      data
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceDetailDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Bir fatura detayını siler
   * @param invoiceId - Fatura ID'si
   * @param detailId - Fatura detay ID'si
   */
  delete: async (
    invoiceId: string | number,
    detailId: string | number
  ): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/invoices/${invoiceId}/details/${detailId}`);
  },
}; 