import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';

/**
 * Get the authentication token from cookies
 */
export const getServerAuthToken = (): string | null => {
  try {
    const cookieStore = cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Check if user is authenticated server-side
 */
export const isServerAuthenticated = (): boolean => {
  const token = getServerAuthToken();
  if (!token) return false;
  
  return !isTokenExpired(token);
};

/**
 * Get token expiration time
 */
export const getServerTokenExpirationTime = (): number | null => {
  const token = getServerAuthToken();
  
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp;
  } catch (error) {
    return null;
  }
}; 