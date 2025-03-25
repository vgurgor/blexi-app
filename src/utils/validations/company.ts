import { z } from 'zod';
import { isValidEmail, isValidPhoneNumber } from '../validation';

export const companySchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Firma adı en az 3 karakter olmalıdır' })
    .max(100, { message: 'Firma adı en fazla 100 karakter olabilir' }),
  
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
  
  contactPerson: z
    .string()
    .min(2, { message: 'İlgili kişi adı en az 2 karakter olmalıdır' })
    .max(100, { message: 'İlgili kişi adı en fazla 100 karakter olabilir' }),
  
  email: z
    .string()
    .min(1, { message: 'E-posta adresi zorunludur' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz' })
    .refine(isValidEmail, { message: 'Geçerli bir e-posta adresi giriniz' }),
  
  phone: z
    .string()
    .min(10, { message: 'Telefon numarası en az 10 karakter olmalıdır' })
    .max(15, { message: 'Telefon numarası en fazla 15 karakter olabilir' })
    .refine(isValidPhoneNumber, { message: 'Geçerli bir telefon numarası giriniz' }),
  
  status: z
    .enum(['active', 'inactive'], { 
      required_error: 'Durum seçimi zorunludur',
      invalid_type_error: 'Geçerli bir durum değeri seçiniz',
    })
    .default('active'),
});

export type CompanyFormData = z.infer<typeof companySchema>;

export const companyDefaultValues: Partial<CompanyFormData> = {
  name: '',
  address: '',
  city: '',
  zipCode: '',
  country: 'Turkey',
  contactPerson: '',
  email: '',
  phone: '',
  status: 'active',
};