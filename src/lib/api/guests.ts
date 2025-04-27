import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IGuest } from '../../types/models';

// API'den gelen misafir veri modeli
export interface GuestDto {
  id: number;
  tenant_id: number;
  person_id: number;
  guest_type: 'STUDENT' | 'EMPLOYEE' | 'OTHER';
  profession_department?: string;
  emergency_contact?: string;
  notes?: string;
  last_access_date?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
  person?: {
    id: number;
    name: string;
    surname: string;
    tc_no: string;
    phone: string;
    email?: string;
    birth_date: string;
    gender?: string;
  };
  guardians?: Array<{
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
      surname: string;
      phone?: string;
      email?: string;
      gender?: string;
    };
  }>;
  documents?: Array<{
    id: number;
    document_type: {
      id: number;
      name: string;
      description?: string;
      template_path?: string;
      required_fields?: string[];
      is_system: boolean;
      validity_period?: number;
      status: string;
      created_at: string;
      updated_at: string;
    };
    type: 'UPLOADED' | 'SYSTEM_GENERATED';
    document_name: string;
    file_path: string;
    upload_date: string;
    valid_until?: string;
    metadata?: Record<string, any>;
    status: string;
    version?: string;
    created_at: string;
    updated_at: string;
  }>;
  structured_address?: {
    id?: number;
    country_id: number;
    province_id: number;
    district_id: number;
    neighborhood?: string;
    street?: string;
    building_no?: string;
    apartment_no?: string;
    postal_code?: string;
    address_type: 'home' | 'work' | 'other';
    is_default?: boolean;
    status?: 'active' | 'inactive';
    formatted_address?: string;
    country?: {
      id: number;
      code: string;
      name: string;
      phone_code: string;
    };
    province?: {
      id: number;
      country_id: number;
      code: string;
      name: string;
    };
    district?: {
      id: number;
      province_id: number;
      name: string;
    };
  } | null;
  formatted_address?: string | null;
}

// Misafir oluşturma isteği modeli
export interface CreateGuestRequest {
  person_id: number;
  guest_type: 'STUDENT' | 'EMPLOYEE' | 'OTHER';
  profession_department?: string;
  emergency_contact?: string;
  notes?: string;
}

// Misafir güncelleme isteği modeli
export interface UpdateGuestRequest {
  guest_type?: 'STUDENT' | 'EMPLOYEE' | 'OTHER';
  profession_department?: string;
  emergency_contact?: string;
  notes?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// Misafir durum güncelleme isteği modeli (geriye dönük uyumluluk için tutuldu)
export interface UpdateGuestStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// API'den gelen GuestDto'yu IGuest modeline dönüştüren yardımcı fonksiyon
const mapGuestDtoToModel = (dto: GuestDto): IGuest => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    personId: dto.person_id.toString(),
    guestType: dto.guest_type,
    professionDepartment: dto.profession_department,
    emergencyContact: dto.emergency_contact,
    notes: dto.notes,
    lastAccessDate: dto.last_access_date,
    status: dto.status,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    person: dto.person ? {
      id: dto.person.id.toString(),
      name: dto.person.name,
      surname: dto.person.surname,
      gender: dto.person.gender,
      tcNo: dto.person.tc_no,
      phone: dto.person.phone,
      email: dto.person.email,
      birthDate: dto.person.birth_date
    } : undefined,
    guardians: dto.guardians?.map(guardian => ({
      id: guardian.id.toString(),
      tenantId: guardian.tenant_id.toString(),
      personId: guardian.person_id.toString(),
      guestId: guardian.guest_id.toString(),
      relationship: guardian.relationship,
      isSelf: guardian.is_self,
      isEmergencyContact: guardian.is_emergency_contact,
      validFrom: guardian.valid_from,
      notes: guardian.notes,
      status: guardian.status,
      createdAt: guardian.created_at,
      updatedAt: guardian.updated_at,
      person: guardian.person ? {
        id: guardian.person.id.toString(),
        name: guardian.person.name,
        surname: guardian.person.surname,
        gender: guardian.person.gender,
        phone: guardian.person.phone,
        email: guardian.person.email
      } : undefined
    })),
    documents: dto.documents?.map(document => ({
      id: document.id.toString(),
      tenantId: dto.tenant_id.toString(),
      ownerId: dto.id.toString(),
      documentType: {
        id: document.document_type.id.toString(),
        name: document.document_type.name,
        description: document.document_type.description,
        templatePath: document.document_type.template_path,
        requiredFields: document.document_type.required_fields,
        isSystem: document.document_type.is_system,
        validityPeriod: document.document_type.validity_period,
        status: document.document_type.status,
        createdAt: document.document_type.created_at,
        updatedAt: document.document_type.updated_at
      },
      type: document.type,
      documentName: document.document_name,
      filePath: document.file_path,
      uploadDate: document.upload_date || dto.created_at,
      validUntil: document.valid_until,
      metadata: document.metadata || {},
      status: document.status as 'active' | 'verified' | 'expired' | 'invalid',
      version: document.version,
      createdAt: document.created_at,
      updatedAt: document.updated_at
    })),
    structuredAddress: dto.structured_address && dto.structured_address.id ? {
      id: dto.structured_address.id.toString(),
      districtId: dto.structured_address.district_id.toString(),
      name: '',
      addressLine: `${dto.structured_address.street || ''} ${dto.structured_address.building_no || ''} ${dto.structured_address.apartment_no || ''} ${dto.structured_address.neighborhood || ''}`.trim(),
      postalCode: dto.structured_address.postal_code,
      isDefault: !!dto.structured_address.is_default,
      status: dto.structured_address.status || 'active',
      district: dto.structured_address.district ? {
        id: dto.structured_address.district.id.toString(),
        code: '',
        name: dto.structured_address.district.name,
        provinceId: dto.structured_address.district.province_id.toString()
      } : undefined,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at
    } : null,
    formattedAddress: dto.formatted_address
  };
};

