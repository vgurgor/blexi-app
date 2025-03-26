import { api } from './base';
import { ApiResponse } from '../../types/api';
import { IInvoiceTaxDetail } from '../../types/models';
import { InvoiceTaxDetailDto } from './invoices';

// Fatura vergi detayı oluşturma isteği için model
export interface CreateInvoiceTaxDetailRequest {
  tax_type_id: number;
  tax_rate: number;
  tax_amount: number;
}

// Fatura vergi detayı güncelleme isteği için model
export interface UpdateInvoiceTaxDetailRequest {
  tax_type_id?: number;
  tax_rate?: number;
  tax_amount?: number;
}

/**
 * Fatura vergi detaylarını model tipine dönüştüren yardımcı fonksiyon
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

/**
 * Fatura Vergi Detayları API servisi
 */
export const invoiceTaxDetailsApi = {
  /**
   * Bir fatura detayına vergi detayı ekler
   * @param invoiceId - Fatura ID'si
   * @param detailId - Fatura detay ID'si
   * @param data - Vergi detayı oluşturma verileri
   */
  create: async (
    invoiceId: string | number,
    detailId: string | number,
    data: CreateInvoiceTaxDetailRequest
  ): Promise<ApiResponse<IInvoiceTaxDetail>> => {
    const response = await api.post<InvoiceTaxDetailDto>(
      `/api/v1/invoices/${invoiceId}/details/${detailId}/taxes`,
      data
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceTaxDetailDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Fatura vergi detayını günceller
   * @param invoiceId - Fatura ID'si
   * @param detailId - Fatura detay ID'si
   * @param taxId - Vergi detay ID'si
   * @param data - Vergi detayı güncelleme verileri
   */
  update: async (
    invoiceId: string | number,
    detailId: string | number,
    taxId: string | number,
    data: UpdateInvoiceTaxDetailRequest
  ): Promise<ApiResponse<IInvoiceTaxDetail>> => {
    const response = await api.put<InvoiceTaxDetailDto>(
      `/api/v1/invoices/${invoiceId}/details/${detailId}/taxes/${taxId}`,
      data
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapInvoiceTaxDetailDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Fatura vergi detayını siler
   * @param invoiceId - Fatura ID'si
   * @param detailId - Fatura detay ID'si
   * @param taxId - Vergi detay ID'si
   */
  delete: async (
    invoiceId: string | number,
    detailId: string | number,
    taxId: string | number
  ): Promise<ApiResponse<void>> => {
    return await api.delete(
      `/api/v1/invoices/${invoiceId}/details/${detailId}/taxes/${taxId}`
    );
  },
}; 