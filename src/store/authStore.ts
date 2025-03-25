import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IUser } from '@/types/models';

interface AuthState {
  token: string | null;
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (token: string, user: IUser) => void;
  logout: () => void;
  setUser: (user: IUser) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  refreshToken: (token: string) => void;
}

export type AuthStore = AuthState & AuthActions;

// localStorage'ı güvenli bir şekilde kontrol et
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage kullanılamıyor:', e);
    return false;
  }
};

// Güvenli localStorage
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    if (isLocalStorageAvailable()) {
      try {
        return localStorage.getItem(name);
      } catch (e) {
        console.error(`${name} localStorage'dan alınamadı:`, e);
      }
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(name, value);
        console.log(`${name} localStorage'a kaydedildi.`);
      } catch (e) {
        console.error(`${name} localStorage'a kaydedilemedi:`, e);
      }
    }
  },
  removeItem: (name: string): void => {
    if (isLocalStorageAvailable()) {
      try {
        localStorage.removeItem(name);
      } catch (e) {
        console.error(`${name} localStorage'dan silinemedi:`, e);
      }
    }
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (token, user) => {
        console.log('AuthStore login çağrıldı, token:', token ? token.substring(0, 20) + '...' : 'Token yok!');
        set({ 
          token, 
          user,
          isAuthenticated: true,
          error: null,
        });
      },
      
      logout: () => {
        console.log('AuthStore logout çağrıldı');
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false,
          error: null,
        });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      setLoading: (isLoading) => {
        set({ isLoading });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      refreshToken: (token) => {
        console.log('AuthStore refreshToken çağrıldı');
        set({ token });
      },
    }),
    {
      name: 'blexi-auth-storage',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Zustand store hydrated:', state.isAuthenticated ? 'Authenticated' : 'Not authenticated');
        } else {
          console.log('Zustand hydration başarısız oldu');
        }
      }
    }
  )
);