/**
 * Misafirler API servisi
 */
export const guestsApi = {
  /**
   * Tüm misafirleri listeler, filtreleme opsiyonları ile
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   * @param name - İsme göre filtreleme (isteğe bağlı)
   * @param guestType - Misafir tipine göre filtreleme (isteğe bağlı)
   * @param status - Duruma göre filtreleme (isteğe bağlı)
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15,
    name?: string,
    guestType?: 'STUDENT' | 'EMPLOYEE' | 'OTHER',
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  ): Promise<PaginatedResponse<IGuest>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    if (name) {
      params.append('name', name);
    }
    
    if (guestType) {
      params.append('guest_type', guestType);
    }
    
    if (status) {
      params.append('status', status);
    }
    
    const url = `/api/v1/guests?${params.toString()}`;
    const response = await api.get<GuestDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapGuestDtoToModel),
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
   * Misafirleri belirli kriterlere göre arar
   * @param name - İsime göre arama (isteğe bağlı)
   * @param guestType - Misafir tipine göre filtreleme (isteğe bağlı)
   * @param status - Duruma göre filtreleme (isteğe bağlı)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  search: async (
    name?: string,
    guestType?: 'STUDENT' | 'EMPLOYEE' | 'OTHER',
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IGuest>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    if (name) {
      params.append('name', name);
    }
    
    if (guestType) {
      params.append('guest_type', guestType);
    }
    
    if (status) {
      params.append('status', status);
    }
    
    const url = `/api/v1/guests/search?${params.toString()}`;
    const response = await api.get<GuestDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapGuestDtoToModel),
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
   * Yeni bir misafir oluşturur
   * @param request - Misafir oluşturma isteği
   */
  create: async (request: CreateGuestRequest): Promise<ApiResponse<IGuest>> => {
    const response = await api.post<GuestDto>('/api/v1/guests', request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapGuestDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre misafir detaylarını getirir
   * @param id - Misafir ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IGuest>> => {
    const response = await api.get<GuestDto>(`/api/v1/guests/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapGuestDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Var olan bir misafiri günceller
   * @param id - Güncellenecek misafir ID'si
   * @param request - Misafir güncelleme isteği
   */
  update: async (
    id: string | number,
    request: UpdateGuestRequest
  ): Promise<ApiResponse<IGuest>> => {
    const response = await api.put<GuestDto>(`/api/v1/guests/${id}`, request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapGuestDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Misafir durumunu günceller
   * @param id - Güncellenecek misafir ID'si
   * @param status - Yeni durum değeri
   */
  updateStatus: async (
    id: string | number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  ): Promise<ApiResponse<IGuest>> => {
    const request: UpdateGuestStatusRequest = { status };
    const response = await api.patch<GuestDto>(`/api/v1/guests/${id}/status`, request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapGuestDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  }
}; 