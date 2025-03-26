import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IGuardian } from '../../types/models';

// API'den gelen vasi veri modeli
export interface GuardianDto {
  id: number;
  tenant_id: number;
  person_id: number;
  guest_id: number;
  relationship: string;
  is_self: boolean;
  is_emergency_contact: boolean;
  valid_from: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
  person?: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
}

// Vasi oluşturma isteği modeli
export interface CreateGuardianRequest {
  person_id: number;
  guest_id: number;
  relationship: string;
  is_self?: boolean;
  is_emergency_contact?: boolean;
  valid_from?: string;
  notes?: string;
}

// Vasi güncelleme isteği modeli
export interface UpdateGuardianRequest {
  relationship?: string;
  is_emergency_contact?: boolean;
  notes?: string;
  change_reason: string;
}

// Vasi durum güncelleme isteği modeli
export interface UpdateGuardianStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// API'den gelen GuardianDto'yu IGuardian modeline dönüştüren yardımcı fonksiyon
const mapGuardianDtoToModel = (dto: GuardianDto): IGuardian => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    personId: dto.person_id.toString(),
    guestId: dto.guest_id.toString(),
    relationship: dto.relationship,
    isSelf: dto.is_self,
    isEmergencyContact: dto.is_emergency_contact,
    validFrom: dto.valid_from,
    notes: dto.notes,
    status: dto.status,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    person: dto.person ? {
      id: dto.person.id.toString(),
      name: dto.person.name,
      phone: dto.person.phone,
      email: dto.person.email
    } : undefined
  };
};

/**
 * Vasiler API servisi
 */
export const guardiansApi = {
  /**
   * Belirli bir misafire ait tüm vasileri listeler
   * @param guestId - Misafir ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getByGuestId: async (
    guestId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IGuardian>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/guests/${guestId}/guardians?${params.toString()}`;
    const response = await api.get<GuardianDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapGuardianDtoToModel),
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
   * Yeni bir vasi oluşturur
   * @param request - Vasi oluşturma isteği
   */
  create: async (request: CreateGuardianRequest): Promise<ApiResponse<IGuardian>> => {
    const response = await api.post<GuardianDto>('/api/v1/guardians', request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapGuardianDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre vasi detaylarını getirir
   * @param id - Vasi ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IGuardian>> => {
    const response = await api.get<GuardianDto>(`/api/v1/guardians/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapGuardianDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Var olan bir vasiyi günceller
   * @param id - Güncellenecek vasi ID'si
   * @param request - Vasi güncelleme isteği
   */
  update: async (
    id: string | number,
    request: UpdateGuardianRequest
  ): Promise<ApiResponse<IGuardian>> => {
    const response = await api.put<GuardianDto>(`/api/v1/guardians/${id}`, request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapGuardianDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Vasi durumunu günceller
   * @param id - Güncellenecek vasi ID'si
   * @param status - Yeni durum değeri
   */
  updateStatus: async (
    id: string | number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  ): Promise<ApiResponse<IGuardian>> => {
    const request: UpdateGuardianStatusRequest = { status };
    const response = await api.patch<GuardianDto>(`/api/v1/guardians/${id}/status`, request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapGuardianDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  }
}; 