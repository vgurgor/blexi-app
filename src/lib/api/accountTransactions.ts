import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IAccountTransaction, IAccountTransactionSummary } from '../../types/models';

// API'de tanımlanan Account Transaction modeli
export interface AccountTransactionDto {
  id: number;
  guest_id: number;
  transaction_type: number;
  transaction_type_label: string;
  model_type: string;
  model_id: number;
  amount: number;
  movement_type: number;
  movement_type_label: string;
  effective_amount: number;
  description: string;
  created_at: string;
}

// API'de tanımlanan Account Transaction Summary modeli
export interface AccountTransactionSummaryDto {
  guest_id: number;
  balance: number;
  transactions_count: number;
  total_charged: number;
  total_paid: number;
  type_breakdown: Record<string, number>;
  last_transaction_date: string;
}

// AccountTransactionDto'yu IAccountTransaction modeline dönüştüren yardımcı fonksiyon
const mapAccountTransactionDtoToModel = (dto: AccountTransactionDto): IAccountTransaction => {
  return {
    id: dto.id.toString(),
    guestId: dto.guest_id.toString(),
    transactionType: dto.transaction_type,
    transactionTypeLabel: dto.transaction_type_label,
    modelType: dto.model_type,
    modelId: dto.model_id.toString(),
    amount: dto.amount,
    movementType: dto.movement_type,
    movementTypeLabel: dto.movement_type_label,
    effectiveAmount: dto.effective_amount,
    description: dto.description,
    createdAt: dto.created_at
  };
};

// AccountTransactionSummaryDto'yu IAccountTransactionSummary modeline dönüştüren yardımcı fonksiyon
const mapAccountTransactionSummaryDtoToModel = (dto: AccountTransactionSummaryDto): IAccountTransactionSummary => {
  return {
    guestId: dto.guest_id.toString(),
    balance: dto.balance,
    transactionsCount: dto.transactions_count,
    totalCharged: dto.total_charged,
    totalPaid: dto.total_paid,
    typeBreakdown: dto.type_breakdown,
    lastTransactionDate: dto.last_transaction_date
  };
};

/**
 * Hesap İşlemleri API servisi
 */
export const accountTransactionsApi = {
  /**
   * Tüm hesap işlemlerini listeler, filtreleme opsiyonları ile
   * @param guestId - Filtreleme için misafir ID (isteğe bağlı)
   * @param transactionType - Filtreleme için işlem tipi (isteğe bağlı)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    guestId?: string | number,
    transactionType?: number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IAccountTransaction>> => {
    const params = new URLSearchParams();
    
    if (guestId) {
      params.append('guest_id', guestId.toString());
    }
    
    if (transactionType !== undefined) {
      params.append('transaction_type', transactionType.toString());
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/account-transactions?${params.toString()}`;
    const response = await api.get<AccountTransactionDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAccountTransactionDtoToModel),
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
   * ID'ye göre hesap işlemi detaylarını getirir
   * @param id - Hesap işlemi ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IAccountTransaction>> => {
    const response = await api.get<AccountTransactionDto>(`/api/v1/account-transactions/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAccountTransactionDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belirli bir misafire ait hesap işlemlerini listeler
   * @param guestId - Misafir ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByGuestId: async (
    guestId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IAccountTransaction>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/guests/${guestId}/account-transactions?${params.toString()}`;
    const response = await api.get<AccountTransactionDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAccountTransactionDtoToModel),
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
   * Belirli bir işlem tipine ait hesap işlemlerini listeler
   * @param transactionType - İşlem tipi (1-8)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByTransactionType: async (
    transactionType: number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IAccountTransaction>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/account-transactions/types/${transactionType}?${params.toString()}`;
    const response = await api.get<AccountTransactionDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAccountTransactionDtoToModel),
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
   * Hesap işlemi özetini getirir
   * @param guestId - Misafir ID'si
   */
  getSummary: async (guestId: string | number): Promise<ApiResponse<IAccountTransactionSummary>> => {
    const params = new URLSearchParams();
    params.append('guest_id', guestId.toString());
    
    const url = `/api/v1/account-transactions/summary?${params.toString()}`;
    const response = await api.get<AccountTransactionSummaryDto>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAccountTransactionSummaryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Misafir için hesap işlemi geçmişini ve bakiye bilgisini getirir
   * @param guestId - Misafir ID'si
   * @param limit - En fazla dönecek işlem sayısı (isteğe bağlı)
   */
  getHistory: async (
    guestId: string | number,
    limit?: number
  ): Promise<ApiResponse<IAccountTransaction[]>> => {
    const params = new URLSearchParams();
    
    if (limit) {
      params.append('limit', limit.toString());
    }
    
    const url = `/api/v1/guests/${guestId}/account-transactions/history?${params.toString()}`;
    const response = await api.get<AccountTransactionDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAccountTransactionDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
}; 