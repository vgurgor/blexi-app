import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect } from 'react';
import { authApi, type LoginResponse } from './api/auth';

interface Tenant {
  id: number;
  name: string;
  slug: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  tenant_id: number;
  tenant: Tenant;
  role: string;
  permissions: string[];
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      tenant: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const response = await authApi.login(username, password);
          
          set({
            token: response.token,
            user: response.user,
            tenant: response.user.tenant,
            isAuthenticated: true,
          });

          return response;
        } catch (error: any) {
          set({ token: null, user: null, tenant: null, isAuthenticated: false });
          throw error;
        }
      },

      checkAuth: async () => {
        const state = get();
        if (!state.token) return false;

        try {
          const user = await authApi.me();
          
          set({ 
            user, 
            tenant: user.tenant,
            isAuthenticated: true 
          });
          return true;
        } catch (error) {
          set({ token: null, user: null, tenant: null, isAuthenticated: false });
          return false;
        }
      },

      logout: async () => {
        const state = get();
        try {
          if (state.token) {
            await authApi.logout();
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ token: null, user: null, tenant: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export const useAuth = () => {
  const store = authStore();
  
  useEffect(() => {
    const init = async () => {
      if (store.token && !store.isAuthenticated) {
        await store.checkAuth();
      }
    };
    init();
  }, [store]);

  return store;
};

export const getAuthToken = () => authStore.getState().token;
export const isAuthenticated = () => authStore.getState().isAuthenticated;
export const getUser = () => authStore.getState().user;
export const getTenant = () => authStore.getState().tenant;