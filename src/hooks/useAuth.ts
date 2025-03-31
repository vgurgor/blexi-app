'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/context/ToastContext';
import { shouldRefreshToken } from '@/lib/auth';

export function useAuth() {
  const router = useRouter();
  const toast = useToast();
  const { 
    token, 
    user, 
    isAuthenticated, 
    isLoading, 
    error,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
    setError,
    refreshToken: storeRefreshToken,
  } = useAuthStore();

  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authApi.login(username, password);
        console.log('API yanıtı:', response);
        
        // API yanıtı başarılıysa ve data var ise
        if (response && response.success === true && response.data) {
          // Debug
          console.log('Login data:', JSON.stringify(response.data, null, 2));
          
          // API yanıtındaki iç içe yapıyı ele al
          // @ts-ignore - API yanıtının gerçek yapısını ele alıyoruz
          const nestedData = response.data;
          
          if (!nestedData) {
            console.error('API yanıt verisi bulunamadı:', response.data);
            setError('API yanıt verisi alınamadı');
            toast.error('Oturum bilgisi alınamadı');
            return false;
          }
          
          // @ts-ignore - Tip tanımlamasını aşıyoruz çünkü yanıt yapısı beklenenden farklı
          const tokenValue = nestedData.token;
          // @ts-ignore
          const userData = nestedData.user;
          
          if (!tokenValue) {
            console.error('Token bulunamadı:', nestedData);
            setError('Token alınamadı');
            toast.error('Oturum bilgisi alınamadı');
            return false;
          }
          
          console.log('Login başarılı, token alındı:', tokenValue.substring(0, 20) + '...');
          
          // Manuel olarak localStorage'a kaydet
          localStorage.setItem('blexi-auth-storage', JSON.stringify({
            state: {
              token: tokenValue,
              user: userData,
              isAuthenticated: true
            },
            version: 0
          }));
          
          // Store in Zustand state
          storeLogin(tokenValue, userData);
          
          // Also store token in cookie for server components and middleware
          const maxAge = 60 * 60 * 24 * 7; // 7 days
          
          // Development ortamında secure flag'i kaldır (localhost için)
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const secureFlag = isLocalhost ? '' : 'secure; ';
          
          // Cookie ayarla
          document.cookie = `auth_token=${tokenValue}; path=/; max-age=${maxAge}; SameSite=Lax; ${secureFlag}`;
          
          // Cookie ayarlandı mı kontrol et
          setTimeout(() => {
            const cookieExists = document.cookie.split(';').some(c => c.trim().startsWith('auth_token='));
            console.log('Cookie ayarlandı mı?:', cookieExists);
            console.log('Tüm çerezler:', document.cookie);
          }, 100);
          
          return true;
        } else {
          console.error('API isteği başarısız:', response);
          const errorMessage = response.error || (response as any).message || 'Giriş başarısız';
          setError(errorMessage);
          toast.error(errorMessage);
          return false;
        }
      } catch (error) {
        console.error('Login hatası:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Giriş sırasında bir hata oluştu';
        
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, storeLogin, toast]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authApi.register({
          name,
          email,
          password,
          password_confirmation: password,
          role: 'user'
        });
        
        if (response.success && response.data) {
          storeLogin(response.data.token, response.data.user);
          return true;
        } else {
          const errorMessage = response.error || 'Kayıt başarısız';
          setError(errorMessage);
          toast.error(errorMessage);
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Kayıt sırasında bir hata oluştu';
        
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, storeLogin, toast]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      if (token) {
        await authApi.logout();
      }
      
      // Clear state
      storeLogout();
      
      // Clear auth cookie
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Redirect to login
      router.push('/auth/login');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if API call fails, we should still log out locally
      storeLogout();
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push('/auth/login');
      return true;
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, storeLogout, router]);

  const refreshAuth = useCallback(async () => {
    if (!token) return false;
    
    try {
      const response = await authApi.refreshToken();
      
      if (response.success && response.data && response.data.token) {
        // Token değerini string'e çevirme
        const tokenValue = String(response.data.token);
        
        // Update token in store
        storeRefreshToken(tokenValue);
        
        // Update token in cookie
        const maxAge = 60 * 60 * 24 * 7; // 7 days
        
        // Development ortamında secure flag'i kaldır (localhost için)
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const secureFlag = isLocalhost ? '' : 'secure; ';
        
        // Cookie ayarla
        document.cookie = `auth_token=${tokenValue}; path=/; max-age=${maxAge}; SameSite=Lax; ${secureFlag}`;
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, [token, storeRefreshToken]);

  const checkAuth = useCallback(async () => {
    if (!token) return false;
    
    try {
      const response = await authApi.me();
      
      if (response.success && response.data) {
        return true;
      }
      
      // If auth check fails, log out
      storeLogout();
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      
      // If auth check fails with an error, log out
      storeLogout();
      return false;
    }
  }, [token, storeLogout]);

  // Automatically refresh token if needed
  useEffect(() => {
    if (isAuthenticated && token && shouldRefreshToken()) {
      refreshAuth();
    }
  }, [isAuthenticated, token, refreshAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    checkAuth,
    tenant: user?.tenant || null
  };
}