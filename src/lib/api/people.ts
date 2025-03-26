import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IPerson } from '../../types/models';

// API'de tanımlanan Person modeli
export interface PersonDto {
  id: number;
  tenant_id: number;
  name: string;
  tc_no: string;
  phone: string;
  email?: string;
  birth_date: string;
  address?: string;
  city?: string;
  profile_photo_path?: string;
  profile_photo_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Kişi oluşturma isteği için model
export interface CreatePersonRequest {
  name: string;
  tc_no: string;
  phone: string;
  email?: string;
  birth_date: string;
  address?: string;
  city?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// Kişi güncelleme isteği için model
export interface UpdatePersonRequest {
  name?: string;
  tc_no?: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  address?: string;
  city?: string;
}

// Kişi durumu güncelleme isteği için model
export interface UpdatePersonStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// Profil fotoğrafı yükleme isteği için model
export interface UploadProfilePhotoRequest {
  profile_photo: File;
}

// PersonDto'yu IPerson modeline dönüştüren yardımcı fonksiyon
const mapPersonDtoToModel = (dto: PersonDto): IPerson => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    name: dto.name,
    tcNo: dto.tc_no,
    phone: dto.phone,
    email: dto.email,
    birthDate: dto.birth_date,
    address: dto.address,
    city: dto.city,
    profilePhotoPath: dto.profile_photo_path,
    profilePhotoUrl: dto.profile_photo_url,
    status: dto.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Kişiler API servisi
 */
export const peopleApi = {
  /**
   * Tüm kişileri listeler
   * @param status - Filtreleme için durum (isteğe bağlı)
   * @param name - Filtreleme için isim (isteğe bağlı)
   * @param phone - Filtreleme için telefon (isteğe bağlı)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    name?: string,
    phone?: string,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IPerson>> => {
    const params = new URLSearchParams();
    
    if (status) {
      params.append('status', status);
    }
    
    if (name) {
      params.append('name', name);
    }
    
    if (phone) {
      params.append('phone', phone);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/people?${params.toString()}`;
    const response = await api.get<PersonDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapPersonDtoToModel),
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
   * Yeni bir kişi oluşturur
   * @param data - Kişi oluşturma verileri
   */
  create: async (data: CreatePersonRequest): Promise<ApiResponse<IPerson>> => {
    const response = await api.post<PersonDto>('/api/v1/people', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPersonDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre kişi detaylarını getirir
   * @param id - Kişi ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IPerson>> => {
    const response = await api.get<PersonDto>(`/api/v1/people/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPersonDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir kişiyi günceller
   * @param id - Güncellenecek kişi ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdatePersonRequest
  ): Promise<ApiResponse<IPerson>> => {
    const response = await api.put<PersonDto>(`/api/v1/people/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPersonDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Kişi siler
   * @param id - Silinecek kişi ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/people/${id}`);
  },
  
  /**
   * Kişi durumunu günceller
   * @param id - Durumu güncellenecek kişi ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  ): Promise<ApiResponse<IPerson>> => {
    const response = await api.put<PersonDto>(`/api/v1/people/${id}/status`, { status });
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPersonDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Kişi için profil fotoğrafı yükler
   * @param id - Kişi ID'si
   * @param file - Yüklenecek profil fotoğrafı
   */
  uploadProfilePhoto: async (
    id: string | number,
    file: File
  ): Promise<ApiResponse<IPerson>> => {
    const formData = new FormData();
    formData.append('profile_photo', file);
    
    const response = await api.post<PersonDto>(
      `/api/v1/people/${id}/profile-photo`,
      formData
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapPersonDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
}; 