import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IUser } from '@/types/models';
import { jwtDecode } from 'jwt-decode';
import { validateToken } from '@/lib/api/auth';

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
  checkAuth: () => Promise<boolean>;
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
    (set, get) => ({
      // State
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (token, user) => {
        console.log('AuthStore login çağrıldı, token:', token ? token.substring(0, 20) + '...' : 'Token yok!');
        
        // Set cookie for server-side access (expires in 30 days)
        if (isBrowser) {
          const expires = new Date();
          expires.setDate(expires.getDate() + 30);
          document.cookie = `auth_token=${token}; expires=${expires.toUTCString()}; path=/; samesite=strict`;
        }
        
        set({ 
          token, 
          user,
          isAuthenticated: true,
          error: null,
        });
      },
      
      logout: () => {
        console.log('AuthStore logout çağrıldı');
        
        // Clear cookie
        if (isBrowser) {
          document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        
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
        
        // Update cookie
        if (isBrowser) {
          const expires = new Date();
          expires.setDate(expires.getDate() + 30);
          document.cookie = `auth_token=${token}; expires=${expires.toUTCString()}; path=/; samesite=strict`;
        }
        
        set({ token });
      },
      
      checkAuth: async () => {
        const { token, isAuthenticated } = get();
        
        // If already authenticated and token exists, verify it's not expired
        if (isAuthenticated && token) {
          try {
            const decoded = jwtDecode<{ exp: number }>(token);
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (decoded.exp > currentTime) {
              return true;
            }
            
            // Token expired, clear it
            get().logout();
            return false;
          } catch (error) {
            console.error('Token decoding error:', error);
            get().logout();
            return false;
          }
        }
        
        // Try to get token from cookie if not in store
        if (!token && isBrowser) {
          try {
            const cookies = document.cookie.split('; ');
            const authCookie = cookies.find(row => row.startsWith('auth_token='));
            
            if (authCookie) {
              const cookieToken = authCookie.split('=')[1];
              if (cookieToken && cookieToken !== "undefined") {
                try {
                  // Verify the token is valid and not expired
                  const decoded = jwtDecode<{ exp: number; userId?: string }>(cookieToken);
                  const currentTime = Math.floor(Date.now() / 1000);
                  
                  if (decoded.exp > currentTime) {
                    // If token is valid, fetch user data and update store
                    if (decoded.userId) {
                      try {
                        set({ isLoading: true });
                        const response = await validateToken(cookieToken);
                        set({ 
                          token: cookieToken,
                          user: response.data,
                          isAuthenticated: true,
                          isLoading: false
                        });
                        return true;
                      } catch (error) {
                        console.error('User validation error:', error);
                        get().logout();
                        set({ isLoading: false });
                        return false;
                      }
                    }
                  } else {
                    // Token expired
                    get().logout();
                    return false;
                  }
                } catch (error) {
                  console.error('Cookie token decoding error:', error);
                  get().logout();
                  return false;
                }
              }
            }
          } catch (error) {
            console.error('Cookie reading error:', error);
          }
        }
        
        return false;
      },
    }),
    {
      name: 'blexi-auth-storage',
      storage: createJSONStorage(() => customStorage),
      skipHydration: false,
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);