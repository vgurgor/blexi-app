import { api } from './base';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { ICompany } from '../../types/models';

// API veri yanıt yapısı
interface ApiDataResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// API'den firma yanıtı
export interface FirmResponse {
  data: FirmDto;
  message?: string;
}

// API'de tanımlanan Firm modeli
export interface FirmDto {
  id: number;
  tenant_id: number;
  name: string;
  tax_number: string;
  tax_office: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  aparts_count: number;
  aparts?: {
    id: number;
    firm_id: number;
    name: string;
    address: string;
    gender_type: string;
    opening_date: string;
    status: string;
    created_at: string;
    updated_at: string;
  }[];
}

// API isteklerinde kullanılacak filtreler
export interface FirmFilters {
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  per_page?: number;
}

// Yeni firma oluşturma isteği için model (API dokümanına göre)
export interface CreateFirmRequest {
  name: string;
  tax_number: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_office?: string;
  status: 'active' | 'inactive';
}

// Firma güncelleme isteği için model (API dokümanına göre)
export interface UpdateFirmRequest {
  name: string;
  tax_number: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_office?: string;
  status: 'active' | 'inactive';
}

/**
 * API DTO'yu iç modele dönüştür
 */
function mapDtoToModel(dto: FirmDto): ICompany {
  return {
    id: dto.id.toString(),
    name: dto.name,
    address: dto.address || '',
    email: dto.email || '',
    phone: dto.phone || '',
    taxNumber: dto.tax_number,
    taxOffice: dto.tax_office || '',
    status: dto.status,
    createdAt: dto.created_at || '',
    updatedAt: dto.updated_at || '',
    aparts_count: dto.aparts?.length || 0,
    aparts: dto.aparts || [],
  };
}

/**
 * İç modeli API DTO'ya dönüştür
 */
function mapModelToDto(model: Partial<ICompany> | any): Partial<CreateFirmRequest | UpdateFirmRequest> {
  // Model ICompany tipindeyse taxNumber ve taxOffice kullan
  if (model.taxNumber !== undefined || model.taxOffice !== undefined) {
    return {
      name: model.name,
      tax_number: model.taxNumber,
      address: model.address,
      phone: model.phone,
      email: model.email,
      tax_office: model.taxOffice,
      status: model.status as 'active' | 'inactive',
    };
  }
  
  // Model doğrudan form verisi ise (tax_number ve tax_office içeriyorsa)
  if (model.tax_number !== undefined || model.tax_office !== undefined) {
    return {
      name: model.name,
      tax_number: model.tax_number,
      address: model.address,
      phone: model.phone,
      email: model.email,
      tax_office: model.tax_office,
      status: model.status as 'active' | 'inactive',
    };
  }
  
  // Varsayılan dönüşüm
  return {
    name: model.name,
    tax_number: '',
    address: model.address,
    phone: model.phone,
    email: model.email,
    tax_office: '',
    status: model.status as 'active' | 'inactive',
  };
}

export const firmsApi = {
  /**
   * Tüm firmaları opsiyonel filtrelerle getir
   */
  getAll: async (filters?: FirmFilters): Promise<ApiResponse<ICompany[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    try {
      // API yanıt yapısı doğrudan { data, links, meta } şeklinde
      const response = await api.get(`/api/v1/firms?${params.toString()}`);
      
      console.log('API firma yanıtı:', response);
      
      if (response && response.data) {
        // API doğrudan data dizisini dönüyor
        const modelData: ICompany[] = response.data.map(mapDtoToModel);
        
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
      console.error('Firma verilerini alma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Firma verileri alınırken bir hata oluştu',
        data: [],
      };
    }
  },

  /**
   * ID'ye göre firma getir
   */
  getById: async (id: string | number): Promise<ApiResponse<ICompany>> => {
    try {
      const response = await api.get(`/api/v1/firms/${id}`);
      
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
        error: 'Firma bulunamadı',
      };
    } catch (error) {
      console.error('Firma verilerini alma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Firma verisi alınırken bir hata oluştu',
      };
    }
  },

  /**
   * Yeni bir firma oluştur
   */
  create: async (data: Partial<ICompany>): Promise<ApiResponse<ICompany>> => {
    const dto = mapModelToDto(data) as CreateFirmRequest;
    
    try {
      const response = await api.post('/api/v1/firms', dto);
      
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
        error: 'Firma oluşturulamadı',
      };
    } catch (error) {
      console.error('Firma oluşturma hatası:', error);
      return {
        success: false,
        status: 500,
        error: 'Firma oluşturulurken bir hata oluştu',
      };
    }
  },

  /**
   * Updates an existing company
   * @param id The ID of the company to update
   * @param data The updated company data
   * @returns ApiResponse<ICompany>
   */
  update: async <T extends FormData | ICompany>(
    id: string | number,
    data: T
  ): Promise<ApiResponse<ICompany>> => {
    try {
      // ID kontrolü
      if (!id || id === "" || id === "undefined") {
        console.error("Güncelleme için geçersiz ID:", id);
        return {
          success: false,
          status: 400,
          error: "Geçersiz firma ID'si"
        };
      }
      
      console.log(`ID ${id} ile firma güncelleniyor. Veriler:`, data);
      
      // Form verileri doğrulaması
      const updateData = mapModelToDto(data);
      
      // Gerekli alanların kontrolü
      if (!updateData.tax_number || updateData.tax_number.trim() === "") {
        return {
          success: false,
          status: 400,
          error: "Vergi numarası boş olamaz"
        };
      }
      
      // API isteği
      const response = await api.put<FirmResponse>(`/api/v1/firms/${id}`, updateData);
      
      if (response.status === 200 && response.data) {
        console.log("Firma başarıyla güncellendi:", response.data);
        
        // API yanıtı kontrolü
        if (response.data.data) {
          return {
            success: true,
            status: 200,
            data: mapDtoToModel(response.data.data)
          };
        } else {
          // API yanıtında data yoksa, güncellenmiş veriyi oluştur
          console.log("API yanıtında data alanı bulunamadı, güncellenmiş veriyi manuel oluşturuyorum");
          
          // ID'yi string'e çevir
          const stringId = id.toString();
          
          // Basit bir ICompany nesnesi oluştur (minimum bilgilerle)
          const updatedCompany: ICompany = {
            id: stringId,
            name: updateData.name || "",
            taxNumber: updateData.tax_number || "",
            taxOffice: updateData.tax_office || "",
            address: updateData.address || "",
            phone: updateData.phone || "",
            email: updateData.email || "",
            status: updateData.status || "active",
            createdAt: "",
            updatedAt: new Date().toISOString(),
            aparts_count: 0,
            aparts: []
          };
          
          return {
            success: true,
            status: 200,
            data: updatedCompany
          };
        }
      }
      
      console.error("Firma güncellenirken API hatası:", response.data);
      return {
        success: false,
        status: response.status || 400,
        error: response.data?.message || "Bilinmeyen bir hata oluştu"
      };
    } catch (error: any) {
      console.error("Firma güncellenirken hata:", error);
      return {
        success: false,
        status: 500,
        error: error.message || "Firma güncellenirken bir hata oluştu"
      };
    }
  },

  /**
   * Bir firmayı sil
   */
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/firms/${id}`);
  },
};