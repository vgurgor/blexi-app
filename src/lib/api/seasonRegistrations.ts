import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { ISeasonRegistration } from '../../types/models';

// API'den gelen sezon kaydı veri modeli
export interface SeasonRegistrationDto {
  id: number;
  tenant_id: number;
  guest_id: number;
  apart_id: number;
  season_code: string;
  check_in_date: string;
  check_out_date: string;
  status: 'active' | 'cancelled' | 'completed';
  notes?: string;
  deposit_amount?: number;
  created_at: string;
  updated_at: string;
  guest?: {
    id: number;
    person_id: number;
    guest_type: string;
    profession_department?: string;
  };
  apart?: {
    id: number;
    name: string;
    address?: string;
    gender_type: string;
  };
  season?: {
    id: number;
    name: string;
    code: string;
    status: 'active' | 'inactive';
  };
}

// Sezon kaydı oluşturma isteği modeli
export interface CreateSeasonRegistrationRequest {
  guest_id: number;
  apart_id: number;
  season_code: string;
  check_in_date: string;
  check_out_date: string;
  notes?: string;
  deposit_amount?: number;
}

// Sezon kaydı güncelleme isteği modeli
export interface UpdateSeasonRegistrationRequest {
  guest_id?: number;
  apart_id?: number;
  season_code?: string;
  check_in_date?: string;
  check_out_date?: string;
  notes?: string;
  deposit_amount?: number;
}

// Sezon kaydı durum güncelleme isteği modeli
export interface UpdateSeasonRegistrationStatusRequest {
  status: 'active' | 'cancelled' | 'completed';
}

// API'den gelen SeasonRegistrationDto'yu ISeasonRegistration modeline dönüştüren yardımcı fonksiyon
const mapSeasonRegistrationDtoToModel = (dto: SeasonRegistrationDto): ISeasonRegistration => {
  return {
    id: dto.id.toString(),
    tenantId: dto.tenant_id.toString(),
    guestId: dto.guest_id.toString(),
    apartId: dto.apart_id.toString(),
    seasonCode: dto.season_code,
    checkInDate: dto.check_in_date,
    checkOutDate: dto.check_out_date,
    status: dto.status,
    notes: dto.notes,
    depositAmount: dto.deposit_amount,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    guest: dto.guest ? {
      id: dto.guest.id.toString(),
      personId: dto.guest.person_id.toString(),
      guestType: dto.guest.guest_type,
      professionDepartment: dto.guest.profession_department
    } : undefined,
    apart: dto.apart ? {
      id: dto.apart.id.toString(),
      name: dto.apart.name,
      address: dto.apart.address,
      genderType: dto.apart.gender_type
    } : undefined,
    season: dto.season ? {
      id: dto.season.id.toString(),
      name: dto.season.name,
      code: dto.season.code,
      status: dto.season.status
    } : undefined
  };
};

/**
 * Sezon Kayıtları API servisi
 */
