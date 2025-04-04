import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IGuardianHistory } from '../../types/models';

// API'den gelen vasi geçmişi veri modeli
export interface GuestGuardianHistoryRecordDto {
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
      surname: string;
      gender?: string;
    };
  };
  guest?: {
    id: number;
    person_id: number;
    person?: {
      name: string;
      surname: string;
      gender?: string;
    };
  };
}

// API'den gelen GuestGuardianHistoryRecordDto'yu IGuardianHistory modeline dönüştüren yardımcı fonksiyon
const mapGuardianHistoryDtoToModel = (dto: GuestGuardianHistoryRecordDto): IGuardianHistory => {
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
    } as any : undefined,
    guest: dto.guest ? {
      id: dto.guest.id.toString(),
      personId: dto.guest.person_id.toString(),
      person: dto.guest.person ? {
        name: dto.guest.person.name,
        surname: dto.guest.person.surname,
        gender: dto.guest.person.gender
      } : undefined
    } : undefined
  };
};

/**
 * Misafir Vasi Geçmişi API servisi
 */
export const guestGuardianHistoryApi = {
  /**
   * Tüm vasi geçmişi kayıtlarını listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IGuardianHistory>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/guardian-history?${params.toString()}`;
    const response = await api.get<GuestGuardianHistoryRecordDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapGuardianHistoryDtoToModel),
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
   * Belirli bir vasi geçmişi kaydını ID'ye göre getirir
   * @param id - Vasi geçmişi kaydı ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IGuardianHistory>> => {
    const response = await api.get<GuestGuardianHistoryRecordDto>(`/api/v1/guardian-history/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapGuardianHistoryDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belirli bir misafire ait vasi geçmişi kayıtlarını getirir
   * @param guestId - Misafir ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getByGuestId: async (
    guestId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IGuardianHistory>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/guests/${guestId}/guardian-history?${params.toString()}`;
    const response = await api.get<GuestGuardianHistoryRecordDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapGuardianHistoryDtoToModel),
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
   * Belirli bir vasiye ait vasi geçmişi kayıtlarını getirir
   * @param guardianId - Vasi ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getByGuardianId: async (
    guardianId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IGuardianHistory>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/guardians/${guardianId}/history?${params.toString()}`;
    const response = await api.get<GuestGuardianHistoryRecordDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapGuardianHistoryDtoToModel),
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
  }
}; 