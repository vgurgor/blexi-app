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

// Check if we're running on the client side
const isBrowser = typeof window !== 'undefined';

// Custom storage implementation that safely handles SSR
const customStorage = {
  getItem: (name: string): string | null => {
    if (!isBrowser) return null;
    
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.warn(`Error reading ${name} from localStorage:`, error);
      return null;
    }
  },
  
  setItem: (name: string, value: string): void => {
    if (!isBrowser) return;
    
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn(`Error writing ${name} to localStorage:`, error);
    }
  },
  
  removeItem: (name: string): void => {
    if (!isBrowser) return;
    
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.warn(`Error removing ${name} from localStorage:`, error);
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
      storage: createJSONStorage(() => customStorage),
      skipHydration: true,
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);