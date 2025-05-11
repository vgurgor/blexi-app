import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IUser } from '../../types/models';

// API'de tanımlanan User modeli
export interface UserDto {
  id: number;
  username: string;
  email: string;
  tenant_id: number;
  tenant?: {
    id: number;
    name: string;
    domain: string;
    settings?: {
      theme: string;
      language: string;
    };
    status: string;
  };
  person_id?: number;
  person?: {
    id: number;
    tenant_id: number;
    name: string;
    surname: string;
    gender?: string;
    tc_no?: string;
    phone?: string;
    email?: string;
    birth_date?: string;
    address?: string;
    city?: string;
    profile_photo_path?: string;
    profile_photo_url?: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  role: string;
  permissions?: string[];
  last_login?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Kullanıcı rol değiştirme isteği için model
export interface UpdateUserRoleRequest {
  role: string;
}

// UserDto'yu IUser modeline dönüştüren yardımcı fonksiyon
const mapUserDtoToModel = (dto: UserDto): IUser => {
  return {
    id: dto.id.toString(),
    username: dto.username,
    email: dto.email,
    name: dto.person?.name || '',
    surname: dto.person?.surname || '',
    gender: dto.person?.gender || '',
    role: dto.role as 'super-admin' | 'admin' | 'manager' | 'user',
    tenant_id: dto.tenant_id.toString(),
    tenant: dto.tenant ? {
      id: dto.tenant.id.toString(),
      name: dto.tenant.name,
      slug: dto.tenant.domain,
    } : undefined,
    person_id: dto.person_id?.toString(),
    person: dto.person ? {
      id: dto.person.id.toString(),
      name: dto.person.name,
      surname: dto.person.surname,
      gender: dto.person.gender,
      email: dto.person.email,
      phone: dto.person.phone,
    } : undefined,
    permissions: dto.permissions,
    last_login: dto.last_login,
    email_verified_at: dto.email_verified_at,
    avatar: dto.person?.profile_photo_url,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

// Create user request interface
export interface CreateUserRequest {
  username: string;
  email: string;
  name: string;
  password: string;
  password_confirmation: string;
  role: 'super-admin' | 'admin' | 'manager' | 'user';
}

/**
 * Kullanıcılar API servisi
 */
export const usersApi = {
  /**
   * Yeni kullanıcı oluşturur
   * @param userData - Kullanıcı bilgileri
   */
  create: async (userData: CreateUserRequest): Promise<ApiResponse<IUser>> => {
    const response = await api.post<UserDto>('/api/v1/users', userData);

    if (response.success && response.data) {
      return {
        ...response,
        data: mapUserDtoToModel(response.data),
      };
    }

    return {
      ...response,
      data: undefined,
    };
  },

  /**
   * Tüm kullanıcıları listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IUser>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/users?${params.toString()}`;
    const response = await api.get<UserDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapUserDtoToModel),
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
   * ID'ye göre kullanıcı detaylarını getirir
   * @param id - Kullanıcı ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IUser>> => {
    const response = await api.get<UserDto>(`/api/v1/users/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapUserDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Kullanıcı siler (Sadece Admin)
   * @param id - Silinecek kullanıcı ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/users/${id}`);
  },
  
  /**
   * Kullanıcıya rol atar (Sadece Admin)
   * @param id - Rolü atanacak kullanıcı ID'si
   * @param role - Yeni rol
   */
  assignRole: async (
    id: string | number,
    role: string
  ): Promise<ApiResponse<IUser>> => {
    const response = await api.put<UserDto>(
      `/api/v1/users/${id}/roles`,
      { role }
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapUserDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
};