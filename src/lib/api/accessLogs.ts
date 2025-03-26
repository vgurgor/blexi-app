import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IAccessLog, IAccessMetrics } from '../../types/models';

// API'den gelen erişim kaydı veri modeli
export interface AccessLogDto {
  id: number;
  action_type: 'CHECK_IN' | 'CHECK_OUT';
  location?: string;
  timestamp: string;
  notes?: string;
  person: {
    id: number;
    name: string;
    tc_no: string;
    phone: string;
    email?: string;
  };
  guest?: {
    id: number;
    guest_type: string;
    status: string;
  };
  created_by?: {
    id: number;
    name: string;
  };
  created_at: string;
}

// Check-in/Check-out isteği modeli
export interface AccessLogRequest {
  location?: string;
  notes?: string;
  timestamp?: string;
}

// API'den gelen erişim metrikleri veri modeli
export interface AccessMetricsDto {
  total_visits: number;
  visits_by_date: {
    check_ins: Record<string, number>;
    check_outs: Record<string, number>;
  };
  average_duration_minutes: number;
  peak_hours: Record<string, number>;
  most_active_guests?: Array<{
    id: number;
    name: string;
    visit_count: number;
  }>;
}

// API'den gelen AccessLogDto'yu IAccessLog modeline dönüştüren yardımcı fonksiyon
const mapAccessLogDtoToModel = (dto: AccessLogDto): IAccessLog => {
  return {
    id: dto.id.toString(),
    actionType: dto.action_type,
    location: dto.location,
    timestamp: dto.timestamp,
    notes: dto.notes,
    person: {
      id: dto.person.id.toString(),
      name: dto.person.name,
      tcNo: dto.person.tc_no,
      phone: dto.person.phone,
      email: dto.person.email
    },
    guest: dto.guest ? {
      id: dto.guest.id.toString(),
      guestType: dto.guest.guest_type,
      status: dto.guest.status
    } : undefined,
    createdBy: dto.created_by ? {
      id: dto.created_by.id.toString(),
      name: dto.created_by.name
    } : undefined,
    createdAt: dto.created_at
  };
};

// API'den gelen AccessMetricsDto'yu IAccessMetrics modeline dönüştüren yardımcı fonksiyon
const mapAccessMetricsDtoToModel = (dto: AccessMetricsDto): IAccessMetrics => {
  return {
    totalVisits: dto.total_visits,
    visitsByDate: {
      checkIns: dto.visits_by_date.check_ins,
      checkOuts: dto.visits_by_date.check_outs
    },
    averageDurationMinutes: dto.average_duration_minutes,
    peakHours: dto.peak_hours,
    mostActiveGuests: dto.most_active_guests?.map(guest => ({
      id: guest.id.toString(),
      name: guest.name,
      visitCount: guest.visit_count
    }))
  };
};

/**
 * Erişim Kayıtları API servisi
 */
export const accessLogsApi = {
  /**
   * Tüm erişim kayıtlarını listeler, filtreleme opsiyonları ile
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   * @param startDate - Başlangıç tarihi (Y-m-d formatında)
   * @param endDate - Bitiş tarihi (Y-m-d formatında)
   * @param actionType - İşlem türü filtresi (CHECK_IN veya CHECK_OUT)
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15,
    startDate?: string,
    endDate?: string,
    actionType?: 'CHECK_IN' | 'CHECK_OUT'
  ): Promise<PaginatedResponse<IAccessLog>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    if (startDate) {
      params.append('start_date', startDate);
    }
    
    if (endDate) {
      params.append('end_date', endDate);
    }
    
    if (actionType) {
      params.append('action_type', actionType);
    }
    
    const url = `/api/v1/access-logs?${params.toString()}`;
    const response = await api.get<AccessLogDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAccessLogDtoToModel),
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
   * Belirli bir misafirin erişim kayıtlarını listeler
   * @param guestId - Misafir ID'si
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   * @param startDate - Başlangıç tarihi (Y-m-d formatında)
   * @param endDate - Bitiş tarihi (Y-m-d formatında)
   */
  getByGuestId: async (
    guestId: string | number,
    page: number = 1,
    perPage: number = 15,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedResponse<IAccessLog>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    if (startDate) {
      params.append('start_date', startDate);
    }
    
    if (endDate) {
      params.append('end_date', endDate);
    }
    
    const url = `/api/v1/guests/${guestId}/access-logs?${params.toString()}`;
    const response = await api.get<AccessLogDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAccessLogDtoToModel),
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
   * Misafir için check-in kaydı oluşturur
   * @param guestId - Misafir ID'si
   * @param request - Check-in isteği
   */
  recordCheckIn: async (
    guestId: string | number,
    request: AccessLogRequest = {}
  ): Promise<ApiResponse<IAccessLog>> => {
    const response = await api.post<AccessLogDto>(`/api/v1/guests/${guestId}/check-in`, request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAccessLogDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Misafir için check-out kaydı oluşturur
   * @param guestId - Misafir ID'si
   * @param request - Check-out isteği
   */
  recordCheckOut: async (
    guestId: string | number,
    request: AccessLogRequest = {}
  ): Promise<ApiResponse<IAccessLog>> => {
    const response = await api.post<AccessLogDto>(`/api/v1/guests/${guestId}/check-out`, request);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAccessLogDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Şu anda check-in yapmış misafirleri listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına kayıt sayısı
   */
  getCurrentlyCheckedIn: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IAccessLog>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/access-logs/currently-checked-in?${params.toString()}`;
    const response = await api.get<AccessLogDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapAccessLogDtoToModel),
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
   * Erişim metriklerini getirir
   * @param period - Metrik periyodu (day, week, month)
   */
  getMetrics: async (period: 'day' | 'week' | 'month' = 'day'): Promise<ApiResponse<IAccessMetrics>> => {
    const params = new URLSearchParams();
    params.append('period', period);
    
    const url = `/api/v1/access-logs/metrics?${params.toString()}`;
    const response = await api.get<AccessMetricsDto>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapAccessMetricsDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  }
}; 