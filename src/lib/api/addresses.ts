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
  country_id: number;
  province_id: number;
  district_id: number;
  address_type: 'home' | 'work' | 'other';
  addressable_type: string;
  addressable_id: number;
  neighborhood?: string;
  street?: string;
  building_no?: string;
  apartment_no?: string;
  postal_code?: string;
  is_default?: boolean;
  status?: 'active' | 'inactive';
}

// Adres güncelleme isteği için model
export interface UpdateAddressRequest {
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
}

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
   * @param params - Filtreleme parametreleri
   */
  getAll: async (params?: {
    country_id?: number;
    province_id?: number;
    district_id?: number;
    address_type?: 'home' | 'work' | 'other';
    status?: 'active' | 'inactive';
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<IAddress>> => {
    const urlParams = new URLSearchParams();
    
    if (params) {
      if (params.country_id) urlParams.append('country_id', params.country_id.toString());
      if (params.province_id) urlParams.append('province_id', params.province_id.toString());
      if (params.district_id) urlParams.append('district_id', params.district_id.toString());
      if (params.address_type) urlParams.append('address_type', params.address_type);
      if (params.status) urlParams.append('status', params.status);
      if (params.page) urlParams.append('page', params.page.toString());
      if (params.per_page) urlParams.append('per_page', params.per_page.toString());
    }
    
    const url = `/api/v1/addresses?${urlParams.toString()}`;
    const response = await api.get<AddressDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAddressDtoToModel),
        page: params?.page || 1,
        limit: params?.per_page || 15,
        total: response.meta?.total || 0,
      };
    }
    
    return {
      ...response,
      data: [],
      page: params?.page || 1,
      limit: params?.per_page || 15,
      total: 0,
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
   * Adres siler
   * @param id - Silinecek adres ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/addresses/${id}`);
  },
  
  /**
   * Belirli bir varlığa ait adresleri listeler
   * @param entityType - Varlık tipi
   * @param entityId - Varlık ID'si
   */
  getByEntity: async (
    entityType: string,
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
   * Adresi belirli bir varlık ve adres tipi için varsayılan olarak ayarlar
   * @param id - Varsayılan yapılacak adres ID'si
   * @param entityType - Varlık tipi
   * @param entityId - Varlık ID'si
   * @param addressType - Adres tipi
   */
  setAsDefault: async (
    id: string | number,
    entityType: string,
    entityId: string | number,
    addressType: 'home' | 'work' | 'other'
  ): Promise<ApiResponse<void>> => {
    return await api.put<void>(
      `/api/v1/addresses/${id}/default/${entityType}/${entityId}/${addressType}`,
      {}
    );
  },
}; 