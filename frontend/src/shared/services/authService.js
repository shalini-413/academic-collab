import { apiClient } from './apiClient';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  async register(payload) {
    const response = await apiClient.post('/api/auth/register', payload);
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  async updateProfile(payload) {
    const response = await apiClient.put('/api/auth/profile', payload);
    return response.data;
  }
};
