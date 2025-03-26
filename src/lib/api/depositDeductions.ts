import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IDepositDeduction, IDepositSummary } from '../../types/models';

// API'den gelen depozito kesintisi veri modeli
export interface DepositDeductionDto {
  id: number;
  season_registration_id: number;
  amount: number;
  reason: string;
  description?: string;
  evidence_photo_path?: string;
  created_at: string;
  updated_at: string;
}

// Depozito özeti için veri modeli
export interface DepositSummaryDto {
  deposit_amount: number;
  total_deductions: number;
  refundable_amount: number;
  deduction_count: number;
}

// Depozito kesintisi oluşturma isteği için model
export interface CreateDepositDeductionRequest {
  amount: number;
  reason: string;
  description?: string;
  evidence_photo_path?: string;
}

// Depozito kesintisi güncelleme isteği için model
export interface UpdateDepositDeductionRequest {
  amount?: number;
  reason?: string;
  description?: string;
  evidence_photo_path?: string;
}

/**
 * DTO'yu model tipine dönüştüren yardımcı fonksiyon
 */
const mapDepositDeductionDtoToModel = (dto: DepositDeductionDto): IDepositDeduction => {
  return {
    id: dto.id.toString(),
    seasonRegistrationId: dto.season_registration_id.toString(),
    amount: dto.amount,
    reason: dto.reason,
    description: dto.description,
    evidencePhotoPath: dto.evidence_photo_path,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Depozito özeti DTO'sunu model tipine dönüştüren yardımcı fonksiyon
 */
const mapDepositSummaryDtoToModel = (dto: DepositSummaryDto): IDepositSummary => {
  return {
    depositAmount: dto.deposit_amount,
    totalDeductions: dto.total_deductions,
    refundableAmount: dto.refundable_amount,
    deductionCount: dto.deduction_count,
  };
};

/**
 * Depozito Kesintileri API servisi
 */
export const depositDeductionsApi = {
  /**
   * Sezon kaydına ait tüm depozito kesintilerini listeler
   * @param registrationId - Sezon kaydı ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getByRegistrationId: async (
    registrationId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IDepositDeduction>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/season-registrations/${registrationId}/deposit-deductions?${params.toString()}`;
    const response = await api.get<DepositDeductionDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapDepositDeductionDtoToModel),
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
   * Yeni bir depozito kesintisi oluşturur
   * @param registrationId - Sezon kaydı ID'si
   * @param data - Kesinti oluşturma verileri
   */
  create: async (
    registrationId: string | number,
    data: CreateDepositDeductionRequest
  ): Promise<ApiResponse<IDepositDeduction>> => {
    const url = `/api/v1/season-registrations/${registrationId}/deposit-deductions`;
    const response = await api.post<DepositDeductionDto>(url, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDepositDeductionDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre depozito kesintisi detaylarını getirir
   * @param id - Depozito kesintisi ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IDepositDeduction>> => {
    const response = await api.get<DepositDeductionDto>(`/api/v1/deposit-deductions/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDepositDeductionDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Depozito kesintisini günceller
   * @param id - Depozito kesintisi ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateDepositDeductionRequest
  ): Promise<ApiResponse<IDepositDeduction>> => {
    const response = await api.put<DepositDeductionDto>(`/api/v1/deposit-deductions/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDepositDeductionDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Depozito kesintisini siler
   * @param id - Depozito kesintisi ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/deposit-deductions/${id}`);
  },
  
  /**
   * Sezon kaydına ait depozito özetini getirir
   * @param registrationId - Sezon kaydı ID'si
   */
  getDepositSummary: async (
    registrationId: string | number
  ): Promise<ApiResponse<IDepositSummary>> => {
    const url = `/api/v1/season-registrations/${registrationId}/deposit-summary`;
    const response = await api.get<DepositSummaryDto>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapDepositSummaryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
}; 