import { z } from 'zod';

export const bedSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Yatak adı zorunludur' })
    .max(100, { message: 'Yatak adı en fazla 100 karakter olabilir' }),
  
  roomId: z
    .string({ required_error: 'Oda seçimi zorunludur' })
    .min(1, { message: 'Oda seçimi zorunludur' }),
  
  type: z
    .enum(['single', 'double', 'bunk', 'queen', 'king'], { 
      required_error: 'Yatak türü seçimi zorunludur',
      invalid_type_error: 'Geçerli bir yatak türü seçiniz',
    })
    .default('single'),
  
  location: z
    .string()
    .max(100, { message: 'Konum en fazla 100 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  
  features: z
    .array(z.string())
    .default([]),
  
  status: z
    .enum(['available', 'occupied', 'maintenance', 'reserved'], { 
      required_error: 'Durum seçimi zorunludur',
      invalid_type_error: 'Geçerli bir durum değeri seçiniz',
    })
    .default('available'),
});

export type BedFormData = z.infer<typeof bedSchema>;

export const bedDefaultValues: Partial<BedFormData> = {
  name: '',
  type: 'single',
  location: '',
  features: [],
  status: 'available',
};