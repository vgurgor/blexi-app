import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { IExchangeRate, ICurrency } from '../../types/models';

// API'de tanımlanan Exchange Rate modeli
export interface ExchangeRateDto {
  id: number;
  base_currency: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
  target_currency: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
  rate: number;
  effective_date: string;
  source: 'manual' | 'api' | 'system';
  created_at?: string;
  updated_at?: string;
}

// Exchange Rate oluşturma isteği için model
export interface CreateExchangeRateRequest {
  base_currency_id: number;
  target_currency_id: number;
  rate: number;
  effective_date: string;
}

// Exchange Rate güncelleme isteği için model
export interface UpdateExchangeRateRequest {
  rate: number;
  effective_date?: string;
}

// Para birimi dönüştürme isteği için model
export interface ConvertAmountRequest {
  amount: number;
  from_currency_id: number;
  to_currency_id: number;
  date?: string;
}

// Para birimi dönüştürme yanıtı için model
export interface ConvertAmountResponse {
  amount: number;
  converted_amount: number;
  from_currency: {
    id: number;
    code: string;
    symbol: string;
  };
  to_currency: {
    id: number;
    code: string;
    symbol: string;
  };
  exchange_rate: number;
  date: string;
}

// API'den kurları güncelleme yanıtı için model
export interface UpdateRatesFromApiResponse {
  success: boolean;
  updated_count: number;
  message: string;
}

// ExchangeRateDto'yu IExchangeRate modeline dönüştüren yardımcı fonksiyon
const mapExchangeRateDtoToModel = (dto: ExchangeRateDto): IExchangeRate => {
  return {
    id: dto.id.toString(),
    baseCurrency: {
      id: dto.base_currency.id.toString(),
      code: dto.base_currency.code,
      name: dto.base_currency.name,
      symbol: dto.base_currency.symbol,
    },
    targetCurrency: {
      id: dto.target_currency.id.toString(),
      code: dto.target_currency.code,
      name: dto.target_currency.name,
      symbol: dto.target_currency.symbol,
    },
    rate: dto.rate,
    effectiveDate: dto.effective_date,
    source: dto.source,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
  };
};

/**
 * Exchange Rates API servisi
 */
export const exchangeRatesApi = {
  /**
   * Tüm döviz kurlarını listeler
   * @param page - Sayfa numarası
   * @param perPage - Sayfa başına öğe sayısı
   */
  getAll: async (
    page: number = 1,
    perPage: number = 15
  ): Promise<PaginatedResponse<IExchangeRate>> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/api/v1/exchange-rates?${params.toString()}`;
    const response = await api.get<ExchangeRateDto[]>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapExchangeRateDtoToModel),
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
   * En güncel döviz kurlarını getirir
   */
  getLatest: async (): Promise<ApiResponse<IExchangeRate[]>> => {
    const response = await api.get<ExchangeRateDto[]>('/api/v1/exchange-rates/latest');
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapExchangeRateDtoToModel),
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
  
  /**
   * Yeni bir döviz kuru oluşturur
   * @param data - Döviz kuru oluşturma verileri
   */
  create: async (data: CreateExchangeRateRequest): Promise<ApiResponse<IExchangeRate>> => {
    const response = await api.post<ExchangeRateDto>('/api/v1/exchange-rates', data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapExchangeRateDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * ID'ye göre döviz kuru detaylarını getirir
   * @param id - Döviz kuru ID'si
   */
  getById: async (id: string | number): Promise<ApiResponse<IExchangeRate>> => {
    const response = await api.get<ExchangeRateDto>(`/api/v1/exchange-rates/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapExchangeRateDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Mevcut bir döviz kurunu günceller
   * @param id - Güncellenecek döviz kuru ID'si
   * @param data - Güncelleme verileri
   */
  update: async (
    id: string | number,
    data: UpdateExchangeRateRequest
  ): Promise<ApiResponse<IExchangeRate>> => {
    const response = await api.put<ExchangeRateDto>(`/api/v1/exchange-rates/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapExchangeRateDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Döviz kuru siler
   * @param id - Silinecek döviz kuru ID'si
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return await api.delete<void>(`/api/v1/exchange-rates/${id}`);
  },
  
  /**
   * Belirli bir para birimi çifti için kur getirir
   * @param baseCurrencyId - Baz para birimi ID'si
   * @param targetCurrencyId - Hedef para birimi ID'si
   * @param date - İsteğe bağlı tarih (YYYY-MM-DD)
   */
  getForPair: async (
    baseCurrencyId: string | number,
    targetCurrencyId: string | number,
    date?: string
  ): Promise<ApiResponse<IExchangeRate>> => {
    const params = new URLSearchParams();
    
    params.append('base_currency_id', baseCurrencyId.toString());
    params.append('target_currency_id', targetCurrencyId.toString());
    
    if (date) {
      params.append('date', date);
    }
    
    const url = `/api/v1/exchange-rates/pair?${params.toString()}`;
    const response = await api.get<ExchangeRateDto>(url);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapExchangeRateDtoToModel(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },
  
  /**
   * Para birimi dönüştürme
   * @param data - Dönüştürme parametreleri
   */
  convertAmount: async (
    data: ConvertAmountRequest
  ): Promise<ApiResponse<ConvertAmountResponse>> => {
    return await api.post<ConvertAmountResponse>('/api/v1/exchange-rates/convert', data);
  },
  
  /**
   * Döviz kurlarını API'den günceller
   * @param apiKey - İsteğe bağlı API anahtarı (TCMB kullanılmıyorsa)
   */
  updateFromApi: async (
    apiKey?: string
  ): Promise<ApiResponse<UpdateRatesFromApiResponse>> => {
    const data = apiKey ? { api_key: apiKey } : {};
    return await api.post<UpdateRatesFromApiResponse>('/api/v1/exchange-rates/update-from-api', data);
  },
}; 