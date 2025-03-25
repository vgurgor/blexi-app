'use client';

import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/store/authStore';

/**
 * Get the authentication token from the store or document.cookie
 */
export const getAuthToken = (): string | null => {
  // First try to get from store (client-side)
  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;
  
  // Try to read from document.cookie directly
  try {
    const cookies = document.cookie.split('; ');
    const authCookie = cookies.find(row => row.startsWith('auth_token='));
    if (authCookie) {
      const token = authCookie.split('=')[1];
      // "undefined" string değerini kontrol et
      if (token && token !== "undefined") {
        return token;
      }
    }
    return null;
  } catch (e) {
    console.error('Cookie okuma hatası:', e);
    return null;
  }
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const { token, isAuthenticated } = useAuthStore.getState();
  
  if (!token) return false;
  
  // Check if token is expired
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      // Token is expired, log user out
      useAuthStore.getState().logout();
      return false;
    }
    
    return isAuthenticated;
  } catch (error) {
    // If token can't be decoded, log user out
    useAuthStore.getState().logout();
    return false;
  }
};

/**
 * Get the authenticated user
 */
export const getUser = () => {
  return useAuthStore.getState().user;
};

/**
 * Get user's role
 */
export const getUserRole = (): string | null => {
  const user = getUser();
  return user ? user.role : null;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role: string | string[]): boolean => {
  const userRole = getUserRole();
  
  if (!userRole) return false;
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  
  return userRole === role;
};

/**
 * Calculate token expiration time
 */
export const getTokenExpirationTime = (): number | null => {
  const token = getAuthToken();
  
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp;
  } catch (error) {
    return null;
  }
};

/**
 * Get the remaining time before token expires (in seconds)
 */
export const getTokenRemainingTime = (): number | null => {
  const expTime = getTokenExpirationTime();
  
  if (!expTime) return null;
  
  const currentTime = Date.now() / 1000;
  const remainingTime = expTime - currentTime;
  
  return remainingTime > 0 ? Math.floor(remainingTime) : 0;
};

/**
 * Check if token needs refresh (< 5 minutes remaining)
 */
export const shouldRefreshToken = (): boolean => {
  const remainingTime = getTokenRemainingTime();
  
  if (remainingTime === null) return false;
  
  // Refresh if less than 5 minutes remaining
  return remainingTime < 300;
};