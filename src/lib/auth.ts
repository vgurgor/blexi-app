import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect } from 'react';

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

const API_URL = 'https://api.blexi.co/api/v1';

const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      tenant: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Giriş başarısız');
          }

          set({
            token: data.data.token,
            user: data.data.user,
            tenant: data.data.user.tenant,
            isAuthenticated: true,
          });

          return data.data;
        } catch (error: any) {
          set({ token: null, user: null, tenant: null, isAuthenticated: false });
          throw error;
        }
      },

      checkAuth: async () => {
        const state = get();
        if (!state.token) return false;

        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${state.token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            set({ token: null, user: null, tenant: null, isAuthenticated: false });
            return false;
          }

          set({ 
            user: data.data, 
            tenant: data.data.tenant,
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
            await fetch(`${API_URL}/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            });
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