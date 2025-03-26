import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IGuardian, IGuardianHistory } from '../../types/models';

// API'den gelen vasi tarihi veri modeli
export interface GuestGuardianHistoryDto {
  id: number;
  tenant_id: number;
  guest_id: number;
  guardian_id: number;
  valid_from: string;
  valid_to: string;
  change_reason: string;
  created_at: string;
  created_by: number;
  guardian?: {
    id: number;
    person_id: number;
    relationship: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    person?: {
      id: number;
      name: string;
    };
  };
  guest?: {
    id: number;
    person_id: number;
    person?: {
      name: string;
    };
  };
}

// Misafir için vasi oluşturma isteği modeli
export interface CreateGuestGuardianRequest {
  person_id: number;
  relationship: string;
  is_self?: boolean;
  is_emergency_contact?: boolean;
  valid_from: string;
  notes?: string;
}

// Misafir için vasi güncelleme isteği modeli
export interface UpdateGuestGuardianRequest {
  relationship?: string;
  is_emergency_contact?: boolean;
  notes?: string;
  change_reason: string;
}

// Misafir için vasi durum güncelleme isteği modeli
export interface UpdateGuestGuardianStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// API'den gelen GuestGuardianHistoryDto'yu IGuardianHistory modeline dönüştüren yardımcı fonksiyon
const mapGuardianHistoryDtoToModel = (dto: GuestGuardianHistoryDto): IGuardianHistory => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    guestId: dto.guest_id.toString(),
    guardianId: dto.guardian_id.toString(),
    validFrom: dto.valid_from,
    validTo: dto.valid_to,
    changeReason: dto.change_reason,
    createdAt: dto.created_at,
    createdBy: dto.created_by.toString(),
    guardian: dto.guardian ? {
      id: dto.guardian.id.toString(),
      personId: dto.guardian.person_id.toString(),
      relationship: dto.guardian.relationship,
      status: dto.guardian.status,
      person: dto.guardian.person ? {
        id: dto.guardian.person.id.toString(),
        name: dto.guardian.person.name
      } : undefined
    } as IGuardian : undefined,
    guest: dto.guest ? {
      id: dto.guest.id.toString(),
      personId: dto.guest.person_id.toString(),
      person: dto.guest.person ? {
        name: dto.guest.person.name
      } : undefined
    } : undefined
  };
};

/**
 * Misafir Vasileri API servisi
 */
export const guestGuardiansApi = {
  /**
   * Belirli bir misafirin tüm vasilerini listeler
   * @param guestId - Misafir ID'si
   */
  getByGuestId: async (guestId: string | number): Promise<ApiResponse<IGuardian[]>> => {
    const response = await api.get<IGuardian[]>(`/api/v1/guests/${guestId}/guardians`);
    
    return response;
  },
  
  /**
   * Bir misafir için yeni bir vasi oluşturur
   * @param guestId - Misafir ID'si
   * @param request - Vasi oluşturma isteği
   */
  create: async (
    guestId: string | number,
    request: CreateGuestGuardianRequest
  ): Promise<ApiResponse<IGuardian>> => {
    const response = await api.post<IGuardian>(`/api/v1/guests/${guestId}/guardians`, request);
    
    return response;
  },
  
  /**
   * Bir misafirin vasisini günceller
   * @param guestId - Misafir ID'si
   * @param guardianId - Vasi ID'si
   * @param request - Vasi güncelleme isteği
   */
  update: async (
    guestId: string | number,
    guardianId: string | number,
    request: UpdateGuestGuardianRequest
  ): Promise<ApiResponse<IGuardian>> => {
    const response = await api.put<IGuardian>(
      `/api/v1/guests/${guestId}/guardians/${guardianId}`,
      request
    );
    
    return response;
  },
  
  /**
   * Bir misafirin vasisinin durumunu günceller
   * @param guestId - Misafir ID'si
   * @param guardianId - Vasi ID'si
   * @param status - Yeni durum değeri
   */
  updateStatus: async (
    guestId: string | number,
    guardianId: string | number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  ): Promise<ApiResponse<IGuardian>> => {
    const request: UpdateGuestGuardianStatusRequest = { status };
    const response = await api.patch<IGuardian>(
      `/api/v1/guests/${guestId}/guardians/${guardianId}/status`,
      request
    );
    
    return response;
  },
  
  /**
   * Bir misafirin vasi geçmişini alır (Eski endpoint)
   * @param guestId - Misafir ID'si
   */
  getGuardianHistory: async (guestId: string | number): Promise<ApiResponse<IGuardianHistory[]>> => {
    const response = await api.get<GuestGuardianHistoryDto[]>(`/api/v1/guests/${guestId}/guardian-history`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapGuardianHistoryDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  }
}; 