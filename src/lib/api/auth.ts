import { api } from './base';
import { ApiResponse } from '@/types/api';
import { IUser } from '@/types/models';

export interface AuthResponse {
  token: string;
  user: IUser;
}

export interface RefreshTokenResponse {
  token: string;
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

export async function login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
  return api.post<AuthResponse>('/auth/login', { username, password });
}

export async function register(name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  return api.post<AuthResponse>('/auth/register', { 
    name, 
    email, 
    password,
    password_confirmation: password 
  });
}

export async function logout(): Promise<ApiResponse<void>> {
  return api.post('/auth/logout', {});
}

export async function forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/auth/forgot-password', { email });
}

export async function resetPassword(params: ResetPasswordParams): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/auth/reset-password', params);
}

export async function changePassword(params: ChangePasswordParams): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/auth/change-password', params);
}

export async function refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
  return api.post<RefreshTokenResponse>('/auth/refresh');
}

export async function me(): Promise<ApiResponse<IUser>> {
  return api.get<IUser>('/auth/me');
}

export async function verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/auth/verify-email', { token });
}

export async function resendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>('/auth/resend-verification-email', {});
}