export const seasonRegistrationsApi = {
  /**
   * Tüm sezon kayıtlarını listeler, filtreleme opsiyonları ile
   * @param guestId - Misafir ID filtresi (isteğe bağlı)
   * @param apartId - Apart ID filtresi (isteğe bağlı)
   * @param seasonCode - Sezon kodu filtresi (isteğe bağlı)
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getAll: async (
    guestId?: string | number,
    apartId?: string | number,
    seasonCode?: string,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ISeasonRegistration>> => {
    const params = new URLSearchParams();
    
    if (guestId) {
      params.append('guest_id', guestId.toString());
    }
    
    if (apartId) {
      params.append('apart_id', apartId.toString());
    }
    
    if (seasonCode) {
      params.append('season_code', seasonCode);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/season-registrations?${params.toString()}`;
    const response = await api.get<SeasonRegistrationDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapSeasonRegistrationDtoToModel),
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
   * Yeni bir sezon kaydı oluşturur
   * @param request - Sezon kaydı oluşturma isteği
   */
  create: async (request: CreateSeasonRegistrationRequest): Promise<ApiResponse<ISeasonRegistration>> => {
    const response = await api.post<SeasonRegistrationDto>('/api/v1/season-registrations', request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre sezon kaydı detaylarını getirir
   * @param id - Sezon kaydı ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<ISeasonRegistration>> => {
    const response = await api.get<SeasonRegistrationDto>(`/api/v1/season-registrations/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Var olan bir sezon kaydını günceller
   * @param id - Güncellenecek sezon kaydının ID'si
   * @param request - Sezon kaydı güncelleme isteği
   */
  update: async (
    id: string | number,
    request: UpdateSeasonRegistrationRequest
  ): Promise<ApiResponse<ISeasonRegistration>> => {
    const response = await api.put<SeasonRegistrationDto>(`/api/v1/season-registrations/${id}`, request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Sezon kaydını siler
   * @param id - Silinecek sezon kaydının ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete(`/api/v1/season-registrations/${id}`);
  },
  
  /**
   * Sezon kaydının durumunu günceller
   * @param id - Güncellenecek sezon kaydının ID'si
   * @param status - Yeni durum değeri
   */
  updateStatus: async (
    id: string | number,
    status: 'active' | 'cancelled' | 'completed'
  ): Promise<ApiResponse<ISeasonRegistration>> => {
    const request: UpdateSeasonRegistrationStatusRequest = { status };
    const response = await api.patch<SeasonRegistrationDto>(`/api/v1/season-registrations/${id}/status`, request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Belirli bir misafire ait sezon kayıtlarını listeler
   * @param guestId - Misafir ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getByGuestId: async (
    guestId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ISeasonRegistration>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/guests/${guestId}/season-registrations?${params.toString()}`;
    const response = await api.get<SeasonRegistrationDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapSeasonRegistrationDtoToModel),
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
   * Belirli bir aparta ait sezon kayıtlarını listeler
   * @param apartId - Apart ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getByApartId: async (
    apartId: string | number,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ISeasonRegistration>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/aparts/${apartId}/season-registrations?${params.toString()}`;
    const response = await api.get<SeasonRegistrationDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapSeasonRegistrationDtoToModel),
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
   * Belirli bir sezona ait kayıtları listeler
   * @param seasonCode - Sezon kodu
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getBySeasonCode: async (
    seasonCode: string,
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<ISeasonRegistration>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/seasons/${seasonCode}/registrations?${params.toString()}`;
    const response = await api.get<SeasonRegistrationDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapSeasonRegistrationDtoToModel),
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
   * Sezon kaydını tamamlar (complete)
   * @param id - Tamamlanacak sezon kaydının ID'si
   * @param notes - İşleme ait isteğe bağlı notlar
   */
  complete: async (
    id: string | number,
    notes?: string
  ): Promise<ApiResponse<ISeasonRegistration>> => {
    const data = notes ? { notes } : {};
    const response = await api.post<SeasonRegistrationDto>(`/api/v1/season-registrations/${id}/complete`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Tek seferde tam bir sezon kaydı oluşturur (ürünler, ödeme planları, fatura bilgileri ve indirimler dahil)
   * @param data - Tam sezon kaydı oluşturma verisi
   */
  createComplete: async (data: {
    guest_id: number;
    apart_id: number;
    season_code: string;
    check_in_date: string;
    check_out_date: string;
    deposit_amount?: number;
    notes?: string;
    products: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
    }>;
    payment_plans: Array<{
      planned_amount: number;
      planned_date: string;
      planned_payment_type_id: number;
      is_deposit?: boolean;
    }>;
    invoice_titles: Array<{
      title_type: 'individual' | 'corporate';
      first_name?: string;
      last_name?: string;
      identity_number?: string;
      company_name?: string;
      tax_office?: string;
      tax_number?: string;
      address?: string;
      phone: string;
      email?: string;
      is_default?: boolean;
      address_data?: {
        country_id: number;
        province_id: number;
        district_id: number;
        neighborhood?: string;
        street?: string;
        building_no?: string;
        apartment_no?: string;
        postal_code?: string;
      };
    }>;
    discounts?: Array<{
      discount_rule_id: number;
      product_id: number;
    }>;
  }): Promise<ApiResponse<ISeasonRegistration>> => {
    const response = await api.post<SeasonRegistrationDto>('/api/v1/season-registrations/complete', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapSeasonRegistrationDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  }
}; 