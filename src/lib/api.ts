import { insforge } from './insforge';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3001' : 'https://yuanmai.preview.huawei-zeabur.cn');

export const api = {
  fetch: async (path: string, options: RequestInit = {}) => {
    const { data: { session } } = await insforge.auth.getCurrentSession();
    const token = session?.accessToken;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  }
};
