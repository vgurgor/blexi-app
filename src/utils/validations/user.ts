import { z } from 'zod';
import { isValidEmail, isStrongPassword } from '../validation';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'Kullanıcı adı zorunludur' })
    .min(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır' })
    .max(30, { message: 'Kullanıcı adı en fazla 30 karakter olabilir' }),
  
  password: z
    .string()
    .min(1, { message: 'Şifre zorunludur' })
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
  
  rememberMe: z
    .boolean()
    .default(false),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'İsim en az 3 karakter olmalıdır' })
    .max(100, { message: 'İsim en fazla 100 karakter olabilir' }),
  
  email: z
    .string()
    .min(1, { message: 'E-posta adresi zorunludur' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz' })
    .refine(isValidEmail, { message: 'Geçerli bir e-posta adresi giriniz' }),
  
  password: z
    .string()
    .min(1, { message: 'Şifre zorunludur' })
    .min(8, { message: 'Şifre en az 8 karakter olmalıdır' })
    .refine(isStrongPassword, { 
      message: 'Şifre en az 8 karakter olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir' 
    }),
  
  confirmPassword: z
    .string()
    .min(1, { message: 'Şifre tekrarı zorunludur' }),
    
  terms: z
    .boolean()
    .refine(value => value === true, { message: 'Kullanım şartlarını kabul etmelisiniz' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-posta adresi zorunludur' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz' })
    .refine(isValidEmail, { message: 'Geçerli bir e-posta adresi giriniz' }),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, { message: 'Şifre zorunludur' })
    .min(8, { message: 'Şifre en az 8 karakter olmalıdır' })
    .refine(isStrongPassword, { 
      message: 'Şifre en az 8 karakter olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir' 
    }),
  
  confirmPassword: z
    .string()
    .min(1, { message: 'Şifre tekrarı zorunludur' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: 'Mevcut şifre zorunludur' }),
  
  newPassword: z
    .string()
    .min(1, { message: 'Yeni şifre zorunludur' })
    .min(8, { message: 'Şifre en az 8 karakter olmalıdır' })
    .refine(isStrongPassword, { 
      message: 'Şifre en az 8 karakter olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir' 
    }),
  
  confirmPassword: z
    .string()
    .min(1, { message: 'Şifre tekrarı zorunludur' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'Yeni şifre mevcut şifre ile aynı olamaz',
  path: ['newPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;