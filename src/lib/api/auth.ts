import { api } from './base';
import { ApiResponse } from '@/types/api';
import { IUser } from '@/types/models';

// API yanıt tipleri
export interface AuthResponse {
  token: string;
  user: IUser;
}

export interface RefreshTokenResponse {
  token: string;
}

// API istek parametreleri
export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  surname: string;
  gender?: string;
  email: string;
  username?: string;
  password: string;
  password_confirmation: string;
  role: 'super-admin' | 'admin' | 'manager' | 'user';
  person_id?: number;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ResetPasswordParams {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordParams {
  current_password: string;
  password: string;
  password_confirmation: string;
}

/**
 * Kullanıcı girişi
 * 
 * @param username Kullanıcı adı
 * @param password Şifre
 * @returns JWT token ve kullanıcı bilgileri
 */
export async function login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
  return api.post<AuthResponse>('/api/v1/auth/login', { username, password });
}

/**
 * Yeni kullanıcı kaydı
 * 
 * @param params Kayıt parametreleri
 * @returns JWT token ve kullanıcı bilgileri
 */
export async function register(params: RegisterParams): Promise<ApiResponse<AuthResponse>> {
  return api.post<AuthResponse>('/api/v1/auth/register', params);
}

/**
 * Kullanıcı çıkışı
 * 
 * @returns Başarı durumu
 */
export async function logout(): Promise<ApiResponse<void>> {
  return api.post('/api/v1/auth/logout', {});
}

/**
 * Şifre sıfırlama isteği gönderir
 * 
 * @param email Kullanıcı e-posta adresi
 * @returns Bilgi mesajı
 */
export async function forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/api/v1/auth/forgot-password', { email });
}

/**
 * Şifre sıfırlama işlemi
 * 
 * @param params Şifre sıfırlama parametreleri
 * @returns Bilgi mesajı
 */
export async function resetPassword(params: ResetPasswordParams): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/api/v1/auth/reset-password', params);
}

/**
 * Şifre değiştirme işlemi
 * 
 * @param params Şifre değiştirme parametreleri
 * @returns Bilgi mesajı
 */
export async function changePassword(params: ChangePasswordParams): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/api/v1/auth/change-password', params);
}

/**
 * Token yenileme
 * 
 * @returns Yeni JWT token
 */
export async function refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
  return api.post<RefreshTokenResponse>('/api/v1/auth/refresh', {});
}

/**
 * Mevcut kullanıcı bilgilerini getirir
 * 
 * @returns Kullanıcı bilgileri
 */
export async function me(): Promise<ApiResponse<IUser>> {
  return api.get<IUser>('/api/v1/auth/me');
}

/**
 * E-posta adresini doğrular
 * 
 * @param token Doğrulama token'ı
 * @returns Bilgi mesajı
 */
export async function verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/api/v1/auth/verify-email', { token });
}

/**
 * Doğrulama e-postasını yeniden gönderir
 * 
 * @returns Bilgi mesajı
 */
export async function resendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/api/v1/auth/resend-verification-email', {});
}