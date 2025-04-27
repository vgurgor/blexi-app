import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IPerson } from '../../types/models';

// API'de tanımlanan Person modeli
export interface PersonDto {
  id: number;
  tenant_id: number;
  name: string;
  surname: string;
  gender?: string;
  tc_no: string;
  phone: string;
  email?: string;
  birth_date: string;
  city?: string;
  profile_photo_path?: string;
  profile_photo_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
  address?: {
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
  };
}

// Kişi oluşturma isteği için model
export interface CreatePersonRequest {
  name: string;
  surname: string;
  gender?: string;
  tc_no: string;
  phone: string;
  email?: string;
  birth_date: string;
  city?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  address?: {
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
  };
}

// Kişi güncelleme isteği için model
export interface UpdatePersonRequest {
  name?: string;
  surname?: string;
  gender?: string;
  tc_no?: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  city?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  address?: {
    country_id?: number;
    province_id?: number;
    district_id?: number;
    neighborhood?: string;
    street?: string;
    building_no?: string;
    apartment_no?: string;
    postal_code?: string;
    address_type?: 'home' | 'work' | 'other';
    is_default?: boolean;
    status?: 'active' | 'inactive';
  };
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
    surname: dto.surname,
    gender: dto.gender,
    tcNo: dto.tc_no,
    phone: dto.phone,
    email: dto.email,
    birthDate: dto.birth_date,
    city: dto.city,
    profilePhotoPath: dto.profile_photo_path,
    profilePhotoUrl: dto.profile_photo_url,
    status: dto.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    address: dto.address ? {
      id: dto.address.id?.toString(),
      countryId: dto.address.country_id.toString(),
      provinceId: dto.address.province_id.toString(),
      districtId: dto.address.district_id.toString(),
      neighborhood: dto.address.neighborhood,
      street: dto.address.street,
      buildingNo: dto.address.building_no,
      apartmentNo: dto.address.apartment_no,
      postalCode: dto.address.postal_code,
      addressType: dto.address.address_type,
      isDefault: dto.address.is_default,
      status: dto.address.status,
      formattedAddress: dto.address.formatted_address,
      country: dto.address.country ? {
        id: dto.address.country.id.toString(),
        code: dto.address.country.code,
        name: dto.address.country.name,
        phoneCode: dto.address.country.phone_code
      } : undefined,
      province: dto.address.province ? {
        id: dto.address.province.id.toString(),
        countryId: dto.address.province.country_id.toString(),
        code: dto.address.province.code,
        name: dto.address.province.name
      } : undefined,
      district: dto.address.district ? {
        id: dto.address.district.id.toString(),
        provinceId: dto.address.district.province_id.toString(),
        name: dto.address.district.name
      } : undefined
    } : undefined
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
   * @param email - Filtreleme için e-posta (isteğe bağlı)
   * @param city - Filtreleme için şehir (isteğe bağlı)
   * @param address - Filtreleme için adres (isteğe bağlı)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    name?: string,
    phone?: string,
    email?: string,
    city?: string,
    address?: string,
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
    
    if (email) {
      params.append('email', email);
    }
    
    if (city) {
      params.append('city', city);
    }
    
    if (address) {
      params.append('address', address);
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
