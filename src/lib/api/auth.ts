import { api } from './base';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    tenant_id: number;
    tenant: {
      id: number;
      name: string;
      slug: string;
    };
    role: string;
    permissions: string[];
  };
}

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data as LoginResponse;
  },

  logout: async () => {
    return api.post('/auth/logout', {});
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};