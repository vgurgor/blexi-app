import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IAddress } from '../../types/models';

// API'de tanımlanan Address modeli
export interface AddressDto {
  id: number;
  district_id: number;
  district?: {
    id: number;
    code: string;
    name: string;
    province_id: number;
  };
  name?: string;
  address_line: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// Adres oluşturma isteği için model
export interface CreateAddressRequest {
  district_id: number;
  name?: string;
  address_line: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  status?: 'active' | 'inactive';
}

// Adres güncelleme isteği için model
export interface UpdateAddressRequest {
  district_id?: number;
  name?: string;
  address_line?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  status?: 'active' | 'inactive';
}

// Adres durumu güncelleme isteği için model
export interface UpdateAddressStatusRequest {
  status: 'active' | 'inactive';
}

// Varlık tipi enum
export type EntityType = 'user' | 'customer' | 'company' | 'supplier' | 'apartment';

// Adres tipi enum
export type AddressType = 'billing' | 'shipping' | 'home' | 'work' | 'other';

// AddressDto'yu IAddress modeline dönüştüren yardımcı fonksiyon
const mapAddressDtoToModel = (dto: AddressDto): IAddress => {
  return {
    id: dto.id.toString(),
    districtId: dto.district_id.toString(),
    district: dto.district ? {
      id: dto.district.id.toString(),
      code: dto.district.code,
      name: dto.district.name,
      provinceId: dto.district.province_id.toString()
    } : undefined,
    name: dto.name,
    addressLine: dto.address_line,
    postalCode: dto.postal_code,
    latitude: dto.latitude,
    longitude: dto.longitude,
    isDefault: dto.is_default,
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Addresses API servisi
 */
export const addressesApi = {
  /**
   * Tüm adresleri listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IAddress>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/addresses?${params.toString()}`;
    const response = await api.get<AddressDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAddressDtoToModel),
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
   * Aktif tüm adresleri listeler
   */
  getActive: async (): Promise<ApiResponse<IAddress[]>> => {
    const response = await api.get<AddressDto[]>('/api/v1/addresses/active');
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAddressDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Belirli bir ilçeye ait adresleri listeler
   * @param districtId - İlçe ID'si
   */
  getByDistrict: async (districtId: string | number): Promise<ApiResponse<IAddress[]>> => {
    const response = await api.get<AddressDto[]>(`/api/v1/addresses/district/${districtId}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAddressDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Belirli bir varlığa ait adresleri listeler
   * @param entityType - Varlık tipi
   * @param entityId - Varlık ID'si
   */
  getByEntity: async (
    entityType: EntityType,
    entityId: string | number
  ): Promise<ApiResponse<IAddress[]>> => {
    const response = await api.get<AddressDto[]>(`/api/v1/addresses/entity/${entityType}/${entityId}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAddressDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Belirli bir varlığa ait belirli tip adresleri listeler
   * @param entityType - Varlık tipi
   * @param entityId - Varlık ID'si
   * @param addressType - Adres tipi
   */
  getByEntityAndType: async (
    entityType: EntityType,
    entityId: string | number,
    addressType: AddressType
  ): Promise<ApiResponse<IAddress[]>> => {
    const response = await api.get<AddressDto[]>(`/api/v1/addresses/entity/${entityType}/${entityId}/type/${addressType}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAddressDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Yeni bir adres oluşturur
   * @param data - Adres oluşturma verileri
   */
  create: async (data: CreateAddressRequest): Promise<ApiResponse<IAddress>> => {
    const response = await api.post<AddressDto>('/api/v1/addresses', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAddressDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Bir varlık için adres oluşturur
   * @param entityType - Varlık tipi
   * @param entityId - Varlık ID'si
   * @param addressType - Adres tipi
   * @param data - Adres oluşturma verileri
   */
  createForEntity: async (
    entityType: EntityType,
    entityId: string | number,
    addressType: AddressType,
    data: CreateAddressRequest
  ): Promise<ApiResponse<IAddress>> => {
    const response = await api.post<AddressDto>(
      `/api/v1/addresses/entity/${entityType}/${entityId}/type/${addressType}`,
      data
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAddressDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre adres detaylarını getirir
   * @param id - Adres ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IAddress>> => {
    const response = await api.get<AddressDto>(`/api/v1/addresses/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAddressDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir adresi günceller
   * @param id - Güncellenecek adres ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateAddressRequest
  ): Promise<ApiResponse<IAddress>> => {
    const response = await api.put<AddressDto>(`/api/v1/addresses/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAddressDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Adresi varsayılan olarak ayarlar
   * @param id - Varsayılan yapılacak adres ID'si
   */
  setAsDefault: async (id: string | number): Promise<ApiResponse<IAddress>> => {
    const response = await api.post<AddressDto>(`/api/v1/addresses/${id}/default`, {});
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAddressDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Adresi belirli bir varlık ve adres tipi için varsayılan olarak ayarlar
   * @param id - Varsayılan yapılacak adres ID'si
   * @param entityType - Varlık tipi
   * @param entityId - Varlık ID'si
   * @param addressType - Adres tipi
   */
  setAsDefaultForEntityAndType: async (
    id: string | number,
    entityType: EntityType,
    entityId: string | number,
    addressType: AddressType
  ): Promise<ApiResponse<IAddress>> => {
    const response = await api.post<AddressDto>(
      `/api/v1/addresses/${id}/default/${entityType}/${entityId}/${addressType}`,
      {}
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAddressDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Adres durumunu günceller
   * @param id - Güncellenecek adres ID'si
   * @param status - Yeni durum
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<IAddress>> => {
    const data: UpdateAddressStatusRequest = { status };
    const response = await api.patch<AddressDto>(`/api/v1/addresses/${id}/status`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAddressDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Adres siler
   * @param id - Silinecek adres ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/addresses/${id}`);
  },
}; 