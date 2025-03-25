import { z } from 'zod';

export const roomSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Oda adı zorunludur' })
    .max(100, { message: 'Oda adı en fazla 100 karakter olabilir' }),
  
  apartmentId: z
    .string({ required_error: 'Apart seçimi zorunludur' })
    .min(1, { message: 'Apart seçimi zorunludur' }),
  
  size: z
    .number({ 
      required_error: 'Oda büyüklüğü zorunludur',
      invalid_type_error: 'Oda büyüklüğü sayı olmalıdır'
    })
    .min(1, { message: 'Oda büyüklüğü en az 1 m² olmalıdır' })
    .max(1000, { message: 'Oda büyüklüğü en fazla 1000 m² olabilir' })
    .or(z.string().regex(/^\d+$/).transform(Number)),
  
  capacity: z
    .number({ 
      required_error: 'Kapasite zorunludur',
      invalid_type_error: 'Kapasite sayı olmalıdır'
    })
    .min(1, { message: 'Kapasite en az 1 kişi olmalıdır' })
    .max(20, { message: 'Kapasite en fazla 20 kişi olabilir' })
    .default(1)
    .or(z.string().regex(/^\d+$/).transform(Number)),
  
  floor: z
    .number({ 
      invalid_type_error: 'Kat sayı olmalıdır'
    })
    .int({ message: 'Kat tam sayı olmalıdır' })
    .min(-5, { message: 'Kat en az -5 olabilir' })
    .max(100, { message: 'Kat en fazla 100 olabilir' })
    .default(0)
    .or(z.string().regex(/^-?\d+$/).transform(Number))
    .optional(),
  
  hasBalcony: z
    .boolean()
    .default(false),
  
  hasWindow: z
    .boolean()
    .default(true),
  
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

export type RoomFormData = z.infer<typeof roomSchema>;

export const roomDefaultValues: Partial<RoomFormData> = {
  name: '',
  size: 0,
  capacity: 1,
  floor: 0,
  hasBalcony: false,
  hasWindow: true,
  features: [],
  status: 'available',
};