import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IUser } from '../../types/models';

// API'de tanımlanan User modeli
export interface UserDto {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'super-admin' | 'admin' | 'manager' | 'user';
  tenant_id: number;
  tenant?: {
    id: number;
    name: string;
    slug: string;
  };
  person_id?: number;
  person?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  permissions?: string[];
  last_login?: string;
  email_verified_at?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

// API isteklerinde kullanılacak filtreler
export interface UserFilters {
  role?: 'super-admin' | 'admin' | 'manager' | 'user';
  search?: string;
  page?: number;
  per_page?: number;
}

// Yeni kullanıcı oluşturma isteği için model
export interface CreateUserRequest {
  username: string;
  email: string;
  name: string;
  password: string;
  password_confirmation: string;
  role: 'super-admin' | 'admin' | 'manager' | 'user';
}

// Kullanıcı güncelleme isteği için model
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  name?: string;
  password?: string;
  password_confirmation?: string;
  role?: 'super-admin' | 'admin' | 'manager' | 'user';
}

/**
 * API DTO'yu iç modele dönüştür
 */
function mapDtoToModel(dto: UserDto): IUser {
  return {
    id: dto.id.toString(),
    username: dto.username,
    email: dto.email,
    name: dto.name,
    role: dto.role,
    tenant_id: dto.tenant_id.toString(),
    tenant: dto.tenant ? {
      id: dto.tenant.id.toString(),
      name: dto.tenant.name,
      slug: dto.tenant.slug
    } : undefined,
    person_id: dto.person_id?.toString(),
    person: dto.person ? {
      id: dto.person.id.toString(),
      name: dto.person.name,
      email: dto.person.email,
      phone: dto.person.phone
    } : undefined,
    permissions: dto.permissions || [],
    last_login: dto.last_login || '',
    email_verified_at: dto.email_verified_at || '',
    avatar: dto.avatar || '',
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || ''
  };
}

/**
 * İç modeli API DTO'ya dönüştür
 */
function mapModelToDto(model: Partial<IUser>): Partial<CreateUserRequest | UpdateUserRequest> {
  const dto: Partial<CreateUserRequest | UpdateUserRequest> = {};
  
  if (model.username !== undefined) dto.username = model.username;
  if (model.email !== undefined) dto.email = model.email;
  if (model.name !== undefined) dto.name = model.name;
  if (model.role !== undefined) dto.role = model.role;
  
  return dto;
}

export const usersApi = {
  /**
   * Tüm kullanıcıları opsiyonel filtrelerle getir
   */
  getAll: async (filters?: UserFilters): Promise<ApiResponse<IUser[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    try {
      const response = await api.get(`/api/v1/users?${params.toString()}`);
      
      if (response && response.data) {
        // API may return user data in different formats depending on the endpoint
        const userData = Array.isArray(response.data) ? response.data : response.data;
        const modelData: IUser[] = userData.map(mapDtoToModel);
        
        return {
          success: true,
          status: 200,
          data: modelData,
          meta: response.meta
        };
      }
      
      return {
        success: false,
        status: 404,
        error: 'Veri bulunamadı',
        data: [],
      };
    } catch (error) {
      console.error('Kullanıcı verilerini alma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Kullanıcı verileri alınırken bir hata oluştu',
        data: [],
      };
    }
  },

  /**
   * ID'ye göre kullanıcı getir
   */
  getById: async (id: string | number): Promise<ApiResponse<IUser>> => {
    try {
      const response = await api.get(`/api/v1/users/${id}`);
      
      if (response && response.data) {
        return {
          success: true,
          status: 200,
          data: mapDtoToModel(response.data),
        };
      }
      
      return {
        success: false,
        status: 404,
        error: 'Kullanıcı bulunamadı',
      };
    } catch (error) {
      console.error('Kullanıcı verilerini alma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Kullanıcı verisi alınırken bir hata oluştu',
      };
    }
  },

  /**
   * Yeni bir kullanıcı oluştur
   */
  create: async (data: Partial<IUser> & { password: string, password_confirmation: string }): Promise<ApiResponse<IUser>> => {
    const dto = {
      ...mapModelToDto(data),
      password: data.password,
      password_confirmation: data.password_confirmation
    } as CreateUserRequest;
    
    try {
      const response = await api.post('/api/v1/users', dto);
      
      if (response && response.data) {
        return {
          success: true,
          status: 201,
          data: mapDtoToModel(response.data),
        };
      }
      
      return {
        success: false,
        status: 400,
        error: 'Kullanıcı oluşturulamadı',
      };
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Kullanıcı oluşturulurken bir hata oluştu',
      };
    }
  },

  /**
   * Mevcut bir kullanıcıyı güncelle
   */
  update: async (id: string | number, data: Partial<IUser> & { password?: string, password_confirmation?: string }): Promise<ApiResponse<IUser>> => {
    const dto = {
      ...mapModelToDto(data),
      password: data.password,
      password_confirmation: data.password_confirmation
    } as UpdateUserRequest;
    
    try {
      const response = await api.put(`/api/v1/users/${id}`, dto);
      
      if (response && response.data) {
        return {
          success: true,
          status: 200,
          data: mapDtoToModel(response.data),
        };
      }
      
      return {
        success: false,
        status: 400,
        error: 'Kullanıcı güncellenemedi',
      };
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Kullanıcı güncellenirken bir hata oluştu',
      };
    }
  },

  /**
   * Bir kullanıcıyı sil
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/users/${id}`);
  },
};