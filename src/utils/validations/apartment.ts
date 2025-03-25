import { z } from 'zod';

export const apartmentSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'İsim en az 3 karakter olmalıdır' })
    .max(100, { message: 'İsim en fazla 100 karakter olabilir' }),
  
  address: z
    .string()
    .min(5, { message: 'Adres en az 5 karakter olmalıdır' })
    .max(200, { message: 'Adres en fazla 200 karakter olabilir' }),
  
  city: z
    .string()
    .min(2, { message: 'Şehir en az 2 karakter olmalıdır' })
    .max(50, { message: 'Şehir en fazla 50 karakter olabilir' }),
  
  zipCode: z
    .string()
    .min(5, { message: 'Posta kodu en az 5 karakter olmalıdır' })
    .max(10, { message: 'Posta kodu en fazla 10 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  country: z
    .string()
    .min(2, { message: 'Ülke en az 2 karakter olmalıdır' })
    .max(50, { message: 'Ülke en fazla 50 karakter olabilir' })
    .default('Turkey'),
  
  companyId: z
    .string({ required_error: 'Firma seçimi zorunludur' })
    .min(1, { message: 'Firma seçimi zorunludur' }),
  
  status: z
    .enum(['active', 'inactive'], { 
      required_error: 'Durum seçimi zorunludur',
      invalid_type_error: 'Geçerli bir durum değeri seçiniz',
    })
    .default('active'),
  
  genderType: z
    .enum(['MALE', 'FEMALE', 'MIXED'], {
      required_error: 'Cinsiyet türü seçimi zorunludur',
      invalid_type_error: 'Geçerli bir cinsiyet türü seçiniz',
    })
    .default('MIXED'),
  
  openingDate: z
    .string()
    .optional(),
  
  internetSpeed: z
    .string()
    .max(50, { message: 'İnternet hızı en fazla 50 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  features: z
    .array(z.string())
    .default([]),
});

export type ApartmentFormData = z.infer<typeof apartmentSchema>;

export const apartmentDefaultValues: Partial<ApartmentFormData> = {
  name: '',
  address: '',
  city: '',
  zipCode: '',
  country: 'Turkey',
  status: 'active',
  genderType: 'MIXED',
  features: [],
};